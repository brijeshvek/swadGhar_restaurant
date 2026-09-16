const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllCustomers,
  toggleCustomerBlock,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);
router.get('/customers', protect, authorize('admin'), getAllCustomers);
router.patch('/customers/:id/toggle-block', protect, authorize('admin'), toggleCustomerBlock);

module.exports = router;
