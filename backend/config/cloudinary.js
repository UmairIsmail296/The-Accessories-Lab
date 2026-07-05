const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log('Cloudinary Config:');
console.log('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌');
console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? '✅' : '❌');

// Storage for Product Images - ALL FORMATS ALLOWED
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'accessories-lab/products',
    // ✅ Include AVIF and all formats
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'bmp', 'svg', 'heic', 'heif', 'tiff'],
    // Optional: Auto-convert AVIF to WebP for better browser support
    // transformation: [{ fetch_format: 'auto', quality: 'auto:good' }],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'accessories-lab/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
  },
});

const deleteImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary')) return;
  try {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const folder = parts[parts.length - 2];
    const publicId = `accessories-lab/${folder}/${filename}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Delete error:', error.message);
  }
};

module.exports = {
  cloudinary,
  productStorage,
  profileStorage,
  deleteImage,
};