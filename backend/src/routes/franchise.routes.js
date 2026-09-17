const express = require('express');
const router = express.Router();
const {
  getAllFranchises,
  getMyBranch,
  getFranchiseById,
  createFranchise,
  updateFranchise,
  updateManagerCredentials,
  addStaffToFranchise,
  removeStaffFromFranchise,
  deleteFranchise,
  submitFranchiseInquiry,
} = require('../controllers/franchise.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const cache = require('../utils/cache');

// Public routes with fast in-memory caching
router.get('/', cache.middleware(180, 'franchises'), getAllFranchises);
router.post('/inquiry', submitFranchiseInquiry);

// Protected branch manager / staff route
router.get('/my-branch', protect, authorize('staff', 'admin'), getMyBranch);
router.post('/:id/staff', protect, authorize('staff', 'admin'), addStaffToFranchise);
router.delete('/:id/staff/:staffId', protect, authorize('staff', 'admin'), removeStaffFromFranchise);

// Protected Admin-Only management routes
router.post('/', protect, authorize('admin'), createFranchise);
router.put('/:id', protect, authorize('admin'), updateFranchise);
router.put('/:id/manager-credentials', protect, authorize('admin'), updateManagerCredentials);
router.delete('/:id', protect, authorize('admin'), deleteFranchise);

// Public single franchise by ID
router.get('/:id', getFranchiseById);

module.exports = router;

