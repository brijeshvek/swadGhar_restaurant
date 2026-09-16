const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: true,
    min: [1, 'Discount value must be at least 1'],
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    default: 500, // Maximum discount in INR for percentage coupons
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: 1000,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  description: {
    type: String,
    default: 'Special promotional discount for SwadGhar diners',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);
