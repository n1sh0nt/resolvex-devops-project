const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/apiFeatures');
const { logActivity } = require('../services/activityService');
const { normalizeUploadedFile, cloudinaryEnabled } = require('../middleware/upload');
const { cloudinary } = require('../config/cloudinary');

// @desc    Update own profile (name, phone, studentId, employeeId)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'studentId', 'employeeId'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Upload/update own avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided.');

  const user = await User.findById(req.user._id);

  // Clean up old avatar if using Cloudinary
  if (cloudinaryEnabled && user.avatar?.publicId) {
    await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
  }

  user.avatar = normalizeUploadedFile(req.file);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Get all users with filter/search/pagination (admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const baseQuery = User.find();
  const features = new ApiFeatures(baseQuery, req.query)
    .filter()
    .search(['name', 'email'])
    .sort()
    .limitFields()
    .paginate();

  const [users, total] = await Promise.all([
    features.query.populate('department', 'name'),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    users,
  });
});

// @desc    Get single user by ID (admin)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('department', 'name');
  if (!user) throw new ApiError(404, 'User not found.');
  res.status(200).json({ success: true, user });
});

// @desc    Create a user directly (admin) - e.g. staff or admin accounts
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department, employeeId, studentId } = req.body;

  const existing = await User.findOne({ email: email?.toLowerCase() });
  if (existing) throw new ApiError(409, 'A user with this email already exists.');

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
    phone,
    department: department || undefined,
    employeeId,
    studentId,
    isEmailVerified: true, // admin-created accounts are pre-verified
  });

  await logActivity({
    user: req.user._id,
    action: 'USER_CREATED_BY_ADMIN',
    entityType: 'User',
    entityId: user._id,
    description: `Admin ${req.user.name} created user ${user.name} (${user.role})`,
    req,
  });

  res.status(201).json({ success: true, user: user.toSafeObject() });
});

// @desc    Update any user's role/department/status (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'role', 'department', 'isActive', 'phone', 'employeeId', 'studentId'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, 'User not found.');

  await logActivity({
    user: req.user._id,
    action: 'USER_UPDATED_BY_ADMIN',
    entityType: 'User',
    entityId: user._id,
    description: `Admin ${req.user.name} updated user ${user.name}`,
    req,
  });

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Delete (deactivate) a user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  if (String(user._id) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot delete your own account.');
  }

  // Soft delete to preserve complaint history integrity
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  await logActivity({
    user: req.user._id,
    action: 'USER_DEACTIVATED',
    entityType: 'User',
    entityId: user._id,
    description: `Admin ${req.user.name} deactivated user ${user.name}`,
    req,
  });

  res.status(200).json({ success: true, message: 'User deactivated successfully.' });
});

// @desc    List staff for a given department (used when assigning complaints)
// @route   GET /api/users/department/:departmentId/staff
// @access  Private/Admin/Staff
const getDepartmentStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({
    department: req.params.departmentId,
    role: 'staff',
    isActive: true,
  }).select('name email');
  res.status(200).json({ success: true, staff });
});

module.exports = {
  updateProfile,
  updateAvatar,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getDepartmentStaff,
};
