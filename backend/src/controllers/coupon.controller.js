const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
const getAllCoupons = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, data: mockStore.coupons });
    }

    const coupons = await Coupon.find({ isActive: true }).sort({ minOrderAmount: 1 });
    res.status(200).json({ success: true, data: coupons.length > 0 ? coupons : mockStore.coupons });
  } catch (error) {
    res.status(200).json({ success: true, data: mockStore.coupons });
  }
};

// @desc    Validate coupon against order subtotal
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Please provide coupon code.' });

    const orderSubtotal = Number(subtotal) || 0;
    let coupon = null;

    if (isDbConnected()) {
      coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
    }

    if (!coupon) {
      coupon = mockStore.coupons.find(c => c.code === code.trim().toUpperCase() && c.isActive);
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code.' });
    }

    if (orderSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ₹${coupon.minOrderAmount} required for coupon '${coupon.code}'.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      const calculated = (orderSubtotal * coupon.discountValue) / 100;
      discountAmount = coupon.maxDiscount ? Math.min(calculated, coupon.maxDiscount) : calculated;
    } else {
      discountAmount = Math.min(coupon.discountValue, orderSubtotal);
    }

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
        minOrderAmount: coupon.minOrderAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
  try {
    const newC = {
      _id: `c_${Date.now()}`,
      ...req.body,
      usedCount: 0,
      isActive: true,
    };

    if (!isDbConnected()) {
      mockStore.coupons.push(newC);
      return res.status(201).json({ success: true, message: 'Coupon created', data: newC });
    }

    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const idx = mockStore.coupons.findIndex(c => c._id === req.params.id);
      if (idx > -1) {
        mockStore.coupons[idx] = { ...mockStore.coupons[idx], ...req.body };
        return res.status(200).json({ success: true, message: 'Coupon updated', data: mockStore.coupons[idx] });
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Coupon updated', data: coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      mockStore.coupons = mockStore.coupons.filter(c => c._id !== req.params.id);
      return res.status(200).json({ success: true, message: 'Coupon deleted' });
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
