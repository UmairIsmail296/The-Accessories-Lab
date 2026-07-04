const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  trackOrder,
} = require('../controllers/orderController');
const { protectUser, protectAdmin } = require('../middleware/auth');

router.post('/', protectUser, createOrder);
router.get('/my-orders', protectUser, getUserOrders);
router.get('/track/:trackingId', trackOrder);
router.get('/admin/all', protectAdmin, getAllOrders);
router.put('/admin/:id', protectAdmin, updateOrderStatus);
router.get('/:id', protectUser, getOrderById);

module.exports = router;