const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { logActivity, notifyUser } = require('../services/activityService');

// @desc    Submit feedback for a resolved/closed complaint
// @route   POST /api/feedback
// @access  Private
const submitFeedback = asyncHandler(async (req, res) => {
  const { complaint: complaintId, rating, comment } = req.body;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new ApiError(404, 'Complaint not found.');

  if (String(complaint.submittedBy) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only give feedback on your own complaints.');
  }
  if (!['Resolved', 'Closed'].includes(complaint.status)) {
    throw new ApiError(400, 'Feedback can only be given after a complaint is resolved or closed.');
  }
  if (complaint.isFeedbackGiven) {
    throw new ApiError(409, 'Feedback has already been submitted for this complaint.');
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5.');
  }

  const feedback = await Feedback.create({
    complaint: complaintId,
    submittedBy: req.user._id,
    rating,
    comment,
  });

  complaint.isFeedbackGiven = true;
  await complaint.save();

  if (complaint.assignedTo) {
    await notifyUser({
      recipient: complaint.assignedTo,
      title: 'New feedback received',
      message: `Feedback was submitted for complaint ${complaint.ticketId}: ${rating}/5 stars.`,
      type: 'feedback',
      relatedComplaint: complaint._id,
    });
  }

  await logActivity({
    user: req.user._id,
    action: 'FEEDBACK_SUBMITTED',
    entityType: 'Feedback',
    entityId: feedback._id,
    description: `${req.user.name} gave feedback on complaint ${complaint.ticketId}`,
    req,
  });

  res.status(201).json({ success: true, feedback });
});

// @desc    Get all feedback (admin) with average ratings
// @route   GET /api/feedback
// @access  Private/Admin
const getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find()
    .populate('submittedBy', 'name email')
    .populate({
      path: 'complaint',
      select: 'ticketId title category department',
      populate: { path: 'department', select: 'name' },
    })
    .sort('-createdAt');

  const avgResult = await Feedback.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    count: feedback.length,
    averageRating: avgResult[0]?.avgRating?.toFixed(2) || 0,
    feedback,
  });
});

// @desc    Get feedback for a specific complaint
// @route   GET /api/feedback/complaint/:complaintId
// @access  Private
const getFeedbackForComplaint = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findOne({ complaint: req.params.complaintId }).populate(
    'submittedBy',
    'name'
  );
  if (!feedback) throw new ApiError(404, 'No feedback found for this complaint.');
  res.status(200).json({ success: true, feedback });
});

module.exports = { submitFeedback, getAllFeedback, getFeedbackForComplaint };
