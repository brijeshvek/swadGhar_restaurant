const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updateAvatar,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
  firebaseSocialLogin,
  sendPhoneOtp,
  verifyPhoneOtp,
  sendEmailVerification,
  verifyEmail,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Firebase Social Login & Phone OTP Login
router.post('/firebase-login', firebaseSocialLogin);
router.post('/send-phone-otp', sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);

// Email Verification
router.post('/send-email-verification', sendEmailVerification);
router.post('/verify-email', verifyEmail);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, updateAvatar);
router.put('/change-password', protect, changePassword);

// Address book routes (backward compatible with /address and /addresses)
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.post('/address', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.delete('/address/:addressId', protect, deleteAddress);

module.exports = router;

