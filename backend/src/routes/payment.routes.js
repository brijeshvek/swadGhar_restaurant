const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentSignature,
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyPaymentSignature);

module.exports = router;
