const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Add a review for a food item
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { foodId, rating, comment, orderId } = req.body;

    if (!foodId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide food ID, rating (1-5), and review comment.',
      });
    }

    // Optional check: verify if user ordered this food previously
    const review = await Review.create({
      food: foodId,
      customer: req.user.id,
      customerName: req.user.name,
      customerAvatar: req.user.avatar,
      order: orderId,
      rating: Number(rating),
      comment,
      isApproved: true,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all reviews
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('food', 'name image price')
      .populate('customer', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getAllReviews,
  deleteReview,
};
