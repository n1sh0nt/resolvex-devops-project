const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Get audit/activity logs with pagination and filtering
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
const getActivityLogs = asyncHandler(async (req, res) => {
  const baseQuery = ActivityLog.find();
  const features = new ApiFeatures(baseQuery, req.query).filter().sort().paginate();

  const [logs, total] = await Promise.all([
    features.query.populate('user', 'name email role'),
    ActivityLog.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    logs,
  });
});

module.exports = { getActivityLogs };
