const crypto = require('crypto');
const User = require('../models/User');
const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../services/emailService');
const { logActivity } = require('../services/activityService');

const sendAuthResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (Number(process.env.JWT_COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('token', token, cookieOptions);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

// @desc    Register a new user (student/faculty self-register; staff/admin created by admin)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, studentId, employeeId, department } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Public self-registration is limited to student/faculty; staff/admin require admin creation
  const allowedSelfRoles = ['student', 'faculty'];
  const finalRole = allowedSelfRoles.includes(role) ? role : 'student';

  let departmentDoc = null;
  if (department) {
    departmentDoc = await Department.findById(department);
    if (!departmentDoc) throw new ApiError(400, 'Selected department does not exist.');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: finalRole,
    phone,
    studentId,
    employeeId,
    department: departmentDoc ? departmentDoc._id : undefined,
  });

  const verifyToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  await sendVerificationEmail(user.email, user.name, verifyUrl);

  await logActivity({
    user: user._id,
    action: 'USER_REGISTERED',
    entityType: 'User',
    entityId: user._id,
    description: `${user.name} registered as ${user.role}`,
    req,
  });

  sendAuthResponse(user, 201, res);
});

// @desc    Log in with email/password
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Please provide both email and password.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact an administrator.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  await logActivity({
    user: user._id,
    action: 'LOGIN',
    entityType: 'User',
    entityId: user._id,
    description: `${user.name} logged in`,
    req,
  });

  sendAuthResponse(user, 200, res);
});

// @desc    Log out (clear cookie)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name');
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Verify email using token from email link
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpire');

  if (!user) {
    throw new ApiError(400, 'Verification link is invalid or has expired.');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    // Don't leak whether an account exists
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a verification link has been sent.',
    });
  }
  if (user.isEmailVerified) {
    return res.status(200).json({ success: true, message: 'This email is already verified.' });
  }

  const verifyToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  await sendVerificationEmail(user.email, user.name, verifyUrl);

  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a verification link has been sent.',
  });
});

// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  // Always return a generic response to avoid user enumeration
  const genericResponse = {
    success: true,
    message: 'If an account exists with this email, a password reset link has been sent.',
  };

  if (!user) return res.status(200).json(genericResponse);

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendPasswordResetEmail(user.email, user.name, resetUrl);

  res.status(200).json(genericResponse);
});

// @desc    Reset password using token from email link
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long.');
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    throw new ApiError(400, 'Reset link is invalid or has expired.');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  await logActivity({
    user: user._id,
    action: 'PASSWORD_RESET',
    entityType: 'User',
    entityId: user._id,
    description: `${user.name} reset their password`,
    req,
  });

  sendAuthResponse(user, 200, res);
});

// @desc    Change password while logged in
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters long.');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  sendAuthResponse(user, 200, res);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updatePassword,
};
