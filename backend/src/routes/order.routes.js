const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Customer routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Staff & Admin routes
router.get('/', protect, authorize('admin', 'staff'), getAllOrders);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);

module.exports = router;
