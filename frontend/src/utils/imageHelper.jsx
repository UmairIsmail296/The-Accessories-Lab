// Universal image URL helper - works with Cloudinary + local
export const getImageUrl = (img, fallback = 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600') => {
  if (!img) return fallback;
  // Cloudinary URLs already start with https://
  if (img.startsWith('http') || img.startsWith('https')) return img;
  // Local uploaded images
  return `http://localhost:5000${img}`;
};