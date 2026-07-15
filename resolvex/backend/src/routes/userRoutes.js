const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  updateProfile,
  updateAvatar,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getDepartmentStaff,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.put('/avatar', uploadAvatar.single('avatar'), updateAvatar);
router.get('/department/:departmentId/staff', restrictTo('admin', 'staff'), getDepartmentStaff);

router.get('/', restrictTo('admin'), getUsers);
router.post('/', restrictTo('admin'), createUser);
router.get('/:id', restrictTo('admin'), getUser);
router.put('/:id', restrictTo('admin'), updateUser);
router.delete('/:id', restrictTo('admin'), deleteUser);

module.exports = router;
