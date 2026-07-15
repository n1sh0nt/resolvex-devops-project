const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBroadcast,
} = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.post('/broadcast', restrictTo('admin'), sendBroadcast);

module.exports = router;
