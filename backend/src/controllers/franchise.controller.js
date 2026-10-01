const mongoose = require('mongoose');
const Franchise = require('../models/Franchise');
const User = require('../models/User');

const isDbConnected = () => mongoose.connection.readyState === 1;
const cache = require('../utils/cache');

// Default 15 Franchise Branches Data (5 Cities x 3 Outlets each)
const DEFAULT_FRANCHISES = [
  // ================= 1. AHMEDABAD (3 Outlets) =================
  {
    name: 'SwadGhar - Ahmedabad SG Highway Flagship',
    city: 'Ahmedabad',
    state: 'Gujarat',
    branchType: 'Flagship Dine-In',
    address: 'Grand Imperial Complex, Opp. Iscon Mall, SG Highway, Bodakdev, Ahmedabad - 380054',
    phone: '+91 98250 11234',
    email: 'ahmedabad.sghighway@swadghar.com',
    managerName: 'Rajesh Patel',
    managerEmail: 'ahmedabad.manager@swadghar.com',
    managerPhone: '+91 98251 10001',
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 160,
    features: ['Grand AC Banquet Hall', 'Live Kathiyawadi Chula', 'Valet Parking', 'VIP Dining Cabin', 'Sweet & Farsan Mart'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Bodakdev+Ahmedabad',
    staffTeam: [
      { name: 'Mukesh Maharaj', designation: 'Executive Head Chef', email: 'ahmedabad.chef@swadghar.com', phone: '+91 98251 10002', specialty: 'Authentic Kathiyawadi Thali' },
      { name: 'Dhaval Dave', designation: 'Floor Captain', email: 'ahmedabad.captain@swadghar.com', phone: '+91 98251 10005', specialty: 'Banquet Hospitality' },
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'SwadGhar - Ahmedabad Vastrapur Lake',
    city: 'Ahmedabad',
    state: 'Gujarat',
    branchType: 'Premium Family Dining',
    address: 'Lakeview Plaza, Near AlphaOne Mall, Vastrapur, Ahmedabad - 380015',
    phone: '+91 98250 11235',
    email: 'ahmedabad.vastrapur@swadghar.com',
    managerName: 'Jayesh Shah',
    managerEmail: 'ahmedabad.vastrapur@swadghar.com',
    managerPhone: '+91 98251 10011',
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 130,
    features: ['Lakeside View Seating', 'Live Farsan Counter', 'Family Lounge', 'Express Takeaway'],
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Vastrapur+Ahmedabad',
    staffTeam: [
      { name: 'Harish Joshi', designation: 'Head Chef', email: 'ahmedabad.farsan@swadghar.com', phone: '+91 98251 10012', specialty: 'Gujarati Rasoi & Dal Kadhi' },
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'SwadGhar - Ahmedabad Maninagar Heritage',
    city: 'Ahmedabad',
    state: 'Gujarat',
    branchType: 'Royal Heritage Dining',
    address: 'Heritage Corner, Rambaug Road, Near Kankaria Gate 3, Maninagar, Ahmedabad - 380008',
    phone: '+91 98250 11236',
    email: 'ahmedabad.maninagar@swadghar.com',
    managerName: 'Paresh Dave',
    managerEmail: 'ahmedabad.maninagar@swadghar.com',
    managerPhone: '+91 98251 10021',
    timings: '11:00 AM - 11:00 PM (Daily)',
    seatingCapacity: 110,
    features: ['Kankaria View Dining', 'Heritage Ambiance', 'Traditional Thali Service', 'AC Banquet'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Maninagar+Ahmedabad',
    staffTeam: [
      { name: 'Sanjay Vaghela', designation: 'Kitchen Lead', email: 'ahmedabad.kitchen@swadghar.com', phone: '+91 98251 10022', specialty: 'Gujarati Farsaans' },
    ],
    isActive: true,
    sortOrder: 3,
  },

  // ================= 2. SURAT (3 Outlets) =================
  {
    name: 'SwadGhar - Surat Ghod Dod Road',
    city: 'Surat',
    state: 'Gujarat',
    branchType: 'Premium Family Dining',
    address: 'Royal Palace Arcade, Near St. Xavier School, Ghod Dod Road, Athwa Lines, Surat - 395007',
    phone: '+91 98250 22345',
    email: 'surat.ghoddod@swadghar.com',
    managerName: 'Ketan Vaghani',
    managerEmail: 'surat.manager@swadghar.com',
    managerPhone: '+91 98252 20001',
    timings: '11:00 AM - 11:00 PM (Daily)',
    seatingCapacity: 130,
    features: ['Surti Locho Live Counter', 'Royal Punjabi Tandoor', 'Private Lounges', 'Valet Parking'],
    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Ghod+Dod+Road+Surat',
    staffTeam: [
      { name: 'Pravin Maharaj', designation: 'Executive Head Chef', email: 'surat.chef@swadghar.com', phone: '+91 98252 20002', specialty: 'Surti Undhiyu' },
      { name: 'Bhupat Solanki', designation: 'Live Farsan Chef', email: 'surat.farsan@swadghar.com', phone: '+91 98252 20003', specialty: 'Surti Locho & Sev Khamani' },
    ],
    isActive: true,
    sortOrder: 4,
  },
  {
    name: 'SwadGhar - Surat Adajan Prime',
    city: 'Surat',
    state: 'Gujarat',
    branchType: 'Flagship Dine-In',
    address: 'Shreeji Avenue, Opp. Prime Arcade, Anand Mahal Road, Adajan, Surat - 395009',
    phone: '+91 98250 22346',
    email: 'surat.adajan@swadghar.com',
    managerName: 'Amit Solanki',
    managerEmail: 'surat.adajan@swadghar.com',
    managerPhone: '+91 98252 20011',
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 140,
    features: ['Grand Family Dining', 'Live Dhokla Counter', 'Covered Parking', 'Kids Play Zone'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Adajan+Surat',
    staffTeam: [
      { name: 'Gurpreet Singh', designation: 'Punjabi Master Chef', email: 'surat.tandoor@swadghar.com', phone: '+91 98252 20012', specialty: 'Paneer & Tandoor' },
    ],
    isActive: true,
    sortOrder: 5,
  },
  {
    name: 'SwadGhar - Surat Vesu VIP Road',
    city: 'Surat',
    state: 'Gujarat',
    branchType: 'Royal Heritage Dining',
    address: 'Celebrity Greens, VIP Road, Near VNSGU University, Vesu, Surat - 395007',
    phone: '+91 98250 22347',
    email: 'surat.vesu@swadghar.com',
    managerName: 'Jignesh Patel',
    managerEmail: 'surat.vesu@swadghar.com',
    managerPhone: '+91 98252 20021',
    timings: '11:30 AM - 11:30 PM (Daily)',
    seatingCapacity: 150,
    features: ['Luxury VIP Cabins', 'Open Terrace Garden', 'Authentic Thali', 'Gourmet Dessert Bar'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Vesu+Surat',
    staffTeam: [
      { name: 'Nilesh Desai', designation: 'Captain', email: 'surat.captain@swadghar.com', phone: '+91 98252 20022', specialty: 'VIP Guest Relations' },
    ],
    isActive: true,
    sortOrder: 6,
  },

  // ================= 3. VADODARA (3 Outlets) =================
  {
    name: 'SwadGhar - Vadodara Alkapuri Heritage',
    city: 'Vadodara',
    state: 'Gujarat',
    branchType: 'Royal Heritage Dining',
    address: 'Heritage Landmark, RC Dutt Road, Opp. Welcome Hotel, Alkapuri, Vadodara - 390007',
    phone: '+91 98250 33456',
    email: 'vadodara.alkapuri@swadghar.com',
    managerName: 'Hardik Shah',
    managerEmail: 'vadodara.manager@swadghar.com',
    managerPhone: '+91 98253 30001',
    timings: '11:30 AM - 11:00 PM (Daily)',
    seatingCapacity: 120,
    features: ['Gaekwad Heritage Decor', 'Authentic Kathiyawadi Thali', 'Courtyard Seating', 'Valet Parking'],
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Alkapuri+Vadodara',
    staffTeam: [
      { name: 'Shambhu Maharaj', designation: 'Royal Thali Chef', email: 'vadodara.chef@swadghar.com', phone: '+91 98253 30002', specialty: 'Wedding Feast Thali' },
    ],
    isActive: true,
    sortOrder: 7,
  },
  {
    name: 'SwadGhar - Vadodara Gotri Royal',
    city: 'Vadodara',
    state: 'Gujarat',
    branchType: 'Premium Family Dining',
    address: 'Canal View Square, Gotri-Sevasi Main Road, Gotri, Vadodara - 390021',
    phone: '+91 98250 33457',
    email: 'vadodara.gotri@swadghar.com',
    managerName: 'Mehul Pandya',
    managerEmail: 'vadodara.gotri@swadghar.com',
    managerPhone: '+91 98253 30011',
    timings: '11:00 AM - 11:00 PM (Daily)',
    seatingCapacity: 130,
    features: ['Canal View Gazebo', 'Live Tandoor', 'Family AC Hall', 'Party Terrace'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Gotri+Vadodara',
    staffTeam: [
      { name: 'Manpreet Singh', designation: 'Tandoor Chef', email: 'vadodara.curry@swadghar.com', phone: '+91 98253 30012', specialty: 'Biryani & Naan' },
    ],
    isActive: true,
    sortOrder: 8,
  },
  {
    name: 'SwadGhar - Vadodara Manjalpur Courtyard',
    city: 'Vadodara',
    state: 'Gujarat',
    branchType: 'Express & Takeaway',
    address: 'Shreenathji Complex, Tarsali Bypass Road, Manjalpur, Vadodara - 390011',
    phone: '+91 98250 33458',
    email: 'vadodara.manjalpur@swadghar.com',
    managerName: 'Chirag Joshi',
    managerEmail: 'vadodara.manjalpur@swadghar.com',
    managerPhone: '+91 98253 30021',
    timings: '11:00 AM - 11:00 PM (Daily)',
    seatingCapacity: 95,
    features: ['Express Thali Meals', 'Fast Online Delivery', 'Drive-thru Takeaway', 'AC Dining'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Manjalpur+Vadodara',
    staffTeam: [
      { name: 'Gopalbhai Barot', designation: 'Khichdi Chef', email: 'vadodara.kadhi@swadghar.com', phone: '+91 98253 30022', specialty: 'Comfort Foods' },
    ],
    isActive: true,
    sortOrder: 9,
  },

  // ================= 4. RAJKOT (3 Outlets) =================
  {
    name: 'SwadGhar - Rajkot Kalawad Road',
    city: 'Rajkot',
    state: 'Gujarat',
    branchType: 'Flagship Dine-In',
    address: 'Swad Circle, Near Kotecha Chowk, Kalawad Road, Rajkot - 360005',
    phone: '+91 98250 44567',
    email: 'rajkot.kalawad@swadghar.com',
    managerName: 'Bhavesh Jadeja',
    managerEmail: 'rajkot.manager@swadghar.com',
    managerPhone: '+91 98254 40001',
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 150,
    features: ['Live Ringan Olo & Bajra Rotla Chula', 'Traditional Folk Ambience', 'Party Banquet', 'Farsan Mart'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Kalawad+Road+Rajkot',
    staffTeam: [
      { name: 'Govind Maharaj', designation: 'Desi Chula Head Maharaj', email: 'rajkot.chef@swadghar.com', phone: '+91 98254 40002', specialty: 'Desi Ringan Olo' },
      { name: 'Ramsangbhai Darbar', designation: 'Rotla Master', email: 'rajkot.rotla@swadghar.com', phone: '+91 98254 40003', specialty: 'Bajra Rotlo with White Butter' },
    ],
    isActive: true,
    sortOrder: 10,
  },
  {
    name: 'SwadGhar - Rajkot 150 Feet Ring Road',
    city: 'Rajkot',
    state: 'Gujarat',
    branchType: 'Premium Family Dining',
    address: 'Fortune Imperial Mall, Near Big Bazaar, 150 Feet Ring Road, Rajkot - 360004',
    phone: '+91 98250 44568',
    email: 'rajkot.ringroad@swadghar.com',
    managerName: 'Hitesh Makwana',
    managerEmail: 'rajkot.ringroad@swadghar.com',
    managerPhone: '+91 98254 40011',
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 140,
    features: ['Mall View Dining', 'Family Lounges', 'Kathiyawadi Thali', 'Valet Parking'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Ring+Road+Rajkot',
    staffTeam: [
      { name: 'Divyesh Kotak', designation: 'Floor Captain', email: 'rajkot.captain@swadghar.com', phone: '+91 98254 40012', specialty: 'Event Coordination' },
    ],
    isActive: true,
    sortOrder: 11,
  },
  {
    name: 'SwadGhar - Rajkot Yagnik Road Palace',
    city: 'Rajkot',
    state: 'Gujarat',
    branchType: 'Royal Heritage Dining',
    address: 'Darbar Arcade, Dr. Yagnik Road, Near Jagnath Plot, Rajkot - 360001',
    phone: '+91 98250 44569',
    email: 'rajkot.yagnik@swadghar.com',
    managerName: 'Yuvrajsinh Vala',
    managerEmail: 'rajkot.yagnik@swadghar.com',
    managerPhone: '+91 98254 40021',
    timings: '11:00 AM - 11:00 PM (Daily)',
    seatingCapacity: 120,
    features: ['Royal Darbar Architecture', 'Heritage Kathiyawadi Rasoi', 'Earthen Matka Chaas Bar', 'VIP Cabins'],
    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Yagnik+Road+Rajkot',
    staffTeam: [
      { name: 'Suresh Dodiya', designation: 'Chaas & Beverages Master', email: 'rajkot.beverages@swadghar.com', phone: '+91 98254 40022', specialty: 'Masala Chaas' },
    ],
    isActive: true,
    sortOrder: 12,
  },

  // ================= 5. MUMBAI (3 Outlets) =================
  {
    name: 'SwadGhar - Mumbai Borivali West',
    city: 'Mumbai',
    state: 'Maharashtra',
    branchType: 'Flagship Dine-In',
    address: 'Silver Arch Building, SV Road, Near Shimpoli Signal, Borivali West, Mumbai - 400092',
    phone: '+91 98250 55678',
    email: 'mumbai.borivali@swadghar.com',
    managerName: 'Nitin Mehta',
    managerEmail: 'mumbai.manager@swadghar.com',
    managerPhone: '+91 98255 50001',
    timings: '11:30 AM - 12:00 AM (Daily)',
    seatingCapacity: 110,
    features: ['Express Gujarati & Punjabi Thali', 'Corporate Fleet Delivery', 'Midnight Dining', 'Valet Service'],
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Borivali+West+Mumbai',
    staffTeam: [
      { name: 'Kishorebhai Maharaj', designation: 'Head Gujarati Chef', email: 'mumbai.chef@swadghar.com', phone: '+91 98255 50002', specialty: 'Gujarati Thali' },
      { name: 'Balwinder Singh', designation: 'Master Punjabi Chef', email: 'mumbai.punjabi@swadghar.com', phone: '+91 98255 50003', specialty: 'Dal Makhani & Paneer' },
    ],
    isActive: true,
    sortOrder: 13,
  },
  {
    name: 'SwadGhar - Mumbai Kandivali East',
    city: 'Mumbai',
    state: 'Maharashtra',
    branchType: 'Premium Family Dining',
    address: 'Thakur Arcade, 90 Feet Road, Thakur Village, Kandivali East, Mumbai - 400101',
    phone: '+91 98250 55679',
    email: 'mumbai.kandivali@swadghar.com',
    managerName: 'Rajesh Sawant',
    managerEmail: 'mumbai.kandivali@swadghar.com',
    managerPhone: '+91 98255 50011',
    timings: '11:30 AM - 11:30 PM (Daily)',
    seatingCapacity: 120,
    features: ['Thakur Village Family Seating', 'Live Farsan Platter', 'Online Express Delivery', 'Kids Section'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Kandivali+East+Mumbai',
    staffTeam: [
      { name: 'Mahesh Doshi', designation: 'Farsan Chef', email: 'mumbai.farsan@swadghar.com', phone: '+91 98255 50012', specialty: 'Khandvi & Dhokla' },
    ],
    isActive: true,
    sortOrder: 14,
  },
  {
    name: 'SwadGhar - Mumbai Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    branchType: 'Royal Heritage Dining',
    address: 'Royal Classic Tower, Link Road, Near Infiniti Mall, Lokhandwala, Andheri West, Mumbai - 400053',
    phone: '+91 98250 55680',
    email: 'mumbai.andheri@swadghar.com',
    managerName: 'Sagar Kulkarni',
    managerEmail: 'mumbai.andheri@swadghar.com',
    managerPhone: '+91 98255 50021',
    timings: '12:00 PM - 12:30 AM (Daily)',
    seatingCapacity: 135,
    features: ['Lokhandwala VIP Lounges', 'Late Night Live Kitchen', 'Royal Kathiyawadi Banquet', 'Valet Parking'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Andheri+West+Mumbai',
    staffTeam: [
      { name: 'Sameer Kulkarni', designation: 'Floor Captain', email: 'mumbai.captain@swadghar.com', phone: '+91 98255 50022', specialty: 'VIP Dining Management' },
    ],
    isActive: true,
    sortOrder: 15,
  },
];

// @desc    Get all active franchise locations (Public & Admin)
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

    let franchises = await Franchise.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();

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

// @desc    Get logged in manager's specific branch and staff
// @route   GET /api/franchises/my-branch
// @access  Private (Staff / Admin)
const getMyBranch = async (req, res) => {
  try {
    const userEmail = req.user.email?.toLowerCase();
    const isAdmin = req.user.role === 'admin';

    if (!isDbConnected()) {
      let branch = DEFAULT_FRANCHISES.find(
        (f) => f.managerEmail?.toLowerCase() === userEmail || f.email?.toLowerCase() === userEmail
      );
      if (!branch) branch = DEFAULT_FRANCHISES[0];
      return res.status(200).json({ success: true, data: branch, isAdmin });
    }

    let branch = await Franchise.findOne({
      $or: [
        { managerEmail: userEmail },
        { email: userEmail },
      ],
    }).lean();

    if (!branch && isAdmin) {
      branch = await Franchise.findOne({ isActive: true }).sort({ sortOrder: 1 }).lean();
    }

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'No franchise branch associated with this manager account.',
      });
    }

    res.status(200).json({
      success: true,
      data: branch,
      isAdmin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    const franchise = await Franchise.findById(id).lean();
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise location not found' });
    }

    res.status(200).json({ success: true, data: franchise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new franchise with Manager login account (Admin Only)
// @route   POST /api/franchises
// @access  Private (Admin Only)
const createFranchise = async (req, res) => {
  try {
    const {
      name,
      city,
      state = 'Gujarat',
      branchType = 'Premium Family Dining',
      address,
      phone,
      email,
      managerName,
      managerEmail,
      managerPassword = 'Staff@123',
      managerPhone,
      seatingCapacity = 120,
      features = [],
      image,
      googleMapsUrl,
      staffTeam = [],
    } = req.body;

    if (!name || !city || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide branch name, city, address, and phone.',
      });
    }

    if (!isDbConnected()) {
      const newBranch = {
        _id: `fran_${Date.now()}`,
        name,
        city,
        state,
        branchType,
        address,
        phone,
        email: email || `${city.toLowerCase()}@swadghar.com`,
        managerName: managerName || 'Branch Manager',
        managerEmail: managerEmail || `${city.toLowerCase()}.manager@swadghar.com`,
        managerPhone: managerPhone || phone,
        seatingCapacity,
        features,
        image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        googleMapsUrl,
        staffTeam,
        isActive: true,
        sortOrder: DEFAULT_FRANCHISES.length + 1,
      };
      DEFAULT_FRANCHISES.push(newBranch);
      return res.status(201).json({
        success: true,
        message: 'Franchise created successfully!',
        data: newBranch,
      });
    }

    // Create Franchise Document
    const franchise = await Franchise.create({
      name,
      city,
      state,
      branchType,
      address,
      phone,
      email: email || `${city.toLowerCase()}@swadghar.com`,
      managerName: managerName || 'Branch Manager',
      managerEmail: managerEmail ? managerEmail.toLowerCase() : `${city.toLowerCase()}.manager@swadghar.com`,
      managerPhone: managerPhone || phone,
      seatingCapacity,
      features: features.length ? features : ['Pure Veg & Kathiyawadi', 'AC Dining', 'Live Kitchen'],
      image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      googleMapsUrl: googleMapsUrl || 'https://maps.google.com',
      staffTeam,
    });

    // Create or Update the Manager's User login account
    if (franchise.managerEmail) {
      let managerUser = await User.findOne({ email: franchise.managerEmail });
      if (!managerUser) {
        await User.create({
          name: franchise.managerName,
          email: franchise.managerEmail,
          password: managerPassword,
          phone: franchise.managerPhone || franchise.phone,
          role: 'staff',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Franchise branch and manager login created successfully!',
      data: franchise,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Franchise Manager Credentials (Admin Only)
// @route   PUT /api/franchises/:id/manager-credentials
// @access  Private (Admin Only)
const updateManagerCredentials = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerName, managerEmail, managerPassword, managerPhone } = req.body;

    if (!isDbConnected()) {
      const branch = DEFAULT_FRANCHISES.find((f) => f._id === id);
      if (branch) {
        if (managerName) branch.managerName = managerName;
        if (managerEmail) branch.managerEmail = managerEmail;
        if (managerPhone) branch.managerPhone = managerPhone;
      }
      return res.status(200).json({
        success: true,
        message: 'Manager credentials updated successfully!',
        data: branch,
      });
    }

    const franchise = await Franchise.findById(id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise branch not found' });
    }

    const oldEmail = franchise.managerEmail?.toLowerCase();
    const newEmail = (managerEmail || oldEmail)?.toLowerCase();

    // Update Franchise record
    if (managerName) franchise.managerName = managerName;
    if (managerEmail) franchise.managerEmail = newEmail;
    if (managerPhone) franchise.managerPhone = managerPhone;
    await franchise.save();

    // Update or Create Manager User account
    let managerUser = await User.findOne({ email: oldEmail });
    if (!managerUser && newEmail) {
      managerUser = await User.findOne({ email: newEmail });
    }

    if (managerUser) {
      if (managerName) managerUser.name = managerName;
      if (newEmail) managerUser.email = newEmail;
      if (managerPhone) managerUser.phone = managerPhone;
      if (managerPassword) managerUser.password = managerPassword; // pre-save hook will hash it
      await managerUser.save();
    } else if (newEmail) {
      await User.create({
        name: managerName || franchise.managerName,
        email: newEmail,
        password: managerPassword || 'Staff@123',
        phone: managerPhone || franchise.phone,
        role: 'staff',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Branch manager credentials updated and synced successfully!',
      data: franchise,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add Staff member to a franchise branch (Admin or Branch Manager)
// @route   POST /api/franchises/:id/staff
// @access  Private
const addStaffToFranchise = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, phone, experience, specialty, shift, avatar, email } = req.body;

    if (!name || !designation || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Staff name, designation, and phone are required.',
      });
    }

    if (!isDbConnected()) {
      const branch = DEFAULT_FRANCHISES.find((f) => f._id === id) || DEFAULT_FRANCHISES[0];
      const newStaff = {
        _id: `staff_${Date.now()}`,
        name,
        designation,
        phone,
        email: email || '',
        experience: experience || '5+ Years',
        specialty: specialty || 'Hospitality',
        shift: shift || 'Full Day',
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      };
      branch.staffTeam.push(newStaff);
      return res.status(201).json({
        success: true,
        message: 'Staff member added to branch team.',
        data: branch.staffTeam,
      });
    }

    const franchise = await Franchise.findById(id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise branch not found' });
    }

    // Check manager authorization if not admin
    if (
      req.user.role !== 'admin' &&
      franchise.managerEmail?.toLowerCase() !== req.user.email?.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to manage staff for your own branch.',
      });
    }

    const newStaff = {
      name,
      designation,
      phone,
      email: email || '',
      experience: experience || '5+ Years',
      specialty: specialty || 'Hospitality & Service',
      shift: shift || 'Full Day',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    };

    franchise.staffTeam.push(newStaff);
    await franchise.save();

    res.status(201).json({
      success: true,
      message: 'Staff member added to branch team successfully!',
      data: franchise.staffTeam,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove Staff member from a franchise branch (Admin or Branch Manager)
// @route   DELETE /api/franchises/:id/staff/:staffId
// @access  Private
const removeStaffFromFranchise = async (req, res) => {
  try {
    const { id, staffId } = req.params;

    if (!isDbConnected()) {
      const branch = DEFAULT_FRANCHISES.find((f) => f._id === id) || DEFAULT_FRANCHISES[0];
      branch.staffTeam = branch.staffTeam.filter((s) => s._id !== staffId && s.email !== staffId);
      return res.status(200).json({
        success: true,
        message: 'Staff member removed from branch team.',
        data: branch.staffTeam,
      });
    }

    const franchise = await Franchise.findById(id);
    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise branch not found' });
    }

    // Check manager authorization if not admin
    if (
      req.user.role !== 'admin' &&
      franchise.managerEmail?.toLowerCase() !== req.user.email?.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to manage staff for your own branch.',
      });
    }

    franchise.staffTeam = franchise.staffTeam.filter(
      (s) => s._id.toString() !== staffId && s.email !== staffId
    );
    await franchise.save();

    res.status(200).json({
      success: true,
      message: 'Staff member removed from branch team successfully.',
      data: franchise.staffTeam,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update franchise branch general details
// @route   PUT /api/franchises/:id
// @access  Private (Admin Only)
const updateFranchise = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const branch = DEFAULT_FRANCHISES.find((f) => f._id === id);
      if (branch) Object.assign(branch, req.body);
      return res.status(200).json({ success: true, message: 'Franchise updated', data: branch });
    }

    const franchise = await Franchise.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!franchise) {
      return res.status(404).json({ success: false, message: 'Franchise branch not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Franchise details updated successfully!',
      data: franchise,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete franchise branch
// @route   DELETE /api/franchises/:id
// @access  Private (Admin Only)
const deleteFranchise = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isDbConnected()) {
      return res.status(200).json({ success: true, message: 'Franchise deactivated' });
    }

    await Franchise.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Franchise branch removed successfully.',
    });
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
  getMyBranch,
  getFranchiseById,
  createFranchise,
  updateFranchise,
  updateManagerCredentials,
  addStaffToFranchise,
  removeStaffFromFranchise,
  deleteFranchise,
  submitFranchiseInquiry,
  DEFAULT_FRANCHISES,
};

