const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for Product Images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'the-accessories-lab/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  },
});

// Storage for Profile Pictures
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'the-accessories-lab/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  },
});

// Delete image from Cloudinary
const deleteImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary')) return;

  try {
    // Extract public_id from URL
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const folder = parts[parts.length - 2];
    const publicId = `the-accessories-lab/${folder}/${filename}`;

    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Deleted image: ${publicId}`);
  } catch (error) {
    console.error('❌ Error deleting image:', error.message);
  }
};

module.exports = {
  cloudinary,
  productStorage,
  profileStorage,
  deleteImage,
};