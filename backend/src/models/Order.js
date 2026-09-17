const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  foodType: { type: String, default: 'veg' },
}, { _id: false });

const orderAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  houseNo: { type: String },
  street: { type: String },
  area: { type: String },
  address: { type: String }, // Combined address line for backward compatibility
  city: { type: String, required: true, default: 'Ahmedabad' },
  state: { type: String, required: true, default: 'Gujarat' },
  pincode: { type: String, required: true },
  landmark: { type: String },
  deliveryInstructions: { type: String },
}, { _id: false });

const pricingSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, required: true },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
}, { _id: false });

const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cod', 'razorpay'],
    default: 'cod',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paidAt: { type: Date },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  items: [orderItemSchema],
  orderType: {
    type: String,
    enum: ['delivery', 'pickup', 'dine-in'],
    default: 'delivery',
    index: true,
  },
  deliveryAddress: orderAddressSchema,
  pricing: pricingSchema,
  couponApplied: {
    code: { type: String },
    discountAmount: { type: Number, default: 0 },
  },
  paymentInfo: paymentInfoSchema,
  orderStatus: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'ready_for_pickup',
      'out_for_delivery',
      'delivered',
      'completed',
      'cancelled',
    ],
    default: 'pending',
    index: true,
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  }],
  notificationLogs: [{
    type: { type: String, default: 'sms' },
    status: { type: String },
    message: { type: String },
    recipientPhone: { type: String },
    sentAt: { type: Date, default: Date.now },
    success: { type: Boolean, default: true },
  }],
  estimatedDeliveryTime: {
    type: Date,
  },
  specialInstructions: {
    type: String,
  },
  cancelReason: {
    type: String,
  },
}, {
  timestamps: true,
});

// Compound & Performance Indexes for Fast Customer History & Admin Dashboard
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
