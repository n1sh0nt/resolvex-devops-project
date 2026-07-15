const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// Fire-and-forget audit log entry. Never throws - logging failures shouldn't break requests.
const logActivity = async ({ user, action, entityType, entityId, description, req, metadata }) => {
  try {
    await ActivityLog.create({
      user: user || null,
      action,
      entityType: entityType || '',
      entityId: entityId || null,
      description: description || '',
      ipAddress: req ? req.ip : '',
      userAgent: req ? req.headers['user-agent'] : '',
      metadata: metadata || {},
    });
  } catch (err) {
    console.error('[activityService] Failed to write activity log:', err.message);
  }
};

const notifyUser = async ({ recipient, title, message, type, relatedComplaint }) => {
  try {
    return await Notification.create({
      recipient,
      title,
      message,
      type: type || 'system',
      relatedComplaint: relatedComplaint || null,
    });
  } catch (err) {
    console.error('[activityService] Failed to create notification:', err.message);
    return null;
  }
};

const notifyManyUsers = async (recipients, { title, message, type, relatedComplaint }) => {
  try {
    const docs = recipients.map((recipient) => ({
      recipient,
      title,
      message,
      type: type || 'broadcast',
      relatedComplaint: relatedComplaint || null,
    }));
    return await Notification.insertMany(docs);
  } catch (err) {
    console.error('[activityService] Failed to create bulk notifications:', err.message);
    return [];
  }
};

module.exports = { logActivity, notifyUser, notifyManyUsers };
