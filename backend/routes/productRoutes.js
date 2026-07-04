const express = require('express');
const router = express.Router();
const {
  getAllProducts, getProductsByCategory, getProductById,
  createProduct, updateProduct, deleteProduct, getAllProductsAdmin,
  toggleSoldOut, subscribeNotify, getNotifySubscribers,
} = require('../controllers/productController');
const { protectAdmin } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');

router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/admin/all', protectAdmin, getAllProductsAdmin);
router.get('/:id', getProductById);

// Use uploadProduct for Cloudinary
router.post('/', protectAdmin, uploadProduct.array('images', 10), createProduct);
router.put('/:id', protectAdmin, uploadProduct.array('images', 10), updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);

router.put('/:id/toggle-sold-out', protectAdmin, toggleSoldOut);
router.post('/:id/notify', subscribeNotify);
router.get('/:id/subscribers', protectAdmin, getNotifySubscribers);

module.exports = router;