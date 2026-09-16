const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
} = require('../controllers/reservation.controller');
const { protect, optionalAuth, authorize } = require('../middleware/auth.middleware');

// Public / Customer routes
router.post('/', optionalAuth, createReservation);
router.get('/my-reservations', protect, getMyReservations);
router.put('/:id/cancel', optionalAuth, cancelReservation);

// Staff & Admin routes
router.get('/', protect, authorize('admin', 'staff'), getAllReservations);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateReservationStatus);

module.exports = router;
