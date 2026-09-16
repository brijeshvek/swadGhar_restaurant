const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  deleteReview,
} = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, createReview);
router.get('/', protect, authorize('admin'), getAllReviews);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
