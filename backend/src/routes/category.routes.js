const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const cache = require('../utils/cache');

// Public routes with fast in-memory caching
router.get('/', cache.middleware(180, 'categories'), getAllCategories);
router.get('/:id', cache.middleware(180, 'categories'), getCategoryById);

// Admin only routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
