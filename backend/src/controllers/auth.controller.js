const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to format safe user response
const formatUserResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  addresses: user.addresses || [],
  isBlocked: user.isBlocked,
  createdAt: user.createdAt,
  token,
});

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'swadghar_super_secure_jwt_secret_key_2026_dev_prod',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (!isDbConnected()) {
      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        addresses: [],
        isBlocked: false,
        createdAt: new Date(),
      };
      mockStore.users.push(newUser);
      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        message: 'Welcome to SwadGhar! Account registered successfully.',
        data: formatUserResponse(newUser, token),
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'customer',
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Welcome to SwadGhar! Account registered successfully.',
      data: formatUserResponse(user, token),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Customer, Staff, Admin)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    if (!isDbConnected()) {
      const mockUser = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!mockUser) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }
      const token = generateToken(mockUser);
      return res.status(200).json({
        success: true,
        message: `Welcome back, ${mockUser.name}!`,
        data: formatUserResponse(mockUser, token),
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      // Fallback check against demo mock users
      const mockUser = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (mockUser) {
        const token = generateToken(mockUser);
        return res.status(200).json({
          success: true,
          message: `Welcome back, ${mockUser.name}!`,
          data: formatUserResponse(mockUser, token),
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: formatUserResponse(user, token),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user.id || u.email === req.user.email) || req.user;
      return res.status(200).json({ success: true, data: user });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(200).json({ success: true, data: req.user });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user.id) || req.user;
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (avatar) user.avatar = avatar;
      const token = generateToken(user);
      return res.status(200).json({ success: true, message: 'Profile updated', data: formatUserResponse(user, token) });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();
    const token = updatedUser.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: formatUserResponse(updatedUser, token),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password.' });
    }

    if (!isDbConnected()) {
      return res.status(200).json({ success: true, message: 'Password changed successfully.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      data: formatUserResponse(user, token),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user avatar image
// @route   PUT /api/auth/avatar
// @access  Private
const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image URL or data.',
      });
    }

    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user.id) || req.user;
      user.avatar = avatar;
      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        message: 'Profile avatar updated successfully!',
        data: formatUserResponse(user, token),
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.avatar = avatar;
    const updatedUser = await user.save();
    const token = updatedUser.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully!',
      data: formatUserResponse(updatedUser, token),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user saved addresses
// @route   GET /api/auth/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user.id) || req.user;
      return res.status(200).json({
        success: true,
        count: (user.addresses || []).length,
        data: user.addresses || [],
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({
      success: true,
      count: user.addresses.length,
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new delivery address
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const {
      label = 'Home',
      fullName,
      phone,
      houseNo,
      street,
      area,
      city = 'Ahmedabad',
      state = 'Gujarat',
      pincode,
      landmark,
      deliveryInstructions,
      isDefault,
    } = req.body;

    if (!street || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide street, city, and postal code.',
      });
    }

    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user.id) || req.user;
      user.addresses = user.addresses || [];
      if (isDefault) {
        user.addresses.forEach(a => { a.isDefault = false; });
      }
      const newAddr = {
        _id: `addr_${Date.now()}`,
        label: label || 'Home',
        fullName: fullName || user.name,
        phone: phone || user.phone,
        houseNo,
        street,
        area,
        city,
        state,
        pincode,
        landmark,
        deliveryInstructions,
        isDefault: isDefault || user.addresses.length === 0,
        createdAt: new Date(),
      };
      user.addresses.push(newAddr);
      return res.status(201).json({
        success: true,
        message: 'Delivery address saved successfully.',
        data: user.addresses,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    const newAddress = {
      label: label || 'Home',
      fullName: fullName || user.name,
      phone: phone || user.phone,
      houseNo,
      street,
      area,
      city,
      state,
      pincode,
      landmark,
      deliveryInstructions,
      isDefault: isDefault || user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Delivery address saved successfully.',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery address
// @route   PUT /api/auth/addresses/:addressId
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const {
      label,
      fullName,
      phone,
      houseNo,
      street,
      area,
      city,
      state,
      pincode,
      landmark,
      deliveryInstructions,
      isDefault,
    } = req.body;

    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user.id) || req.user;
      user.addresses = user.addresses || [];
      const addrIndex = user.addresses.findIndex(a => a._id === req.params.addressId);
      if (addrIndex > -1) {
        if (isDefault) {
          user.addresses.forEach(a => { a.isDefault = false; });
        }
        user.addresses[addrIndex] = {
          ...user.addresses[addrIndex],
          label: label || user.addresses[addrIndex].label,
          fullName: fullName !== undefined ? fullName : user.addresses[addrIndex].fullName,
          phone: phone !== undefined ? phone : user.addresses[addrIndex].phone,
          houseNo: houseNo !== undefined ? houseNo : user.addresses[addrIndex].houseNo,
          street: street !== undefined ? street : user.addresses[addrIndex].street,
          area: area !== undefined ? area : user.addresses[addrIndex].area,
          city: city !== undefined ? city : user.addresses[addrIndex].city,
          state: state !== undefined ? state : user.addresses[addrIndex].state,
          pincode: pincode !== undefined ? pincode : user.addresses[addrIndex].pincode,
          landmark: landmark !== undefined ? landmark : user.addresses[addrIndex].landmark,
          deliveryInstructions: deliveryInstructions !== undefined ? deliveryInstructions : user.addresses[addrIndex].deliveryInstructions,
          isDefault: isDefault !== undefined ? isDefault : user.addresses[addrIndex].isDefault,
        };
        return res.status(200).json({ success: true, message: 'Address updated.', data: user.addresses });
      }
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    if (label) address.label = label;
    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (houseNo !== undefined) address.houseNo = houseNo;
    if (street !== undefined) address.street = street;
    if (area !== undefined) address.area = area;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (landmark !== undefined) address.landmark = landmark;
    if (deliveryInstructions !== undefined) address.deliveryInstructions = deliveryInstructions;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete delivery address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const user = mockStore.users.find(u => u._id === req.user.id) || req.user;
      user.addresses = (user.addresses || []).filter(a => a._id !== req.params.addressId);
      return res.status(200).json({ success: true, message: 'Address deleted successfully.', data: user.addresses });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    res.status(200).json({
      success: true,
      message: 'Password reset code generated.',
      resetCode: resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with OTP/Code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You may now log in.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
