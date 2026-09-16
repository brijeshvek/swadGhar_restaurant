const mongoose = require('mongoose');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Coupon = require('../models/Coupon');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateOrderNumber = () => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SWAD-${Date.now().toString().slice(-4)}${randomSuffix}`;
};

// @desc    Create new restaurant order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      orderType = 'delivery',
      deliveryAddress,
      couponCode,
      paymentMethod = 'cod',
      specialInstructions,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required.' });
    }

    let verifiedSubtotal = 0;
    const validatedOrderItems = [];

    // Lookup items
    for (const item of items) {
      const foodId = item.food?._id || item.food || item._id;
      let food = null;

      if (isDbConnected()) {
        food = await Food.findById(foodId);
      } else {
        food = mockStore.foods.find(f => f._id === foodId || f.slug === foodId);
      }

      const price = food
        ? (food.discountPrice > 0 ? food.discountPrice : food.price)
        : (item.price || 250);

      const name = food ? food.name : (item.name || 'Delicacy');
      const image = food ? food.image : (item.image || '');
      const foodType = food ? food.foodType : 'veg';
      const qty = Number(item.quantity) || 1;

      verifiedSubtotal += price * qty;
      validatedOrderItems.push({
        food: food ? food._id : foodId,
        name,
        price,
        quantity: qty,
        image,
        foodType,
      });
    }

    // Coupon discount calculation
    let discountAmount = 0;
    let couponApplied = null;
    if (couponCode) {
      const c = mockStore.coupons.find(x => x.code === couponCode.toUpperCase());
      if (c && verifiedSubtotal >= c.minOrderAmount) {
        if (c.discountType === 'percentage') {
          discountAmount = Math.min((verifiedSubtotal * c.discountValue) / 100, c.maxDiscount || 500);
        } else {
          discountAmount = Math.min(c.discountValue, verifiedSubtotal);
        }
        discountAmount = Math.round(discountAmount);
        couponApplied = { code: c.code, discountAmount };
      }
    }

    const taxableSubtotal = Math.max(0, verifiedSubtotal - discountAmount);
    const tax = Math.round(taxableSubtotal * 0.05);
    const deliveryFee = orderType !== 'delivery' || verifiedSubtotal >= 499 ? 0 : 40;
    const total = Math.max(0, taxableSubtotal + tax + deliveryFee);

    const orderNumber = generateOrderNumber();
    const estimatedDeliveryTime = new Date(Date.now() + 35 * 60 * 1000);

    const newOrderObj = {
      _id: isDbConnected() ? undefined : `ord_${Date.now()}`,
      orderNumber,
      customer: isDbConnected() ? req.user.id : (req.user || mockStore.users[2]),
      items: validatedOrderItems,
      orderType,
      deliveryAddress,
      pricing: { subtotal: verifiedSubtotal, discount: discountAmount, tax, deliveryFee, total },
      couponApplied,
      paymentInfo: { method: paymentMethod, status: paymentMethod === 'razorpay' ? 'pending' : 'pending' },
      orderStatus: 'pending',
      statusHistory: [{ status: 'pending', timestamp: new Date(), note: 'Order placed' }],
      estimatedDeliveryTime,
      specialInstructions,
      createdAt: new Date(),
    };

    if (!isDbConnected()) {
      mockStore.orders.unshift(newOrderObj);
      return res.status(201).json({ success: true, message: 'Order placed successfully!', data: newOrderObj });
    }

    const order = await Order.create(newOrderObj);
    res.status(201).json({ success: true, message: 'Order placed successfully!', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, count: mockStore.orders.length, data: mockStore.orders });
    }

    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, count: mockStore.orders.length, data: mockStore.orders });
    }

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(200).json({ success: true, count: mockStore.orders.length, data: mockStore.orders });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const ord = mockStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (ord) return res.status(200).json({ success: true, data: ord });
      return res.status(200).json({ success: true, data: mockStore.orders[0] });
    }

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('customer', 'name email phone avatar');
    } else {
      order = await Order.findOne({ orderNumber: id }).populate('customer', 'name email phone avatar');
    }

    if (!order) {
      const fallback = mockStore.orders.find(o => o._id === id || o.orderNumber === id);
      if (fallback) return res.status(200).json({ success: true, data: fallback });
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    const fallback = mockStore.orders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
    if (fallback) return res.status(200).json({ success: true, data: fallback });
    next(error);
  }
};

// @desc    Get all orders (Admin & Staff)
// @route   GET /api/orders
// @access  Private/Staff or Admin
const getAllOrders = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, count: mockStore.orders.length, total: mockStore.orders.length, data: mockStore.orders });
    }

    const orders = await Order.find().populate('customer', 'name email phone avatar').sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, count: mockStore.orders.length, total: mockStore.orders.length, data: mockStore.orders });
    }

    res.status(200).json({ success: true, count: orders.length, total: orders.length, data: orders });
  } catch (error) {
    res.status(200).json({ success: true, count: mockStore.orders.length, total: mockStore.orders.length, data: mockStore.orders });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Staff or Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!isDbConnected()) {
      const ord = mockStore.orders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
      if (ord) {
        ord.orderStatus = status;
        ord.statusHistory = ord.statusHistory || [];
        ord.statusHistory.push({ status, timestamp: new Date(), note: note || `Status updated to ${status}` });
        return res.status(200).json({ success: true, message: `Status updated to ${status}`, data: ord });
      }
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = status;
    order.statusHistory.push({ status, timestamp: new Date(), note: note || `Status updated to ${status}` });
    await order.save();

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const ord = mockStore.orders.find(o => o._id === req.params.id);
      if (ord) {
        ord.orderStatus = 'cancelled';
        return res.status(200).json({ success: true, message: 'Order cancelled', data: ord });
      }
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = 'cancelled';
    await order.save();
    res.status(200).json({ success: true, message: 'Order cancelled', data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
