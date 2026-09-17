const mongoose = require('mongoose');
const Order = require('../models/Order');
const Food = require('../models/Food');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const mockStore = require('../utils/mockStore');
const { sendOrderStatusNotification } = require('../services/notificationService');

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateOrderNumber = () => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SWAD-${Date.now().toString().slice(-4)}${randomSuffix}`;
};

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${randomSuffix}`;
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
      saveAddress = false,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required.' });
    }

    let verifiedSubtotal = 0;
    const validatedOrderItems = [];

    // Lookup items and calculate strict backend pricing
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
    const tax = Math.round(taxableSubtotal * 0.05); // 5% GST Total
    const cgst = Math.round(tax / 2); // 2.5% CGST
    const sgst = tax - cgst;          // 2.5% SGST
    const deliveryFee = orderType !== 'delivery' || verifiedSubtotal >= 499 ? 0 : 40;
    const total = Math.max(0, taxableSubtotal + tax + deliveryFee);

    const orderNumber = generateOrderNumber();
    const invoiceNumber = generateInvoiceNumber();
    const estimatedDeliveryTime = new Date(Date.now() + 35 * 60 * 1000);

    // Prepare immutable address snapshot
    const addressSnapshot = deliveryAddress ? {
      fullName: deliveryAddress.fullName || req.user.name,
      phone: deliveryAddress.phone || req.user.phone || '',
      email: deliveryAddress.email || req.user.email,
      houseNo: deliveryAddress.houseNo || '',
      street: deliveryAddress.street || '',
      area: deliveryAddress.area || '',
      address: deliveryAddress.address || [deliveryAddress.houseNo, deliveryAddress.street, deliveryAddress.area].filter(Boolean).join(', '),
      city: deliveryAddress.city || 'Ahmedabad',
      state: deliveryAddress.state || 'Gujarat',
      pincode: deliveryAddress.pincode || '',
      landmark: deliveryAddress.landmark || '',
      deliveryInstructions: deliveryAddress.deliveryInstructions || specialInstructions || '',
    } : null;

    const initialStatus = 'confirmed';

    const newOrderObj = {
      _id: isDbConnected() ? undefined : `ord_${Date.now()}`,
      orderNumber,
      invoiceNumber,
      customer: isDbConnected() ? req.user.id : (req.user || mockStore.users[2]),
      items: validatedOrderItems,
      orderType,
      deliveryAddress: addressSnapshot,
      pricing: {
        subtotal: verifiedSubtotal,
        discount: discountAmount,
        tax,
        cgst,
        sgst,
        deliveryFee,
        total,
      },
      couponApplied,
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === 'razorpay' ? 'pending' : 'pending',
      },
      orderStatus: initialStatus,
      statusHistory: [
        { status: 'pending', timestamp: new Date(), note: 'Order placed by customer' },
        { status: 'confirmed', timestamp: new Date(), note: 'Order received & confirmed by restaurant' },
      ],
      notificationLogs: [],
      estimatedDeliveryTime,
      specialInstructions,
      createdAt: new Date(),
    };

    // Auto-save address to customer address book if selected
    if (saveAddress && deliveryAddress && req.user.id) {
      try {
        if (isDbConnected()) {
          const user = await User.findById(req.user.id);
          if (user) {
            if (!user.phone && deliveryAddress.phone) user.phone = deliveryAddress.phone;
            user.addresses.push({
              label: deliveryAddress.label || 'Home',
              fullName: deliveryAddress.fullName || user.name,
              phone: deliveryAddress.phone || user.phone,
              houseNo: deliveryAddress.houseNo,
              street: deliveryAddress.street,
              area: deliveryAddress.area,
              city: deliveryAddress.city || 'Ahmedabad',
              state: deliveryAddress.state || 'Gujarat',
              pincode: deliveryAddress.pincode,
              landmark: deliveryAddress.landmark,
              deliveryInstructions: deliveryAddress.deliveryInstructions,
              isDefault: user.addresses.length === 0,
            });
            await user.save();
          }
        }
      } catch (addrErr) {
        console.warn('Could not auto-save address:', addrErr.message);
      }
    }

    let createdOrder = newOrderObj;
    if (!isDbConnected()) {
      mockStore.orders.unshift(newOrderObj);
    } else {
      createdOrder = await Order.create(newOrderObj);
      await createdOrder.populate('customer', 'name email phone avatar');
    }

    // Trigger SMS phone notification asynchronously
    sendOrderStatusNotification({
      order: createdOrder,
      status: initialStatus,
      recipientPhone: addressSnapshot?.phone || req.user.phone,
      recipientName: addressSnapshot?.fullName || req.user.name,
    }).then((notifRes) => {
      if (isDbConnected() && createdOrder._id) {
        Order.findByIdAndUpdate(createdOrder._id, {
          $push: {
            notificationLogs: {
              type: 'sms',
              status: initialStatus,
              message: notifRes.message,
              recipientPhone: notifRes.phone,
              sentAt: new Date(),
              success: notifRes.success,
            },
          },
        }).exec();
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! We have confirmed your order.',
      data: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders (Strict Data Isolation)
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const userOrders = mockStore.orders.filter(
        o => (o.customer?._id || o.customer) === req.user.id || req.user.role === 'admin'
      );
      return res.status(200).json({ success: true, count: userOrders.length, data: userOrders });
    }

    const orders = await Order.find({ customer: req.user.id })
      .populate('customer', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details with ownership verification
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order = null;
    if (!isDbConnected()) {
      order = mockStore.orders.find(o => o._id === id || o.orderNumber === id);
    } else {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(id).populate('customer', 'name email phone avatar');
      } else {
        order = await Order.findOne({ orderNumber: id }).populate('customer', 'name email phone avatar');
      }
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Strict Data Isolation Guard: Customers can only access their own orders
    const orderCustomerId = (order.customer?._id || order.customer)?.toString();
    const isOwner = orderCustomerId === req.user.id;
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this order.',
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Order Invoice Details with ownership verification
// @route   GET /api/orders/:id/invoice
// @access  Private
const getOrderInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order = null;
    if (!isDbConnected()) {
      order = mockStore.orders.find(o => o._id === id || o.orderNumber === id);
    } else {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(id).populate('customer', 'name email phone');
      } else {
        order = await Order.findOne({ orderNumber: id }).populate('customer', 'name email phone');
      }
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Invoice not found for this order.' });
    }

    // Ownership check
    const orderCustomerId = (order.customer?._id || order.customer)?.toString();
    const isOwner = orderCustomerId === req.user.id;
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this invoice.',
      });
    }

    const invoiceData = {
      invoiceNumber: order.invoiceNumber || `INV-${new Date(order.createdAt).getFullYear()}-${order.orderNumber.slice(-5)}`,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      orderType: order.orderType,
      orderStatus: order.orderStatus,
      restaurant: {
        name: 'SwadGhar Fine Dining Restaurant',
        tagline: 'Good Food ❤️ Happy People',
        address: 'Opp. Heritage Square, SG Highway, Bodakdev, Ahmedabad, Gujarat - 380054',
        phone: '+91 98765 43210',
        email: 'billing@swadghar.com',
        website: 'https://swadghar.com',
        gstin: '24ABCDE1234F1Z5',
        fssaiNumber: '10722001000456',
      },
      customer: {
        name: order.deliveryAddress?.fullName || order.customer?.name || 'Valued Guest',
        phone: order.deliveryAddress?.phone || order.customer?.phone || '',
        email: order.deliveryAddress?.email || order.customer?.email || '',
        deliveryAddress: order.deliveryAddress,
      },
      items: order.items.map((item, idx) => ({
        srNo: idx + 1,
        name: item.name,
        foodType: item.foodType,
        quantity: item.quantity,
        unitPrice: item.price,
        amount: item.price * item.quantity,
      })),
      pricing: {
        subtotal: order.pricing?.subtotal || 0,
        discount: order.pricing?.discount || 0,
        tax: order.pricing?.tax || 0,
        cgst: order.pricing?.cgst || Math.round((order.pricing?.tax || 0) / 2),
        sgst: order.pricing?.sgst || Math.round((order.pricing?.tax || 0) / 2),
        deliveryFee: order.pricing?.deliveryFee || 0,
        total: order.pricing?.total || 0,
      },
      couponApplied: order.couponApplied,
      paymentInfo: order.paymentInfo,
      isPaid: order.paymentInfo?.status === 'paid',
      specialInstructions: order.specialInstructions,
    };

    res.status(200).json({
      success: true,
      data: invoiceData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin & Staff Only)
// @route   GET /api/orders
// @access  Private/Staff or Admin
const getAllOrders = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, count: mockStore.orders.length, total: mockStore.orders.length, data: mockStore.orders });
    }

    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'deliveryAddress.fullName': { $regex: search.trim(), $options: 'i' } },
        { 'deliveryAddress.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, total: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Kitchen / Dispatch / Delivery)
// @route   PUT /api/orders/:id/status
// @access  Private/Staff or Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    let order = null;
    if (!isDbConnected()) {
      order = mockStore.orders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
      if (order) {
        order.orderStatus = status;
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ status, timestamp: new Date(), note: note || `Status updated to ${status}` });
      }
    } else {
      order = await Order.findById(req.params.id).populate('customer', 'name email phone');
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

      order.orderStatus = status;
      order.statusHistory.push({ status, timestamp: new Date(), note: note || `Status updated to ${status}` });

      if (status === 'delivered') {
        order.paymentInfo.status = 'paid';
        order.paymentInfo.paidAt = new Date();
      }

      await order.save();
    }

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Send SMS Phone Notification
    const phone = order.deliveryAddress?.phone || order.customer?.phone;
    const name = order.deliveryAddress?.fullName || order.customer?.name;

    sendOrderStatusNotification({
      order,
      status,
      recipientPhone: phone,
      recipientName: name,
    }).then((notifRes) => {
      if (isDbConnected() && order._id) {
        Order.findByIdAndUpdate(order._id, {
          $push: {
            notificationLogs: {
              type: 'sms',
              status,
              message: notifRes.message,
              recipientPhone: notifRes.phone,
              sentAt: new Date(),
              success: notifRes.success,
            },
          },
        }).exec();
      }
    });

    res.status(200).json({
      success: true,
      message: `Order status successfully updated to '${status}'. Customer notified.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (Customer or Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    let order = null;
    if (!isDbConnected()) {
      order = mockStore.orders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
      if (order) {
        order.orderStatus = 'cancelled';
        order.cancelReason = reason || 'Customer requested cancellation';
        return res.status(200).json({ success: true, message: 'Order cancelled.', data: order });
      }
    } else {
      order = await Order.findById(req.params.id).populate('customer', 'name email phone');
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

      // Ownership Check
      const orderCustomerId = (order.customer?._id || order.customer)?.toString();
      const isOwner = orderCustomerId === req.user.id;
      const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

      if (!isOwner && !isStaffOrAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied: You cannot cancel another customer order.' });
      }

      order.orderStatus = 'cancelled';
      order.cancelReason = reason || 'Customer requested cancellation';
      order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: reason || 'Cancelled' });
      await order.save();
    }

    // Send Cancellation SMS
    sendOrderStatusNotification({
      order,
      status: 'cancelled',
      recipientPhone: order.deliveryAddress?.phone || order.customer?.phone,
      recipientName: order.deliveryAddress?.fullName || order.customer?.name,
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderInvoice,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
