const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Try to load Cloudinary config
let productStorage, profileStorage;
let useCloudinary = false;

try {
  const cloudinaryConfig = require('../config/cloudinary');
  if (cloudinaryConfig.productStorage && cloudinaryConfig.profileStorage) {
    productStorage = cloudinaryConfig.productStorage;
    profileStorage = cloudinaryConfig.profileStorage;
    useCloudinary = true;
    console.log('✅ Cloudinary storage loaded');
  }
} catch (error) {
  console.log('⚠️ Cloudinary not configured, using local storage');
  useCloudinary = false;
}

if (!useCloudinary) {
  const uploadDir = 'uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      let ext = path.extname(file.originalname).toLowerCase();

      if (!ext) {
        const mimeToExt = {
          'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
          'image/gif': '.gif', 'image/webp': '.webp', 'image/avif': '.avif',
          'image/svg+xml': '.svg', 'image/bmp': '.bmp', 'image/heic': '.heic',
        };
        ext = mimeToExt[file.mimetype] || '.jpg';
      }

      cb(null, uniqueSuffix + ext);
    },
  });

  productStorage = localStorage;
  profileStorage = localStorage;
}

const fileFilter = (req, file, cb) => {
  console.log('📸 File:', file.originalname, '| Type:', file.mimetype);

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
    '.heic', '.heif', '.avif', '.tiff', '.tif', '.ico', '.jfif',
  ];

  if (file.mimetype?.startsWith('image/') || allowedExtensions.includes(ext)) {
    return cb(null, true);
  }

  if (ext === '.avif' || file.originalname.toLowerCase().endsWith('.avif')) {
    return cb(null, true);
  }

  cb(new Error(`Not an image: ${file.originalname}`));
};

// ✅ INCREASED LIMITS
const uploadProduct = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB per file
    files: 100, // ✅ Allow up to 100 files (was 20)
    fields: 200, // ✅ Allow more fields
    fieldSize: 50 * 1024 * 1024, // ✅ Large field size for JSON data
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const upload = uploadProduct;

console.log('✅ Upload middleware configured (100 files max)');

module.exports = {
  uploadProduct,
  uploadProfile,
  upload,
};