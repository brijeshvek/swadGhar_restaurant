const express = require('express');
const router = express.Router();
const {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require('../controllers/inquiry.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public inquiry submission
router.post('/', submitInquiry);

// Admin & Staff inquiry management
router.get('/', protect, authorize('admin', 'staff'), getInquiries);
router.patch('/:id/status', protect, authorize('admin', 'staff'), updateInquiryStatus);
router.delete('/:id', protect, authorize('admin'), deleteInquiry);

module.exports = router;
