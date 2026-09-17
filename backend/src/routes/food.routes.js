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
const cache = require('../utils/cache');

// Public routes with fast in-memory TTL caching (sub-5ms response)
router.get('/', cache.middleware(60, 'foods'), getAllFoods);
router.get('/featured', cache.middleware(120, 'foods'), getFeaturedFoods);
router.get('/popular', cache.middleware(120, 'foods'), getPopularFoods);
router.get('/:id', cache.middleware(120, 'foods'), getFoodById);

// Staff & Admin routes
router.patch('/:id/availability', protect, authorize('admin', 'staff'), toggleFoodAvailability);

// Admin only routes
router.post('/', protect, authorize('admin'), createFood);
router.put('/:id', protect, authorize('admin'), updateFood);
router.delete('/:id', protect, authorize('admin'), deleteFood);

module.exports = router;
