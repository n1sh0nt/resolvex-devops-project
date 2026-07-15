const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, cloudinaryEnabled } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Only JPEG, PNG, and WEBP images are allowed.'));
  }
  cb(null, true);
};

const buildStorage = (folder) => {
  if (cloudinaryEnabled) {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `resolvex/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
      },
    });
  }

  // Local disk fallback
  const dest = path.join(__dirname, '..', '..', 'uploads', folder);
  fs.mkdirSync(dest, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
};

const makeUploader = (folder) =>
  multer({
    storage: buildStorage(folder),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: 5 },
  });

const uploadComplaintImages = makeUploader('complaints');
const uploadResolutionImages = makeUploader('resolutions');
const uploadAvatar = makeUploader('avatars');

// Normalizes multer file object into { url, publicId } regardless of storage backend
const normalizeUploadedFile = (file) => {
  if (cloudinaryEnabled) {
    return { url: file.path, publicId: file.filename };
  }
  const relativeUrl = `/uploads/${file.destination.split('uploads')[1].replace(/^[\\/]/, '')}/${file.filename}`.replace(/\\/g, '/');
  return { url: relativeUrl.replace('//', '/'), publicId: '' };
};

module.exports = {
  uploadComplaintImages,
  uploadResolutionImages,
  uploadAvatar,
  normalizeUploadedFile,
  cloudinaryEnabled,
};
