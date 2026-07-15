const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAdminDashboard,
  getDepartmentDashboard,
  exportExcel,
  exportPDF,
} = require('../controllers/analyticsController');

const router = express.Router();

router.use(protect);

router.get('/admin-dashboard', restrictTo('admin'), getAdminDashboard);
router.get('/department-dashboard', restrictTo('staff'), getDepartmentDashboard);
router.get('/export/excel', restrictTo('admin'), exportExcel);
router.get('/export/pdf', restrictTo('admin'), exportPDF);

module.exports = router;
