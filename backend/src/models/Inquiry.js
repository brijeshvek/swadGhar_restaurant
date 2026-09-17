const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [80, 'Name cannot exceed 80 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    index: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide contact phone number'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Please provide inquiry subject'],
    trim: true,
    maxlength: [120, 'Subject cannot exceed 120 characters'],
  },
  message: {
    type: String,
    required: [true, 'Please provide inquiry details'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  eventType: {
    type: String,
    enum: ['general', 'catering', 'party_booking', 'corporate', 'feedback', 'franchise'],
    default: 'general',
    index: true,
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'archived'],
    default: 'new',
    index: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Inquiry', inquirySchema);
