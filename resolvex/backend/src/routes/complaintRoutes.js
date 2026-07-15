const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadComplaintImages, uploadResolutionImages } = require('../middleware/upload');
const {
  createComplaint,
  getComplaints,
  getComplaint,
  assignComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getMyStats,
} = require('../controllers/complaintController');

const router = express.Router();

router.use(protect);

router.get('/my-stats', getMyStats);

router
  .route('/')
  .get(getComplaints)
  .post(restrictTo('student', 'faculty'), uploadComplaintImages.array('images', 5), createComplaint);

router
  .route('/:id')
  .get(getComplaint)
  .delete(deleteComplaint);

router.put('/:id/assign', restrictTo('admin'), assignComplaint);
router.put(
  '/:id/status',
  restrictTo('staff', 'admin'),
  uploadResolutionImages.array('images', 5),
  updateComplaintStatus
);

module.exports = router;
