const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters'],
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

categorySchema.pre('save', function (next) {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
