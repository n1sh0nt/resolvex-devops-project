const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/apiFeatures');
const { logActivity, notifyUser } = require('../services/activityService');
const { sendComplaintStatusEmail, sendAssignmentEmail } = require('../services/emailService');
const { normalizeUploadedFile } = require('../middleware/upload');

// @desc    Submit a new complaint (student/faculty)
// @route   POST /api/complaints
// @access  Private
const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, priority, location, department } = req.body;

  if (!title || !description || !category) {
    throw new ApiError(400, 'Title, description, and category are required.');
  }

  let departmentId = department || null;
  if (!departmentId) {
    // Auto-route to a department that handles this category, if one exists
    const matched = await Department.findOne({ categories: category, isActive: true });
    if (matched) departmentId = matched._id;
  }

  const images = (req.files || []).map(normalizeUploadedFile);

  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority: priority || 'Medium',
    location,
    department: departmentId,
    images,
    submittedBy: req.user._id,
    status: 'Pending',
  });

  await logActivity({
    user: req.user._id,
    action: 'COMPLAINT_CREATED',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `${req.user.name} submitted complaint ${complaint.ticketId}`,
    req,
  });

  res.status(201).json({ success: true, complaint });
});

// @desc    Get complaints (role-scoped: student/faculty see own, staff sees dept, admin sees all)
// @route   GET /api/complaints
// @access  Private
const getComplaints = asyncHandler(async (req, res) => {
  let scopeFilter = {};
  if (['student', 'faculty'].includes(req.user.role)) {
    scopeFilter = { submittedBy: req.user._id };
  } else if (req.user.role === 'staff') {
    scopeFilter = req.user.department
      ? { department: req.user.department }
      : { assignedTo: req.user._id };
  }
  // admin: no scope filter, sees everything

  const baseQuery = Complaint.find(scopeFilter);
  const features = new ApiFeatures(baseQuery, req.query)
    .filter()
    .search(['title', 'description', 'ticketId'])
    .sort()
    .limitFields()
    .paginate();

  const [complaints, total] = await Promise.all([
    features.query
      .populate('submittedBy', 'name email role')
      .populate('department', 'name')
      .populate('assignedTo', 'name email'),
    Complaint.countDocuments(scopeFilter),
  ]);

  res.status(200).json({
    success: true,
    count: complaints.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    complaints,
  });
});

// Helper: ensure the requesting user is allowed to view/act on this complaint
const assertComplaintAccess = (complaint, user) => {
  if (user.role === 'admin') return;
  if (['student', 'faculty'].includes(user.role)) {
    if (String(complaint.submittedBy._id || complaint.submittedBy) !== String(user._id)) {
      throw new ApiError(403, 'You do not have access to this complaint.');
    }
    return;
  }
  if (user.role === 'staff') {
    const sameDept =
      complaint.department &&
      String(complaint.department._id || complaint.department) === String(user.department);
    const assignedToMe =
      complaint.assignedTo && String(complaint.assignedTo._id || complaint.assignedTo) === String(user._id);
    if (!sameDept && !assignedToMe) {
      throw new ApiError(403, 'You do not have access to this complaint.');
    }
  }
};

// @desc    Get single complaint with full timeline
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('submittedBy', 'name email role phone')
    .populate('department', 'name')
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email')
    .populate('timeline.changedBy', 'name role');

  if (!complaint) throw new ApiError(404, 'Complaint not found.');

  assertComplaintAccess(complaint, req.user);

  res.status(200).json({ success: true, complaint });
});

