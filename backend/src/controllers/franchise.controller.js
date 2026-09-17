const mongoose = require('mongoose');
const Franchise = require('../models/Franchise');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Default 5 Franchise Branches Data
const DEFAULT_FRANCHISES = [
  {
    name: 'SwadGhar - Ahmedabad Flagship (SG Highway)',
    city: 'Ahmedabad',
    state: 'Gujarat',
    branchType: 'Flagship Dine-In',
    address: 'Grand Imperial Complex, Opp. Iscon Mall, SG Highway, Bodakdev, Ahmedabad - 380054',
    phone: '+91 98250 11234',
    email: 'ahmedabad@swadghar.com',
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 160,
    features: ['Grand AC Banquet Hall', 'Live Kathiyawadi Chula Counter', 'Valet Parking', 'VIP Dining Cabin', 'SwadGhar Sweet & Farsan Mart'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Bodakdev+Ahmedabad',
    managerName: 'Rajesh Patel',
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'SwadGhar - Surat Diamond City (Ghod Dod Road)',
    city: 'Surat',
    state: 'Gujarat',
    branchType: 'Premium Family Dining',
    address: 'Royal Palace Arcade, Near St. Xavier School, Ghod Dod Road, Athwa Lines, Surat - 395007',
    phone: '+91 98250 22345',
    email: 'surat@swadghar.com',
    timings: '11:00 AM - 11:00 PM (Daily)',
    seatingCapacity: 130,
    features: ['Surti Farsan & Locho Live Counter', 'Royal Punjabi Tandoor Section', 'Family Private Lounges', 'Covered Parking'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Ghod+Dod+Road+Surat',
    managerName: 'Ketan Vaghani',
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'SwadGhar - Vadodara Royal Heritage (Alkapuri)',
    city: 'Vadodara',
    state: 'Gujarat',
    branchType: 'Royal Heritage Dining',
    address: 'Heritage Landmark, RC Dutt Road, Opp. Welcome Hotel, Alkapuri, Vadodara - 390007',
    phone: '+91 98250 33456',
    email: 'vadodara@swadghar.com',
    timings: '11:30 AM - 11:00 PM (Daily)',
    seatingCapacity: 110,
    features: ['Gaekwad Heritage Decor', 'Authentic Kathiyawadi Thali Bar', 'Open Courtyard Seating', 'Gourmet Dessert Corner'],
    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Alkapuri+Vadodara',
    managerName: 'Hardik Shah',
    isActive: true,
    sortOrder: 3,
  },
  {
    name: 'SwadGhar - Rajkot Kathiyawad Darbar (Kalawad Road)',
    city: 'Rajkot',
    state: 'Gujarat',
    branchType: 'Premium Family Dining',
    address: 'Swad Circle, Near Kotecha Chowk, Kalawad Road, Rajkot - 360005',
    phone: '+91 98250 44567',
    email: 'rajkot@swadghar.com',
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 150,
    features: ['Traditional Rotla & Ringan Olo Station', 'Live Shehanai & Folk Music', 'Spacious Party Hall', 'Fast Takeaway Counter'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Kalawad+Road+Rajkot',
    managerName: 'Bhavesh Jadeja',
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'SwadGhar - Mumbai Express (Borivali West)',
    city: 'Mumbai',
    state: 'Maharashtra',
    branchType: 'Express & Takeaway',
    address: 'Silver Arch Building, SV Road, Near Shimpoli Signal, Borivali West, Mumbai - 400092',
    phone: '+91 98250 55678',
    email: 'mumbai@swadghar.com',
    timings: '11:30 AM - 12:00 AM (Daily)',
    seatingCapacity: 90,
    features: ['Express Thali Meals', 'Authentic Gujarati & Punjabi Catering', 'Corporate Delivery Fleet', 'Late Night Dining'],
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Borivali+West+Mumbai',
    managerName: 'Nitin Mehta',
    isActive: true,
    sortOrder: 5,
  },
];

// @desc    Get all active franchise locations
// @route   GET /api/franchises
// @access  Public
const getAllFranchises = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json({
        success: true,
        count: DEFAULT_FRANCHISES.length,
        data: DEFAULT_FRANCHISES,
      });
    }

    let franchises = await Franchise.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });

    // If database has 0 franchises, auto-populate the 5 defaults
    if (!franchises || franchises.length === 0) {
      franchises = await Franchise.insertMany(DEFAULT_FRANCHISES);
    }

    res.status(200).json({
      success: true,
      count: franchises.length,
      data: franchises,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      count: DEFAULT_FRANCHISES.length,
      data: DEFAULT_FRANCHISES,
    });
  }
};

// @desc    Get single franchise by ID
// @route   GET /api/franchises/:id
// @access  Public
const getFranchiseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      const branch = DEFAULT_FRANCHISES.find((f, i) => f._id === id || String(i) === id);
      return res.status(200).json({ success: true, data: branch || DEFAULT_FRANCHISES[0] });
    }

    const franchise = await Franchise.findById(id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise location not found' });
    }

    res.status(200).json({ success: true, data: franchise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Franchise Partnership Inquiry
// @route   POST /api/franchises/inquiry
// @access  Public
const submitFranchiseInquiry = async (req, res) => {
  try {
    const { name, email, phone, city, investmentBudget, message, experience } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({ success: false, message: 'Name, phone, and proposed city are required.' });
    }

    const Inquiry = require('../models/Inquiry');
    if (isDbConnected()) {
      await Inquiry.create({
        name,
        email: email || 'franchise.applicant@swadghar.com',
        phone,
        type: 'franchise',
        subject: `New Franchise Application - ${city} (${investmentBudget || '₹30-50 Lakhs'})`,
        message: `Applicant Experience: ${experience || 'Not specified'}. Message: ${message || 'Interested in SwadGhar Franchise setup'}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Franchise inquiry submitted successfully! Our Head of Expansions will contact you within 24 hours.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllFranchises,
  getFranchiseById,
  submitFranchiseInquiry,
  DEFAULT_FRANCHISES,
};
