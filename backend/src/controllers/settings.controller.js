const mongoose = require('mongoose');
const RestaurantSettings = require('../models/RestaurantSettings');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get restaurant settings and business info
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        data: mockStore.settings,
      });
    }

    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create(mockStore.settings);
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: mockStore.settings,
    });
  }
};

// @desc    Update restaurant settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      mockStore.settings = { ...mockStore.settings, ...req.body };
      return res.status(200).json({
        success: true,
        message: 'Restaurant settings updated successfully',
        data: mockStore.settings,
      });
    }

    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create(req.body);
    } else {
      settings = await RestaurantSettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
