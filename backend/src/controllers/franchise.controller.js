const mongoose = require('mongoose');
const Franchise = require('../models/Franchise');
const User = require('../models/User');

const isDbConnected = () => mongoose.connection.readyState === 1;
const cache = require('../utils/cache');

// Default 5 Franchise Branches Data with Branch Manager & Staff Team
const DEFAULT_FRANCHISES = [
  {
    name: 'SwadGhar - Ahmedabad Flagship (SG Highway)',
    city: 'Ahmedabad',
    state: 'Gujarat',
    branchType: 'Flagship Dine-In',
    address: 'Grand Imperial Complex, Opp. Iscon Mall, SG Highway, Bodakdev, Ahmedabad - 380054',
    phone: '+91 98250 11234',
    email: 'ahmedabad@swadghar.com',
    managerName: 'Rajesh Patel',
    managerEmail: 'ahmedabad.manager@swadghar.com',
    managerPhone: '+91 98251 10001',
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 160,
    features: ['Grand AC Banquet Hall', 'Live Kathiyawadi Chula Counter', 'Valet Parking', 'VIP Dining Cabin', 'SwadGhar Sweet & Farsan Mart'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Bodakdev+Ahmedabad',
    staffTeam: [
      { name: 'Mukesh Maharaj', designation: 'Executive Head Chef (Kathiyawadi)', email: 'ahmedabad.chef@swadghar.com', phone: '+91 98251 10002', experience: '18+ Years', specialty: 'Authentic Kathiyawadi & Gujarati Thali', shift: 'Morning & Lunch', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Harish Joshi', designation: 'Master Farsan & Sweets Chef', email: 'ahmedabad.farsan@swadghar.com', phone: '+91 98251 10003', experience: '12+ Years', specialty: 'Khaman, Handvo & Mohanthal', shift: 'Morning Shift', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Vikram Singh', designation: 'Royal Tandoor & Punjabi Master', email: 'ahmedabad.tandoor@swadghar.com', phone: '+91 98251 10004', experience: '10+ Years', specialty: 'Butter Garlic Naan & Dal Makhani', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Dhaval Dave', designation: 'Senior Floor Captain', email: 'ahmedabad.captain@swadghar.com', phone: '+91 98251 10005', experience: '8+ Years', specialty: 'Banquet Hospitality & Service', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Sanjay Vaghela', designation: 'Kitchen Operations Supervisor', email: 'ahmedabad.kitchen@swadghar.com', phone: '+91 98251 10006', experience: '9+ Years', specialty: 'Food Quality & Inventory Control', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
      { name: 'Pooja Solanki', designation: 'Front Desk & Billing Executive', email: 'ahmedabad.cashier@swadghar.com', phone: '+91 98251 10007', experience: '6+ Years', specialty: 'POS Systems & Guest Invoicing', shift: 'Day Shift', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { name: 'Jayesh Makwana', designation: 'Senior Table Service Host', email: 'ahmedabad.host@swadghar.com', phone: '+91 98251 10008', experience: '7+ Years', specialty: 'Traditional Thali Service Protocol', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80' },
      { name: 'Karan Prajapati', designation: 'Hygiene & Food Safety Lead', email: 'ahmedabad.hygiene@swadghar.com', phone: '+91 98251 10009', experience: '5+ Years', specialty: '100% Cleanliness & ISO Food Standards', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
      { name: 'Mehul Chauhan', designation: 'Dispatch & Delivery Logistics Lead', email: 'ahmedabad.dispatch@swadghar.com', phone: '+91 98251 10010', experience: '5+ Years', specialty: 'Fast Packaging & Online Orders', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
    ],
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
    managerName: 'Ketan Vaghani',
    managerEmail: 'surat.manager@swadghar.com',
    managerPhone: '+91 98252 20001',
    timings: '11:00 AM - 11:00 PM (Daily)',
    seatingCapacity: 130,
    features: ['Surti Farsan & Locho Live Counter', 'Royal Punjabi Tandoor Section', 'Family Private Lounges', 'Covered Parking'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Ghod+Dod+Road+Surat',
    staffTeam: [
      { name: 'Pravin Maharaj', designation: 'Executive Head Chef (Surti Specials)', email: 'surat.chef@swadghar.com', phone: '+91 98252 20002', experience: '16+ Years', specialty: 'Surti Undhiyu & Kathiyawadi Shaak', shift: 'Morning & Lunch', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Bhupat Solanki', designation: 'Surti Locho & Farsan Craftsman', email: 'surat.farsan@swadghar.com', phone: '+91 98252 20003', experience: '11+ Years', specialty: 'Live Surti Locho, Sev Khamani & Patra', shift: 'Morning Shift', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Gurpreet Singh', designation: 'Royal Punjabi Master Chef', email: 'surat.tandoor@swadghar.com', phone: '+91 98252 20004', experience: '13+ Years', specialty: 'Paneer Tikka, Shahi Gravy & Biryani', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Nilesh Desai', designation: 'Dining Floor Captain', email: 'surat.captain@swadghar.com', phone: '+91 98252 20005', experience: '7+ Years', specialty: 'Table Reservations & Family Service', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Alpesh Patel', designation: 'Kitchen Store & Stock Lead', email: 'surat.kitchen@swadghar.com', phone: '+91 98252 20006', experience: '8+ Years', specialty: 'Fresh Farm Ingredients & Dairy Quality', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
      { name: 'Bhavna Mistry', designation: 'Cashier & Front Desk Lead', email: 'surat.cashier@swadghar.com', phone: '+91 98252 20007', experience: '6+ Years', specialty: 'Express Checkouts & Feedback Desk', shift: 'Day Shift', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { name: 'Kishore Rana', designation: 'Senior Steward & Host', email: 'surat.host@swadghar.com', phone: '+91 98252 20008', experience: '6+ Years', specialty: 'Kathiyawadi Thali Refill Service', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80' },
      { name: 'Chetan Lad', designation: 'Beverages & Dairy Counter Lead', email: 'surat.beverages@swadghar.com', phone: '+91 98252 20009', experience: '5+ Years', specialty: 'Masala Chaas, Shrikhand & Lassi Bar', shift: 'Day Shift', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
      { name: 'Dharmesh Goti', designation: 'Delivery & Takeaway Lead', email: 'surat.dispatch@swadghar.com', phone: '+91 98252 20010', experience: '4+ Years', specialty: 'Express Home Delivery Dispatch', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
    ],
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
    managerName: 'Hardik Shah',
    managerEmail: 'vadodara.manager@swadghar.com',
    managerPhone: '+91 98253 30001',
    timings: '11:30 AM - 11:00 PM (Daily)',
    seatingCapacity: 110,
    features: ['Gaekwad Heritage Decor', 'Authentic Kathiyawadi Thali Bar', 'Open Courtyard Seating', 'Gourmet Dessert Corner'],
    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Alkapuri+Vadodara',
    staffTeam: [
      { name: 'Shambhu Maharaj', designation: 'Executive Royal Thali Chef', email: 'vadodara.chef@swadghar.com', phone: '+91 98253 30002', experience: '17+ Years', specialty: 'Royal Gujarati Wedding & Festival Thali', shift: 'Morning & Lunch', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Gopalbhai Barot', designation: 'Kadhi & Khichdi Specialist', email: 'vadodara.kadhi@swadghar.com', phone: '+91 98253 30003', experience: '10+ Years', specialty: 'Vaghareli Khichdi & Sweet Sour Kadhi', shift: 'Morning Shift', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Manpreet Singh', designation: 'North Indian Gravy Master', email: 'vadodara.curry@swadghar.com', phone: '+91 98253 30004', experience: '11+ Years', specialty: 'Dum Biryani & Rich Cashew Gravies', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Pratik Pandya', designation: 'Senior Floor Captain', email: 'vadodara.captain@swadghar.com', phone: '+91 98253 30005', experience: '9+ Years', specialty: 'VIP Courtyard Dining Management', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Jignesh Parmar', designation: 'Kitchen Hygiene Manager', email: 'vadodara.kitchen@swadghar.com', phone: '+91 98253 30006', experience: '8+ Years', specialty: 'Pure Desi Ghee Quality Testing', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Riddhi Soni', designation: 'Billing & Reservations Lead', email: 'vadodara.cashier@swadghar.com', phone: '+91 98253 30007', experience: '5+ Years', specialty: 'Online Booking Desk & POS Billing', shift: 'Day Shift', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { name: 'Mayur Rathod', designation: 'Royal Courtyard Steward', email: 'vadodara.host@swadghar.com', phone: '+91 98253 30008', experience: '7+ Years', specialty: 'Traditional Gujarati Welcome Hospitality', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80' },
      { name: 'Ashok Gadhvi', designation: 'Mithai & Sweet Artisan', email: 'vadodara.dessert@swadghar.com', phone: '+91 98253 30009', experience: '9+ Years', specialty: 'Basundi, Kansar & Fresh Jalebi', shift: 'Day Shift', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
      { name: 'Tushar Panchal', designation: 'Order Dispatch Coordinator', email: 'vadodara.dispatch@swadghar.com', phone: '+91 98253 30010', experience: '5+ Years', specialty: 'SwadGhar Parcel Packaging', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
    ],
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
    managerName: 'Bhavesh Jadeja',
    managerEmail: 'rajkot.manager@swadghar.com',
    managerPhone: '+91 98254 40001',
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 150,
    features: ['Traditional Rotla & Ringan Olo Station', 'Live Shehanai & Folk Music', 'Spacious Party Hall', 'Fast Takeaway Counter'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Kalawad+Road+Rajkot',
    staffTeam: [
      { name: 'Govind Maharaj', designation: 'Desi Chula Head Maharaj', email: 'rajkot.chef@swadghar.com', phone: '+91 98254 40002', experience: '20+ Years', specialty: 'Desi Ringan Olo, Sev Tameta & Undhiyu', shift: 'Morning & Lunch', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Ramsangbhai Darbar', designation: 'Bajra Rotla & Bhakri Master', email: 'rajkot.rotla@swadghar.com', phone: '+91 98254 40003', experience: '14+ Years', specialty: 'Handcrafted Bajra Rotlo with White Butter', shift: 'Morning & Evening', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Jaswant Singh', designation: 'Tandoori & Punjabi Specialist', email: 'rajkot.tandoor@swadghar.com', phone: '+91 98254 40004', experience: '10+ Years', specialty: 'Charcoal Clay Oven Tandoor Delicacies', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Divyesh Kotak', designation: 'Darbar Dining Captain', email: 'rajkot.captain@swadghar.com', phone: '+91 98254 40005', experience: '8+ Years', specialty: 'Family Banquets & Live Folk Coordination', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Ravi Ahir', designation: 'Kitchen Inventory Supervisor', email: 'rajkot.kitchen@swadghar.com', phone: '+91 98254 40006', experience: '7+ Years', specialty: 'Fresh Farm Vegetable Procurement', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
      { name: 'Kinjal Vora', designation: 'Cashier & Front Desk Executive', email: 'rajkot.cashier@swadghar.com', phone: '+91 98254 40007', experience: '6+ Years', specialty: 'Guest Accounts & Billing Systems', shift: 'Day Shift', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { name: 'Mansukhbhai Chavda', designation: 'Senior Service Steward', email: 'rajkot.host@swadghar.com', phone: '+91 98254 40008', experience: '8+ Years', specialty: 'Authentic Desi Thali Hospitality', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80' },
      { name: 'Suresh Dodiya', designation: 'Cold Beverages & Chhas Master', email: 'rajkot.beverages@swadghar.com', phone: '+91 98254 40009', experience: '6+ Years', specialty: 'Earthen Pot (Matka) Masala Chaas', shift: 'Day Shift', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
      { name: 'Nitin Kalsariya', designation: 'Fast Takeaway Coordinator', email: 'rajkot.dispatch@swadghar.com', phone: '+91 98254 40010', experience: '5+ Years', specialty: 'Speedy Takeaway & Online Dispatch', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
    ],
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
    managerName: 'Nitin Mehta',
    managerEmail: 'mumbai.manager@swadghar.com',
    managerPhone: '+91 98255 50001',
    timings: '11:30 AM - 12:00 AM (Daily)',
    seatingCapacity: 90,
    features: ['Express Thali Meals', 'Authentic Gujarati & Punjabi Catering', 'Corporate Delivery Fleet', 'Late Night Dining'],
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Borivali+West+Mumbai',
    staffTeam: [
      { name: 'Kishorebhai Maharaj', designation: 'Head Gujarati Chef', email: 'mumbai.chef@swadghar.com', phone: '+91 98255 50002', experience: '15+ Years', specialty: 'Express Gujarati & Kathiyawadi Meals', shift: 'Morning & Lunch', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Balwinder Singh', designation: 'Master Punjabi Chef', email: 'mumbai.punjabi@swadghar.com', phone: '+91 98255 50003', experience: '12+ Years', specialty: 'Authentic Dal Makhani, Paneer & Kulcha', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Mahesh Doshi', designation: 'Farsan & Snacks Craftsman', email: 'mumbai.farsan@swadghar.com', phone: '+91 98255 50004', experience: '10+ Years', specialty: 'Dhokla, Khandvi, Fafda & Kachori', shift: 'Morning Shift', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Sameer Kulkarni', designation: 'Dining Captain & Guest Experience', email: 'mumbai.captain@swadghar.com', phone: '+91 98255 50005', experience: '9+ Years', specialty: 'High Volume Fast Table Turnover', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Sunil Sawant', designation: 'Kitchen Store & Hygiene Supervisor', email: 'mumbai.kitchen@swadghar.com', phone: '+91 98255 50006', experience: '8+ Years', specialty: 'Central Mumbai Cold Chain & Storage', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Tanvi Shah', designation: 'POS & Accounts Desk Lead', email: 'mumbai.cashier@swadghar.com', phone: '+91 98255 50007', experience: '7+ Years', specialty: 'Digital Payments, UPI & Invoicing', shift: 'Day Shift', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { name: 'Deepak Gurav', designation: 'Senior Service Steward', email: 'mumbai.host@swadghar.com', phone: '+91 98255 50008', experience: '6+ Years', specialty: 'Courteous Dining Service', shift: 'Evening Shift', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
      { name: 'Pradeep Shinde', designation: 'Late Night Fast Service Lead', email: 'mumbai.nightservice@swadghar.com', phone: '+91 98255 50009', experience: '5+ Years', specialty: 'Midnight Thali & Fast Delivery', shift: 'Night Shift', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80' },
      { name: 'Amit Salvi', designation: 'Corporate Catering Coordinator', email: 'mumbai.dispatch@swadghar.com', phone: '+91 98255 50010', experience: '6+ Years', specialty: 'Corporate Bulk Orders & Fleet Support', shift: 'Day Shift', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
    ],
    isActive: true,
    sortOrder: 5,
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

