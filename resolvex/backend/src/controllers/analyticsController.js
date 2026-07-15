const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');
const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Admin dashboard summary (totals, status breakdown, monthly trend, top departments)
// @route   GET /api/analytics/admin-dashboard
// @access  Private/Admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalComplaints,
    statusBreakdown,
    departmentBreakdown,
    monthlyTrend,
    avgRatingResult,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Complaint.countDocuments(),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([
      { $match: { department: { $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { name: '$dept.name', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),
    Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
  ]);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  res.status(200).json({
    success: true,
    totalUsers,
    totalComplaints,
    statusBreakdown: statusBreakdown.map((s) => ({ status: s._id, count: s.count })),
    departmentBreakdown,
    mostActiveDepartments: departmentBreakdown.slice(0, 5),
    monthlyTrend: monthlyTrend.map((m) => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      count: m.count,
    })),
    averageFeedbackRating: avgRatingResult[0]?.avg?.toFixed(2) || 0,
  });
});

// @desc    Department-scoped dashboard for staff
// @route   GET /api/analytics/department-dashboard
// @access  Private/Staff
const getDepartmentDashboard = asyncHandler(async (req, res) => {
  const deptFilter = req.user.department ? { department: req.user.department } : { assignedTo: req.user._id };

  const [assigned, pending, inProgress, completed] = await Promise.all([
    Complaint.countDocuments({ ...deptFilter }),
    Complaint.countDocuments({ ...deptFilter, status: { $in: ['Pending', 'Assigned'] } }),
    Complaint.countDocuments({ ...deptFilter, status: 'In Progress' }),
    Complaint.countDocuments({ ...deptFilter, status: { $in: ['Resolved', 'Closed'] } }),
  ]);

  res.status(200).json({ success: true, assigned, pending, inProgress, completed });
});

// @desc    Export complaints report as Excel
// @route   GET /api/analytics/export/excel
// @access  Private/Admin
const exportExcel = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find()
    .populate('submittedBy', 'name email')
    .populate('department', 'name')
    .populate('assignedTo', 'name')
    .sort('-createdAt');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Complaints Report');

  sheet.columns = [
    { header: 'Ticket ID', key: 'ticketId', width: 16 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Submitted By', key: 'submittedBy', width: 24 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Assigned To', key: 'assignedTo', width: 20 },
    { header: 'Created At', key: 'createdAt', width: 20 },
    { header: 'Resolved At', key: 'resolvedAt', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };

  complaints.forEach((c) => {
    sheet.addRow({
      ticketId: c.ticketId,
      title: c.title,
      category: c.category,
      status: c.status,
      priority: c.priority,
      submittedBy: c.submittedBy?.name || 'N/A',
      department: c.department?.name || 'Unassigned',
      assignedTo: c.assignedTo?.name || 'Unassigned',
      createdAt: c.createdAt.toISOString().slice(0, 10),
      resolvedAt: c.resolvedAt ? c.resolvedAt.toISOString().slice(0, 10) : '',
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=resolvex-complaints-report.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export complaints report as PDF
// @route   GET /api/analytics/export/pdf
// @access  Private/Admin
const exportPDF = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find()
    .populate('submittedBy', 'name')
    .populate('department', 'name')
    .sort('-createdAt')
    .limit(500);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=resolvex-complaints-report.pdf');

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(res);

  doc.fontSize(18).text('ResolveX - Complaints Report', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#6b7280').text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(1);
  doc.fillColor('#000000');

  complaints.forEach((c, idx) => {
    if (idx > 0) doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#1e3a8a').text(`${c.ticketId} - ${c.title}`);
    doc
      .fontSize(9)
      .fillColor('#374151')
      .text(
        `Category: ${c.category}  |  Status: ${c.status}  |  Priority: ${c.priority}  |  Submitted by: ${
          c.submittedBy?.name || 'N/A'
        }  |  Department: ${c.department?.name || 'Unassigned'}  |  Created: ${c.createdAt
          .toISOString()
          .slice(0, 10)}`
      );
    doc.moveTo(doc.x, doc.y + 4).lineTo(555, doc.y + 4).strokeColor('#e5e7eb').stroke();

    if (doc.y > 750) doc.addPage();
  });

  doc.end();
});

module.exports = {
  getAdminDashboard,
  getDepartmentDashboard,
  exportExcel,
  exportPDF,
};
