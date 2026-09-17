const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const cache = require('../utils/cache');

// Public route with fast cache
router.get('/', cache.middleware(300, 'settings'), getSettings);

// Admin only route
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;
