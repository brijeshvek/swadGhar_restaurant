const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Initialize Razorpay instance
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (e) {
    console.warn('[Payment Gateway] Razorpay initialization skipped:', e.message);
  }
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/create-order
// @access  Private
const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const amountInPaise = Math.round(order.pricing.total * 100);

    // If live/sandbox razorpay keys exist, use official API; else create development mock order
    let rzpOrder;
    if (razorpayInstance && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key') {
      rzpOrder = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${order.orderNumber}`,
      });
    } else {
      // Development simulated Razorpay order ID
      rzpOrder = {
        id: `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: amountInPaise,
        currency: 'INR',
        status: 'created',
      };
    }

    order.paymentInfo.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_swadghar_demo',
        orderId: rzpOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        restaurantOrderNumber: order.orderNumber,
        customerName: req.user.name,
        customerEmail: req.user.email,
        customerPhone: req.user.phone,
      },
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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    let isSignatureValid = true;

    // Validate signature if valid key secret configured
    if (
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_SECRET !== 'rzp_test_placeholder_secret' &&
      !razorpay_order_id.startsWith('order_sim_')
    ) {
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = generated_signature === razorpay_signature;
    }

    if (!isSignatureValid) {
      order.paymentInfo.status = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch. Transaction rejected.',
      });
    }

    // Update order payment status
    order.paymentInfo.status = 'paid';
    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    order.paymentInfo.paidAt = new Date();
    order.orderStatus = 'confirmed'; // Auto-advance to confirmed on successful payment
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: `Online payment verified via Razorpay ID: ${razorpay_payment_id}`,
    });
    await order.save();

    // Create Payment log record
    await Payment.create({
      order: order._id,
      customer: req.user.id,
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: order.pricing.total,
      currency: 'INR',
      status: 'captured',
    });

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
