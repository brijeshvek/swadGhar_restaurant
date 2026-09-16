const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allows guest reservations as well as registered customers
    index: true,
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true,
  },
  date: {
    type: Date,
    required: [true, 'Reservation date is required'],
    index: true,
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required (e.g. 19:30)'],
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest required'],
    max: [20, 'For parties larger than 20, please call our banquet manager'],
  },
  tableNumber: {
    type: String,
    default: null,
  },
  specialRequest: {
    type: String,
    trim: true,
    maxlength: [500, 'Special request cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Reservation', reservationSchema);
