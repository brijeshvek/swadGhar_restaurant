const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const Franchise = require('../models/Franchise');
const mockStore = require('../utils/mockStore');
const {
  sendRestaurantInquiryNotification,
  sendFranchiseInquiryNotification,
} = require('../services/emailService');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Submit a restaurant dining inquiry or franchise application
// @route   POST /api/inquiries
// @access  Public
const submitInquiry = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      eventType = 'general',
      inquiryCategory = 'restaurant',
      branchCity = 'Ahmedabad',
      branchName,
      investmentBudget,
      experience,
    } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email, phone, and message.',
      });
    }

    const cleanCategory = inquiryCategory === 'franchise' ? 'franchise' : 'restaurant';
    const finalSubject =
      subject ||
      (cleanCategory === 'franchise'
        ? `Franchise Application for ${branchCity || 'Gujarat'}`
        : `Dining Inquiry - ${branchCity} Branch`);

    let branchManagerEmail = `${branchCity.toLowerCase()}.manager@swadghar.com`;
    let targetBranchName = branchName || `SwadGhar - ${branchCity} Branch`;

    if (isDbConnected()) {
      const franchise = await Franchise.findOne({
        city: new RegExp(`^${branchCity}$`, 'i'),
      });
      if (franchise) {
        branchManagerEmail = franchise.managerEmail || branchManagerEmail;
        targetBranchName = franchise.name || targetBranchName;
      }
    }

    const notifiedEmails =
      cleanCategory === 'franchise'
        ? [process.env.ADMIN_EMAIL || 'admin@swadghar.com']
        : [branchManagerEmail, process.env.ADMIN_EMAIL || 'admin@swadghar.com'];

    let inquiry;
    if (isDbConnected()) {
      inquiry = await Inquiry.create({
        name,
        email: email.toLowerCase(),
        phone,
        subject: finalSubject,
        message,
        eventType: cleanCategory === 'franchise' ? 'franchise' : eventType,
        inquiryCategory: cleanCategory,
        branchCity,
        branchName: targetBranchName,
        investmentBudget: investmentBudget || '',
        experience: experience || '',
        notifiedEmails,
        status: 'new',
      });
    } else {
      inquiry = {
        _id: `inq_${Date.now()}`,
        name,
        email: email.toLowerCase(),
        phone,
        subject: finalSubject,
        message,
        eventType: cleanCategory === 'franchise' ? 'franchise' : eventType,
        inquiryCategory: cleanCategory,
        branchCity,
        branchName: targetBranchName,
        investmentBudget: investmentBudget || '',
        experience: experience || '',
        notifiedEmails,
        status: 'new',
        createdAt: new Date(),
      };
      mockStore.inquiries = mockStore.inquiries || [];
      mockStore.inquiries.unshift(inquiry);
    }

    // Trigger Email Notification Dispatches
    if (cleanCategory === 'franchise') {
      await sendFranchiseInquiryNotification({
        inquiry,
        proposedCity: branchCity,
        investmentBudget,
        experience,
      });
    } else {
      await sendRestaurantInquiryNotification({
        inquiry,
        branchName: targetBranchName,
        branchCity,
        branchManagerEmail,
      });
    }

    const responseMsg =
      cleanCategory === 'franchise'
        ? 'Franchise application submitted successfully! Notification sent to Central Administration.'
        : `Your inquiry for the ${branchCity} branch has been submitted! Notifications dispatched to ${branchCity} Branch Manager & Central Admin.`;

    res.status(201).json({
      success: true,
      message: responseMsg,
      data: inquiry,
      notified: notifiedEmails,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get all restaurant inquiries (Admin / Staff)
// @route   GET /api/admin/inquiries
// @access  Private/Admin or Staff
const getInquiries = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    if (!isDbConnected()) {
      let filtered = [...(mockStore.inquiries || [
        {
          _id: 'inq_1',
          name: 'Priyanka Patel',
          email: 'priyanka@gmail.com',
          phone: '9876543210',
          subject: 'Corporate Banquet Booking for 45 Guests',
          message: 'We want to book the royal banquet hall for our company annual celebration on Saturday evening with Gujarati Thali menu.',
          eventType: 'catering',
          status: 'new',
          createdAt: new Date(Date.now() - 3600000 * 4),
        },
        {
          _id: 'inq_2',
          name: 'Karan Shah',
          email: 'karan@gmail.com',
          phone: '9898012345',
          subject: 'Wedding Catering & Live Jalebi Counter Inquiry',
          message: 'Looking for authentic Kathiyawadi live counter setup for wedding reception in Ahmedabad.',
          eventType: 'party_booking',
          status: 'in_progress',
          notes: 'Called client, shared royal menu PDF via WhatsApp.',
          createdAt: new Date(Date.now() - 3600000 * 24),
        },
      ])];

      if (status && status !== 'all') {
        filtered = filtered.filter(i => i.status === status);
      }
      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(i =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.subject.toLowerCase().includes(q)
        );
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { subject: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry status & resolution notes
// @route   PATCH /api/admin/inquiries/:id/status
// @access  Private/Admin or Staff
const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!isDbConnected()) {
      mockStore.inquiries = mockStore.inquiries || [];
      const inq = mockStore.inquiries.find(i => i._id === req.params.id);
      if (inq) {
        if (status) inq.status = status;
        if (notes !== undefined) inq.notes = notes;
        return res.status(200).json({ success: true, message: 'Inquiry updated', data: inq });
      }
      return res.status(200).json({ success: true, message: 'Inquiry updated', data: { _id: req.params.id, status, notes } });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    if (status) inquiry.status = status;
    if (notes !== undefined) inquiry.notes = notes;
    if (status === 'resolved') {
      inquiry.resolvedAt = new Date();
      inquiry.resolvedBy = req.user.id;
    }

    await inquiry.save();

    res.status(200).json({
      success: true,
      message: `Inquiry status updated to '${status}'.`,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/admin/inquiries/:id
// @access  Private/Admin
const deleteInquiry = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      mockStore.inquiries = (mockStore.inquiries || []).filter(i => i._id !== req.params.id);
      return res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
    }

    await Inquiry.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Inquiry record removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
};
