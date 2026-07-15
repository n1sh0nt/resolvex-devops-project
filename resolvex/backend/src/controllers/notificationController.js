const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { notifyManyUsers, logActivity } = require('../services/activityService');
const { sendBroadcastEmail } = require('../services/emailService');

// @desc    Get logged-in user's notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const filter = { recipient: req.user._id };
  if (req.query.unreadOnly === 'true') filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    page,
    pages: Math.ceil(total / limit),
    notifications,
  });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });
  if (!notification) throw new ApiError(404, 'Notification not found.');

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ success: true, notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );
  res.status(200).json({ success: true, message: 'All notifications marked as read.' });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });
  if (!notification) throw new ApiError(404, 'Notification not found.');
  res.status(200).json({ success: true, message: 'Notification deleted.' });
});

// @desc    Send a broadcast notification/email to a role or all users (admin)
// @route   POST /api/notifications/broadcast
// @access  Private/Admin
const sendBroadcast = asyncHandler(async (req, res) => {
  const { title, message, role } = req.body;
  if (!title || !message) throw new ApiError(400, 'Title and message are required.');

  const userFilter = { isActive: true };
  if (role && role !== 'all') userFilter.role = role;

  const recipients = await User.find(userFilter).select('_id name email');
  if (recipients.length === 0) {
    throw new ApiError(404, 'No matching users found to notify.');
  }

  await notifyManyUsers(
    recipients.map((r) => r._id),
    { title, message, type: 'broadcast' }
  );

  // Send emails in the background without blocking the response
  Promise.all(recipients.map((r) => sendBroadcastEmail(r.email, r.name, title, message))).catch(
    (err) => console.error('[notificationController] Broadcast email error:', err.message)
  );

  await logActivity({
    user: req.user._id,
    action: 'BROADCAST_SENT',
    description: `Admin ${req.user.name} broadcast "${title}" to ${recipients.length} user(s)`,
    req,
  });

  res.status(200).json({
    success: true,
    message: `Notification sent to ${recipients.length} user(s).`,
  });
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBroadcast,
};
