const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackForComplaint,
} = require('../controllers/feedbackController');

const router = express.Router();

router.use(protect);

router.route('/').post(restrictTo('student', 'faculty'), submitFeedback).get(restrictTo('admin'), getAllFeedback);
router.get('/complaint/:complaintId', getFeedbackForComplaint);

module.exports = router;
