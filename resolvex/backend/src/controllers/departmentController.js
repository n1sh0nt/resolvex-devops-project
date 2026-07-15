const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../services/activityService');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate('head', 'name email');
  res.status(200).json({ success: true, count: departments.length, departments });
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate('head', 'name email');
  if (!department) throw new ApiError(404, 'Department not found.');
  res.status(200).json({ success: true, department });
});

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, categories, head } = req.body;

  const existing = await Department.findOne({ name });
  if (existing) throw new ApiError(409, 'A department with this name already exists.');

  const department = await Department.create({ name, description, categories, head });

  await logActivity({
    user: req.user._id,
    action: 'DEPARTMENT_CREATED',
    entityType: 'Department',
    entityId: department._id,
    description: `Admin ${req.user.name} created department ${department.name}`,
    req,
  });

  res.status(201).json({ success: true, department });
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'description', 'categories', 'head', 'isActive'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const department = await Department.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!department) throw new ApiError(404, 'Department not found.');

  await logActivity({
    user: req.user._id,
    action: 'DEPARTMENT_UPDATED',
    entityType: 'Department',
    entityId: department._id,
    description: `Admin ${req.user.name} updated department ${department.name}`,
    req,
  });

  res.status(200).json({ success: true, department });
});

// @desc    Delete a department (blocked if complaints reference it)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw new ApiError(404, 'Department not found.');

  const linkedComplaints = await Complaint.countDocuments({ department: department._id });
  if (linkedComplaints > 0) {
    department.isActive = false;
    await department.save();
    return res.status(200).json({
      success: true,
      message: `Department has ${linkedComplaints} linked complaint(s); it was deactivated instead of deleted.`,
    });
  }

  await department.deleteOne();

  await logActivity({
    user: req.user._id,
    action: 'DEPARTMENT_DELETED',
    entityType: 'Department',
    entityId: department._id,
    description: `Admin ${req.user.name} deleted department ${department.name}`,
    req,
  });

  res.status(200).json({ success: true, message: 'Department deleted successfully.' });
});

module.exports = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
