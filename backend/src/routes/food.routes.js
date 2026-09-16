const express = require('express');
const router = express.Router();
const {
  getAllFoods,
  getFoodById,
  getFeaturedFoods,
  getPopularFoods,
  createFood,
  updateFood,
  deleteFood,
  toggleFoodAvailability,
} = require('../controllers/food.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllFoods);
router.get('/featured', getFeaturedFoods);
router.get('/popular', getPopularFoods);
router.get('/:id', getFoodById);

// Staff & Admin routes
router.patch('/:id/availability', protect, authorize('admin', 'staff'), toggleFoodAvailability);

// Admin only routes
router.post('/', protect, authorize('admin'), createFood);
router.put('/:id', protect, authorize('admin'), updateFood);
router.delete('/:id', protect, authorize('admin'), deleteFood);

module.exports = router;
