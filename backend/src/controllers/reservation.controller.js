const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Create table reservation
// @route   POST /api/reservations
// @access  Public / Optional Auth
const createReservation = async (req, res, next) => {
  try {
    const {
      customerName,
      phone,
      email,
      date,
      timeSlot,
      guests,
      specialRequest,
    } = req.body;

    if (!customerName || !phone || !email || !date || !timeSlot || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone, email, date, time slot, and guest count.',
      });
    }

    const newRes = {
      _id: isDbConnected() ? undefined : `res_${Date.now()}`,
      customer: req.user ? req.user.id : undefined,
      customerName,
      phone,
      email,
      date: new Date(date),
      timeSlot,
      guests: Number(guests),
      specialRequest,
      status: 'pending',
      createdAt: new Date(),
    };

    if (!isDbConnected()) {
      mockStore.reservations.unshift(newRes);
      return res.status(201).json({
        success: true,
        message: 'Table reservation requested! We will notify you once confirmed.',
        data: newRes,
      });
    }

    const reservation = await Reservation.create(newRes);

    res.status(201).json({
      success: true,
      message: 'Table reservation requested! We will notify you once confirmed.',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in customer's reservations
// @route   GET /api/reservations/my-reservations
// @access  Private
const getMyReservations = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        count: mockStore.reservations.length,
        data: mockStore.reservations,
      });
    }

    const reservations = await Reservation.find({
      $or: [
        { customer: req.user.id },
        { email: req.user.email },
      ],
    }).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations.length > 0 ? reservations : mockStore.reservations,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      count: mockStore.reservations.length,
      data: mockStore.reservations,
    });
  }
};

// @desc    Get all reservations (Admin & Staff)
// @route   GET /api/reservations
// @access  Private/Staff or Admin
const getAllReservations = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        count: mockStore.reservations.length,
        total: mockStore.reservations.length,
        data: mockStore.reservations,
      });
    }

    const reservations = await Reservation.find().sort({ date: 1, timeSlot: 1 });
    res.status(200).json({
      success: true,
      count: reservations.length,
      total: reservations.length,
      data: reservations.length > 0 ? reservations : mockStore.reservations,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      count: mockStore.reservations.length,
      total: mockStore.reservations.length,
      data: mockStore.reservations,
    });
  }
};

// @desc    Update reservation status & assign table number
// @route   PUT /api/reservations/:id/status
// @access  Private/Staff or Admin
const updateReservationStatus = async (req, res, next) => {
  try {
    const { status, tableNumber } = req.body;

    if (!isDbConnected()) {
      const r = mockStore.reservations.find(x => x._id === req.params.id);
      if (r) {
        r.status = status;
        if (tableNumber) r.tableNumber = tableNumber;
        return res.status(200).json({ success: true, message: `Status updated to ${status}`, data: r });
      }
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

    reservation.status = status;
    if (tableNumber !== undefined) reservation.tableNumber = tableNumber;
    await reservation.save();

    res.status(200).json({
      success: true,
      message: `Reservation status changed to '${status}'.`,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const r = mockStore.reservations.find(x => x._id === req.params.id);
      if (r) {
        r.status = 'cancelled';
        return res.status(200).json({ success: true, message: 'Reservation cancelled', data: r });
      }
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully.',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
};
