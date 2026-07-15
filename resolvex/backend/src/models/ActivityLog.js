const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: { type: String, required: true }, // e.g. 'LOGIN', 'COMPLAINT_CREATED', 'STATUS_UPDATED'
    entityType: { type: String, default: '' }, // e.g. 'Complaint', 'User'
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    description: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
