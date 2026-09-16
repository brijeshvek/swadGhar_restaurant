const express = require('express');
const router = express.Router();
const {
  getAllCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/coupon.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllCoupons);
router.post('/validate', validateCoupon);

// Admin routes
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
