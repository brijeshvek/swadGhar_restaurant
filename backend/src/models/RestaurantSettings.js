const mongoose = require('mongoose');

const openingHourSchema = new mongoose.Schema({
  day: { type: String, required: true }, // 'Monday', 'Tuesday', ...
  openTime: { type: String, default: '10:00 AM' },
  closeTime: { type: String, default: '11:00 PM' },
  isOpen: { type: Boolean, default: true },
}, { _id: false });

const restaurantSettingsSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: true,
    default: 'SwadGhar Fine Dining & Delicacies',
  },
  tagline: {
    type: String,
    default: 'A Tradition of Authentic Royal Flavors & Warm Hospitality',
  },
  description: {
    type: String,
    default: 'Experience the finest Indian, Gujarati, Punjabi and Tandoori cuisines crafted with hand-ground spices and time-honored recipes.',
  },
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
  },
  email: {
    type: String,
    default: 'contact@swadghar.com',
  },
  phone: {
    type: String,
    default: '+91 98765 43210',
  },
  address: {
    street: { type: String, default: '104 Heritage Heritage Boulevard, Ring Road' },
    city: { type: String, default: 'Ahmedabad' },
    state: { type: String, default: 'Gujarat' },
    pincode: { type: String, default: '380015' },
    country: { type: String, default: 'India' },
    googleMapUrl: { type: String, default: 'https://maps.google.com' },
  },
  openingHours: [openingHourSchema],
  financial: {
    taxRatePercentage: { type: Number, default: 5 }, // 5% GST
    deliveryFee: { type: Number, default: 40 },       // ₹40 flat delivery
    freeDeliveryThreshold: { type: Number, default: 499 }, // Free delivery above ₹499
    minOrderAmount: { type: Number, default: 150 },
  },
  tableCapacity: {
    totalTables: { type: Number, default: 24 },
    maxGuestsPerTable: { type: Number, default: 10 },
    maxReservationAdvanceDays: { type: Number, default: 30 },
  },
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/swadghar' },
    facebook: { type: String, default: 'https://facebook.com/swadghar' },
    twitter: { type: String, default: 'https://twitter.com/swadghar' },
  },
  isOnlineOrderingOpen: {
    type: Boolean,
    default: true,
  },
  isTableBookingOpen: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('RestaurantSettings', restaurantSettingsSchema);
