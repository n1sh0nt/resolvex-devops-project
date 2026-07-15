const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { getActivityLogs } = require('../controllers/adminController');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/activity-logs', getActivityLogs);

module.exports = router;
