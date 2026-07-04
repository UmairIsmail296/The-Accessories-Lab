const multer = require('multer');
const path = require('path');
const { productStorage, profileStorage } = require('../config/cloudinary');

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpg, png, gif, webp) are allowed!'));
};

// Upload for Products (multiple images)
const uploadProduct = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload for Profile Pictures
const uploadProfile = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = {
  uploadProduct,
  uploadProfile,
};