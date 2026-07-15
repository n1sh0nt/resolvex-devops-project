const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

const router = express.Router();

router.use(protect);

router.route('/').get(getDepartments).post(restrictTo('admin'), createDepartment);
router
  .route('/:id')
  .get(getDepartment)
  .put(restrictTo('admin'), updateDepartment)
  .delete(restrictTo('admin'), deleteDepartment);

module.exports = router;
