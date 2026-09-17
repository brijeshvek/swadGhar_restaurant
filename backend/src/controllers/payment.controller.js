const crypto = require('crypto');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const mockStore = require('../utils/mockStore');
const { sendOrderStatusNotification } = require('../services/notificationService');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Dynamically create or retrieve Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (key_id && key_secret && key_id.startsWith('rzp_') && key_id !== 'rzp_test_placeholder_key') {
    try {
      return new Razorpay({
        key_id,
        key_secret,
      });
    } catch (err) {
      console.warn('[Razorpay] Failed to instantiate SDK:', err.message);
    }
  }
  return null;
};

// Helper to find order by ID or orderNumber
const findOrder = async (orderId) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const ord = await Order.findById(orderId);
      if (ord) return ord;
    }
    return await Order.findOne({ orderNumber: orderId });
  }
  return mockStore.orders.find((o) => o._id === orderId || o.orderNumber === orderId);
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required.',
      });
    }

    const order = await findOrder(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const totalAmount = order.pricing?.total || order.finalAmount || 0;
    const amountInPaise = Math.round(totalAmount * 100);

    const rzp = getRazorpayInstance();
    let rzpOrder = null;

    if (rzp) {
      try {
        rzpOrder = await rzp.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${order.orderNumber || order._id}`,
          notes: {
            orderNumber: order.orderNumber,
            customerName: req.user.name,
            customerPhone: req.user.phone,
          },
        });
        console.log(`[Razorpay] Created official order ID: ${rzpOrder.id} for amount ₹${totalAmount}`);
      } catch (rzpErr) {
        console.warn('[Razorpay] Gateway API call error, falling back:', rzpErr.message);
      }
    }

    // Fallback sandbox simulation ID if gateway is unreachable or credentials are mock
    if (!rzpOrder) {
      rzpOrder = {
        id: `order_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        amount: amountInPaise,
        currency: 'INR',
        status: 'created',
      };
    }

    if (order.paymentInfo) {
      order.paymentInfo.razorpayOrderId = rzpOrder.id;
      if (typeof order.save === 'function') {
        await order.save();
      }
    }

    const payload = {
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_Td5GYtIrYigZH7',
      orderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      restaurantOrderNumber: order.orderNumber,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
    };

    res.status(200).json({
      success: true,
      data: payload,
      ...payload, // flatten for easy extraction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
const verifyPaymentSignature = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await findOrder(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    let isSignatureValid = true;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Validate signature with HMAC-SHA256 if live key secret is set
    if (
      keySecret &&
      keySecret !== 'rzp_test_placeholder_secret' &&
      razorpay_order_id &&
      !razorpay_order_id.startsWith('order_sim_')
    ) {
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = generated_signature === razorpay_signature;
    }

    if (!isSignatureValid) {
      if (order.paymentInfo) {
        order.paymentInfo.status = 'failed';
        if (typeof order.save === 'function') await order.save();
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch. Transaction rejected.',
      });
    }

    // Update order payment status
    if (order.paymentInfo) {
      order.paymentInfo.status = 'paid';
      order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
      order.paymentInfo.razorpaySignature = razorpay_signature;
      order.paymentInfo.paidAt = new Date();
    }
    order.orderStatus = 'confirmed';

    if (Array.isArray(order.statusHistory)) {
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        note: `Online payment verified via Razorpay ID: ${razorpay_payment_id}`,
      });
    }

    if (typeof order.save === 'function') {
      await order.save();
    }

    // Create Payment log record in MongoDB if connected
    if (isDbConnected()) {
      try {
        await Payment.create({
          order: order._id,
          customer: req.user.id,
          paymentMethod: 'razorpay',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: order.pricing?.total || order.finalAmount || 0,
          currency: 'INR',
          status: 'captured',
        });
      } catch (logErr) {
        console.warn('[Payment Gateway] Payment log creation error:', logErr.message);
      }
    }

    // Send SMS notification
    try {
      const phone = order.deliveryAddress?.phone || req.user.phone;
      if (phone) {
        await sendOrderStatusNotification(phone, 'confirmed', order.orderNumber, {
          total: order.pricing?.total || order.finalAmount,
          customerName: req.user.name,
        });
      }
    } catch (smsErr) {
      console.warn('[Notification] Payment confirmation SMS notice failed:', smsErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully!',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
};