// @desc    Assign a complaint to a department/staff member (admin)
// @route   PUT /api/complaints/:id/assign
// @access  Private/Admin
const assignComplaint = asyncHandler(async (req, res) => {
  const { department, assignedTo } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, 'Complaint not found.');

  if (department) complaint.department = department;

  if (assignedTo) {
    const staffMember = await User.findById(assignedTo);
    if (!staffMember || staffMember.role !== 'staff') {
      throw new ApiError(400, 'assignedTo must reference a valid staff user.');
    }
    complaint.assignedTo = staffMember._id;
  }

  complaint.assignedBy = req.user._id;
  complaint.assignedAt = new Date();
  complaint.status = 'Assigned';
  complaint.timeline.push({
    status: 'Assigned',
    note: `Assigned by ${req.user.name}`,
    changedBy: req.user._id,
  });

  await complaint.save();

  const submitter = await User.findById(complaint.submittedBy);
  await notifyUser({
    recipient: complaint.submittedBy,
    title: 'Complaint assigned',
    message: `Your complaint ${complaint.ticketId} has been assigned and is being processed.`,
    type: 'complaint_update',
    relatedComplaint: complaint._id,
  });
  if (submitter) {
    await sendComplaintStatusEmail(submitter.email, submitter.name, complaint.ticketId, 'Assigned');
  }

  if (assignedTo) {
    const staffMember = await User.findById(assignedTo);
    await notifyUser({
      recipient: assignedTo,
      title: 'New complaint assigned to you',
      message: `Complaint ${complaint.ticketId} - "${complaint.title}" has been assigned to you.`,
      type: 'assignment',
      relatedComplaint: complaint._id,
    });
    if (staffMember) {
      await sendAssignmentEmail(staffMember.email, staffMember.name, complaint.ticketId, complaint.title);
    }
  }

  await logActivity({
    user: req.user._id,
    action: 'COMPLAINT_ASSIGNED',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `${req.user.name} assigned complaint ${complaint.ticketId}`,
    req,
  });

  res.status(200).json({ success: true, complaint });
});

// @desc    Update complaint status (staff/admin), optionally with resolution images/remarks
// @route   PUT /api/complaints/:id/status
// @access  Private/Staff/Admin
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  const complaint = await Complaint.findById(req.params.id).populate('department');
  if (!complaint) throw new ApiError(404, 'Complaint not found.');

  assertComplaintAccess(complaint, req.user);

  complaint.status = status;
  if (note) complaint.resolutionRemarks = note;

  if (req.files && req.files.length > 0) {
    const resolutionImages = req.files.map(normalizeUploadedFile);
    complaint.resolutionImages.push(...resolutionImages);
  }

  if (status === 'Resolved') complaint.resolvedAt = new Date();
  if (status === 'Closed') complaint.closedAt = new Date();

  complaint.timeline.push({
    status,
    note: note || `Status changed to ${status} by ${req.user.name}`,
    changedBy: req.user._id,
  });

  await complaint.save();

  const submitter = await User.findById(complaint.submittedBy);
  await notifyUser({
    recipient: complaint.submittedBy,
    title: `Complaint ${status}`,
    message: `Your complaint ${complaint.ticketId} is now marked as ${status}.`,
    type: 'complaint_update',
    relatedComplaint: complaint._id,
  });
  if (submitter) {
    await sendComplaintStatusEmail(submitter.email, submitter.name, complaint.ticketId, status, note);
  }

  await logActivity({
    user: req.user._id,
    action: 'COMPLAINT_STATUS_UPDATED',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `${req.user.name} changed complaint ${complaint.ticketId} to ${status}`,
    req,
  });

  res.status(200).json({ success: true, complaint });
});

// @desc    Delete a complaint (admin only, or student before it's processed)
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, 'Complaint not found.');

  const isOwner = String(complaint.submittedBy) === String(req.user._id);
  const canDelete = req.user.role === 'admin' || (isOwner && complaint.status === 'Pending');
  if (!canDelete) {
    throw new ApiError(403, 'This complaint can no longer be deleted.');
  }

  await complaint.deleteOne();

  await logActivity({
    user: req.user._id,
    action: 'COMPLAINT_DELETED',
    entityType: 'Complaint',
    entityId: complaint._id,
    description: `${req.user.name} deleted complaint ${complaint.ticketId}`,
    req,
  });

  res.status(200).json({ success: true, message: 'Complaint deleted successfully.' });
});

// @desc    Get complaint stats for the logged-in user's dashboard (student/faculty)
// @route   GET /api/complaints/my-stats
// @access  Private
const getMyStats = asyncHandler(async (req, res) => {
  const filter = { submittedBy: req.user._id };
  const [total, pending, resolved, recent] = await Promise.all([
    Complaint.countDocuments(filter),
    Complaint.countDocuments({ ...filter, status: 'Pending' }),
    Complaint.countDocuments({ ...filter, status: { $in: ['Resolved', 'Closed'] } }),
    Complaint.find(filter).sort('-createdAt').limit(5).populate('department', 'name'),
  ]);

  res.status(200).json({ success: true, total, pending, resolved, recent });
});

module.exports = {
  createComplaint,
  getComplaints,
  getComplaint,
  assignComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getMyStats,
};
