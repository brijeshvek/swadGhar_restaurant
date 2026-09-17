const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 }, // in grams
  carbs: { type: Number, default: 0 },   // in grams
  fats: { type: Number, default: 0 },    // in grams
}, { _id: false });

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide food name'],
    trim: true,
    maxlength: [100, 'Food name cannot exceed 100 characters'],
    index: true,
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide food description'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Food must belong to a category'],
    index: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide item price in INR'],
    min: [0, 'Price cannot be negative'],
  },
  discountPrice: {
    type: Number,
    default: 0,
    validate: {
      validator: function (val) {
        return val === 0 || val < this.price;
      },
      message: 'Discount price ({VALUE}) must be strictly less than standard price',
    },
  },
  image: {
    type: String,
    required: [true, 'Please provide a food image URL'],
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  },
  foodType: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'egg'],
    default: 'veg',
    index: true,
  },
  ingredients: [{
    type: String,
    trim: true,
  }],
  nutrition: {
    type: nutritionSchema,
    default: () => ({ calories: 0, protein: 0, carbs: 0, fats: 0 }),
  },
  spiceLevel: {
    type: String,
    enum: ['non-spicy', 'mild', 'medium', 'spicy', 'extra-spicy'],
    default: 'medium',
  },
  preparationTime: {
    type: Number, // in minutes
    default: 20,
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
    index: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true,
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5,
    index: true,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

foodSchema.pre('save', function (next) {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Text index for search functionality
foodSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Food', foodSchema);
