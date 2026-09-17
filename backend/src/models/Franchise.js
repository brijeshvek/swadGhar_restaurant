const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Franchise branch name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      default: 'Gujarat',
      trim: true,
    },
    branchType: {
      type: String,
      enum: ['Flagship Dine-In', 'Royal Heritage Dining', 'Express & Takeaway', 'Premium Family Dining'],
      default: 'Premium Family Dining',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      default: 'franchise@swadghar.com',
    },
    timings: {
      type: String,
      default: '11:00 AM - 11:30 PM (All 7 Days)',
    },
    seatingCapacity: {
      type: Number,
      default: 120,
    },
    features: {
      type: [String],
      default: ['Pure Veg & Kathiyawadi', 'AC Dining', 'Valet Parking', 'Live Kitchen', 'Private Parties'],
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    },
    googleMapsUrl: {
      type: String,
      default: 'https://maps.google.com',
    },
    managerName: {
      type: String,
      default: 'Branch Manager',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Franchise', franchiseSchema);
