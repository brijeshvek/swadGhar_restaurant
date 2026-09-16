const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
    index: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerAvatar: {
    type: String,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false, // Verified order link
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters'],
  },
  isApproved: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Calculate and update Food average rating on review save
reviewSchema.statics.calculateAverageRating = async function (foodId) {
  const stats = await this.aggregate([
    { $match: { food: foodId, isApproved: true } },
    {
      $group: {
        _id: '$food',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Food').findByIdAndUpdate(foodId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      await mongoose.model('Food').findByIdAndUpdate(foodId, {
        rating: 5,
        numReviews: 0,
      });
    }
  } catch (err) {
    console.error('Error updating average rating for food:', err);
  }
};

reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.food);
});

reviewSchema.post('remove', function () {
  this.constructor.calculateAverageRating(this.food);
});

module.exports = mongoose.model('Review', reviewSchema);
