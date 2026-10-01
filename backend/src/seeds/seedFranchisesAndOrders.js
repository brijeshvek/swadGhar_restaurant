const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Franchise = require('../models/Franchise');
const User = require('../models/User');
const Order = require('../models/Order');
const Food = require('../models/Food');

// 15 Franchise Outlets (5 Cities x 3 Outlets each)
const ALL_15_FRANCHISES = [
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
    features: ['Grand AC Banquet Hall', 'Live Kathiyawadi Chula', 'Valet Parking', 'VIP Dining Cabin', 'Sweet & Farsan Counter'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Bodakdev+Ahmedabad',
    staffTeam: [
      { name: 'Mukesh Maharaj', designation: 'Executive Head Chef', phone: '+91 98251 10002', email: 'ahmedabad.chef@swadghar.com', specialty: 'Authentic Kathiyawadi Thali' },
      { name: 'Dhaval Dave', designation: 'Floor Captain', phone: '+91 98251 10005', specialty: 'Banquet Hospitality' },
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
      { name: 'Harish Joshi', designation: 'Head Chef', phone: '+91 98251 10012', specialty: 'Gujarati Rasoi & Dal Kadhi' },
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
      { name: 'Sanjay Vaghela', designation: 'Kitchen Lead', phone: '+91 98251 10022', specialty: 'Gujarati Farsaans' },
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
      { name: 'Pravin Maharaj', designation: 'Executive Head Chef', phone: '+91 98252 20002', specialty: 'Surti Undhiyu' },
      { name: 'Bhupat Solanki', designation: 'Live Farsan Chef', phone: '+91 98252 20003', specialty: 'Surti Locho & Sev Khamani' },
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
      { name: 'Gurpreet Singh', designation: 'Punjabi Master Chef', phone: '+91 98252 20012', specialty: 'Paneer & Tandoor' },
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
      { name: 'Nilesh Desai', designation: 'Captain', phone: '+91 98252 20022', specialty: 'VIP Guest Relations' },
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
      { name: 'Shambhu Maharaj', designation: 'Royal Thali Chef', phone: '+91 98253 30002', specialty: 'Wedding Feast Thali' },
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
      { name: 'Manpreet Singh', designation: 'Tandoor Chef', phone: '+91 98253 30012', specialty: 'Biryani & Naan' },
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
      { name: 'Gopalbhai Barot', designation: 'Khichdi Chef', phone: '+91 98253 30022', specialty: 'Comfort Foods' },
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
      { name: 'Govind Maharaj', designation: 'Desi Chula Head Maharaj', phone: '+91 98254 40002', specialty: 'Desi Ringan Olo' },
      { name: 'Ramsangbhai Darbar', designation: 'Rotla Master', phone: '+91 98254 40003', specialty: 'Bajra Rotlo with White Butter' },
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
      { name: 'Divyesh Kotak', designation: 'Floor Captain', phone: '+91 98254 40012', specialty: 'Event Coordination' },
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
      { name: 'Suresh Dodiya', designation: 'Chaas & Beverages Master', phone: '+91 98254 40022', specialty: 'Masala Chaas' },
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
      { name: 'Kishorebhai Maharaj', designation: 'Head Gujarati Chef', phone: '+91 98255 50002', specialty: 'Gujarati Thali' },
      { name: 'Balwinder Singh', designation: 'Master Punjabi Chef', phone: '+91 98255 50003', specialty: 'Dal Makhani & Paneer' },
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
      { name: 'Mahesh Doshi', designation: 'Farsan Chef', phone: '+91 98255 50012', specialty: 'Khandvi & Dhokla' },
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
      { name: 'Sameer Kulkarni', designation: 'Floor Captain', phone: '+91 98255 50022', specialty: 'VIP Dining Management' },
    ],
    isActive: true,
    sortOrder: 15,
  },
];

const seedFranchisesAndOrders = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('[Seed] Connected to MongoDB');

    // 1. Clear old Franchises and Orders
    console.log('[Seed] Refreshing Franchises and Orders collections...');
    await Franchise.deleteMany({});
    await Order.deleteMany({});

    // 2. Insert all 15 Franchises (5 cities x 3 outlets each)
    console.log('[Seed] Inserting 15 Outlets across 5 Cities...');
    const createdFranchises = await Franchise.insertMany(ALL_15_FRANCHISES);
    console.log(`[Seed] Successfully inserted ${createdFranchises.length} Franchise Outlets!`);

    // Helper map to find franchise by name substring
    const getFranchise = (keyword) => {
      return createdFranchises.find((f) => f.name.toLowerCase().includes(keyword.toLowerCase())) || createdFranchises[0];
    };

    // 3. Ensure 5 distinct customer accounts exist in DB
    console.log('[Seed] Ensuring 5 Customer Accounts exist...');
    const customerDefs = [
      {
        name: 'Aarav Sharma',
        email: 'customer@gmail.com',
        password: 'Customer@123',
        phone: '+91 98220 55443',
        role: 'customer',
        city: 'Ahmedabad',
        address: {
          fullName: 'Aarav Sharma',
          phone: '+91 98220 55443',
          email: 'customer@gmail.com',
          houseNo: 'Flat 402, Shivalik Heights',
          street: 'Judges Bungalow Road',
          area: 'Bodakdev',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380054',
          landmark: 'Opp. Central Park',
        },
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@gmail.com',
        password: 'Priya@123',
        phone: '+91 98220 66554',
        role: 'customer',
        city: 'Surat',
        address: {
          fullName: 'Priya Patel',
          phone: '+91 98220 66554',
          email: 'priya.patel@gmail.com',
          houseNo: 'A-12, Rajhans Greens',
          street: 'Dumas Road',
          area: 'Athwa Lines',
          city: 'Surat',
          state: 'Gujarat',
          pincode: '395007',
          landmark: 'Near VR Mall',
        },
      },
      {
        name: 'Rohan Desai',
        email: 'rohan.desai@gmail.com',
        password: 'Rohan@123',
        phone: '+91 98220 77665',
        role: 'customer',
        city: 'Vadodara',
        address: {
          fullName: 'Rohan Desai',
          phone: '+91 98220 77665',
          email: 'rohan.desai@gmail.com',
          houseNo: '104, Surya Palace Residency',
          street: 'RC Dutt Road',
          area: 'Alkapuri',
          city: 'Vadodara',
          state: 'Gujarat',
          pincode: '390007',
          landmark: 'Near Welcome Hotel',
        },
      },
      {
        name: 'Anjali Jadeja',
        email: 'anjali.jadeja@gmail.com',
        password: 'Anjali@123',
        phone: '+91 98220 88776',
        role: 'customer',
        city: 'Rajkot',
        address: {
          fullName: 'Anjali Jadeja',
          phone: '+91 98220 88776',
          email: 'anjali.jadeja@gmail.com',
          houseNo: '301, Royal Heritage Apts',
          street: 'Kalawad Road',
          area: 'Kotecha Chowk',
          city: 'Rajkot',
          state: 'Gujarat',
          pincode: '360005',
          landmark: 'Near Saurashtra University',
        },
      },
      {
        name: 'Vikram Mehta',
        email: 'vikram.mehta@gmail.com',
        password: 'Vikram@123',
        phone: '+91 98220 99887',
        role: 'customer',
        city: 'Mumbai',
        address: {
          fullName: 'Vikram Mehta',
          phone: '+91 98220 99887',
          email: 'vikram.mehta@gmail.com',
          houseNo: 'B-502, Sea Green Towers',
          street: 'Link Road',
          area: 'Borivali West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400092',
          landmark: 'Near Don Bosco School',
        },
      },
    ];

    const customerDocs = [];
    for (const cDef of customerDefs) {
      let user = await User.findOne({ email: cDef.email });
      if (!user) {
        user = await User.create({
          name: cDef.name,
          email: cDef.email,
          password: cDef.password,
          phone: cDef.phone,
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          addresses: [{ ...cDef.address, isDefault: true }],
        });
      }
      customerDocs.push(user);
    }

    // 4. Fetch available food items for order snapshots
    const allFoods = await Food.find({}).lean();
    const fallbackFood = (name, price = 250, img = 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80') => {
      const match = allFoods.find((f) => f.name.toLowerCase().includes(name.toLowerCase()));
      if (match) {
        return {
          food: match._id,
          name: match.name,
          price: match.discountPrice || match.price,
          quantity: 1,
          image: match.image,
          foodType: 'veg',
        };
      }
      return {
        food: allFoods[0]?._id || new mongoose.Types.ObjectId(),
        name,
        price,
        quantity: 1,
        image: img,
        foodType: 'veg',
      };
    };

    // 5. Create 10 Rich Realistic Customer Orders Across All Cities & Outlets
    console.log('[Seed] Creating 10 Orders across diverse Franchise Outlets...');

    const sampleOrders = [
      // Order 1: Aarav Sharma @ Ahmedabad SG Highway Flagship
      (() => {
        const fr = getFranchise('SG Highway');
        const cust = customerDocs[0];
        return {
          orderNumber: 'SWAD-7182101',
          invoiceNumber: 'INV-AHM-2026-001',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[0].address,
          items: [
            { ...fallbackFood('Kathiyawadi Thali', 340), quantity: 2 },
            { ...fallbackFood('Ringan Olo', 220), quantity: 1 },
            { ...fallbackFood('Bajra Rotla', 40), quantity: 4 },
            { ...fallbackFood('Chaas', 35), quantity: 3 },
          ],
          pricing: {
            subtotal: 1165,
            discount: 100,
            tax: 53,
            cgst: 26.5,
            sgst: 26.5,
            deliveryFee: 40,
            total: 1158,
          },
          paymentInfo: { method: 'upi', status: 'paid', paidAt: new Date(Date.now() - 3600000 * 0.8) },
          orderStatus: 'out_for_delivery',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 1.2), note: 'Order placed via SwadGhar Web' },
            { status: 'confirmed', timestamp: new Date(Date.now() - 3600000 * 1.0), note: 'Accepted by Manager Rajesh Patel' },
            { status: 'preparing', timestamp: new Date(Date.now() - 3600000 * 0.8), note: 'Fresh Ringan Olo cooked by Chef Mukesh Maharaj' },
            { status: 'ready', timestamp: new Date(Date.now() - 3600000 * 0.4), note: 'Boxed in hot insulated container' },
            { status: 'out_for_delivery', timestamp: new Date(Date.now() - 3600000 * 0.2), note: 'Valet Ramesh Vaghela is on the way to Bodakdev' },
          ],
          estimatedDeliveryTime: new Date(Date.now() + 1200000),
          specialInstructions: 'Extra spicy Ringan Olo and fresh white butter on rotla.',
          createdAt: new Date(Date.now() - 3600000 * 1.2),
        };
      })(),

      // Order 2: Aarav Sharma @ Ahmedabad Vastrapur Lake
      (() => {
        const fr = getFranchise('Vastrapur');
        const cust = customerDocs[0];
        return {
          orderNumber: 'SWAD-7182102',
          invoiceNumber: 'INV-AHM-2026-002',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[0].address,
          items: [
            { ...fallbackFood('Gujarati Thali', 320), quantity: 2 },
            { ...fallbackFood('Handvo', 180), quantity: 1 },
            { ...fallbackFood('Shrikhand', 140), quantity: 2 },
          ],
          pricing: {
            subtotal: 1100,
            discount: 0,
            tax: 55,
            cgst: 27.5,
            sgst: 27.5,
            deliveryFee: 40,
            total: 1195,
          },
          paymentInfo: { method: 'card', status: 'paid', paidAt: new Date(Date.now() - 3600000 * 0.5) },
          orderStatus: 'preparing',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 0.7), note: 'Order placed by customer' },
            { status: 'confirmed', timestamp: new Date(Date.now() - 3600000 * 0.5), note: 'Accepted at Vastrapur Kitchen' },
            { status: 'preparing', timestamp: new Date(Date.now() - 3600000 * 0.3), note: 'Chef Harish Joshi is simmering hot Gujarati Kadhi' },
          ],
          estimatedDeliveryTime: new Date(Date.now() + 1800000),
          specialInstructions: 'Pack Shrikhand in chilled container.',
          createdAt: new Date(Date.now() - 3600000 * 0.7),
        };
      })(),

      // Order 3: Priya Patel @ Surat Ghod Dod Road
      (() => {
        const fr = getFranchise('Ghod Dod');
        const cust = customerDocs[1];
        return {
          orderNumber: 'SWAD-7182103',
          invoiceNumber: 'INV-SUR-2026-001',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[1].address,
          items: [
            { ...fallbackFood('Surti Locho', 160), quantity: 2 },
            { ...fallbackFood('Sev Khamani', 150), quantity: 1 },
            { ...fallbackFood('Paneer Butter', 280), quantity: 1 },
            { ...fallbackFood('Garlic Naan', 65), quantity: 3 },
          ],
          pricing: {
            subtotal: 945,
            discount: 50,
            tax: 45,
            cgst: 22.5,
            sgst: 22.5,
            deliveryFee: 40,
            total: 980,
          },
          paymentInfo: { method: 'upi', status: 'paid', paidAt: new Date(Date.now() - 3600000 * 5) },
          orderStatus: 'delivered',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 5), note: 'Order placed' },
            { status: 'confirmed', timestamp: new Date(Date.now() - 3600000 * 4.8), note: 'Accepted by Ketan Vaghani' },
            { status: 'preparing', timestamp: new Date(Date.now() - 3600000 * 4.5), note: 'Chef Bhupat Solanki made fresh Surti Locho' },
            { status: 'out_for_delivery', timestamp: new Date(Date.now() - 3600000 * 4.0), note: 'Dispatched to Dumas Road' },
            { status: 'delivered', timestamp: new Date(Date.now() - 3600000 * 3.5), note: 'Successfully delivered to customer' },
          ],
          specialInstructions: 'Butter Locho with extra sev and green chutney.',
          createdAt: new Date(Date.now() - 3600000 * 5),
        };
      })(),

      // Order 4: Priya Patel @ Surat Adajan Prime
      (() => {
        const fr = getFranchise('Adajan');
        const cust = customerDocs[1];
        return {
          orderNumber: 'SWAD-7182104',
          invoiceNumber: 'INV-SUR-2026-002',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[1].address,
          items: [
            { ...fallbackFood('Undhiyu', 320), quantity: 2 },
            { ...fallbackFood('Jalebi', 180), quantity: 1 },
            { ...fallbackFood('Fafda', 160), quantity: 1 },
          ],
          pricing: {
            subtotal: 980,
            discount: 80,
            tax: 45,
            cgst: 22.5,
            sgst: 22.5,
            deliveryFee: 40,
            total: 985,
          },
          paymentInfo: { method: 'cash', status: 'pending' },
          orderStatus: 'confirmed',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 0.4), note: 'Order placed by customer' },
            { status: 'confirmed', timestamp: new Date(Date.now() - 3600000 * 0.2), note: 'Confirmed by Adajan Branch Manager Amit Solanki' },
          ],
          estimatedDeliveryTime: new Date(Date.now() + 2400000),
          specialInstructions: 'Crispy Fafda with spicy papaya sambharo.',
          createdAt: new Date(Date.now() - 3600000 * 0.4),
        };
      })(),

      // Order 5: Rohan Desai @ Vadodara Alkapuri Heritage
      (() => {
        const fr = getFranchise('Alkapuri');
        const cust = customerDocs[2];
        return {
          orderNumber: 'SWAD-7182105',
          invoiceNumber: 'INV-VAD-2026-001',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[2].address,
          items: [
            { ...fallbackFood('Gujarati Thali', 350), quantity: 2 },
            { ...fallbackFood('Khichdi', 190), quantity: 1 },
            { ...fallbackFood('Kadhi', 120), quantity: 1 },
          ],
          pricing: {
            subtotal: 1010,
            discount: 50,
            tax: 48,
            cgst: 24,
            sgst: 24,
            deliveryFee: 40,
            total: 1048,
          },
          paymentInfo: { method: 'upi', status: 'paid', paidAt: new Date(Date.now() - 3600000 * 6) },
          orderStatus: 'delivered',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 6), note: 'Order created' },
            { status: 'confirmed', timestamp: new Date(Date.now() - 3600000 * 5.7), note: 'Accepted at Alkapuri' },
            { status: 'preparing', timestamp: new Date(Date.now() - 3600000 * 5.3), note: 'Simmered in pure desi ghee' },
            { status: 'out_for_delivery', timestamp: new Date(Date.now() - 3600000 * 4.8), note: 'Dispatched to RC Dutt Road' },
            { status: 'delivered', timestamp: new Date(Date.now() - 3600000 * 4.2), note: 'Delivered fresh and hot' },
          ],
          specialInstructions: 'Sweet and sour Gujarati kadhi.',
          createdAt: new Date(Date.now() - 3600000 * 6),
        };
      })(),

      // Order 6: Rohan Desai @ Vadodara Gotri Royal
      (() => {
        const fr = getFranchise('Gotri');
        const cust = customerDocs[2];
        return {
          orderNumber: 'SWAD-7182106',
          invoiceNumber: 'INV-VAD-2026-002',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[2].address,
          items: [
            { ...fallbackFood('Dal Makhani', 240), quantity: 1 },
            { ...fallbackFood('Butter Naan', 60), quantity: 4 },
            { ...fallbackFood('Biryani', 260), quantity: 1 },
          ],
          pricing: {
            subtotal: 740,
            discount: 40,
            tax: 35,
            cgst: 17.5,
            sgst: 17.5,
            deliveryFee: 40,
            total: 775,
          },
          paymentInfo: { method: 'upi', status: 'paid', paidAt: new Date(Date.now() - 3600000 * 0.6) },
          orderStatus: 'out_for_delivery',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 0.9), note: 'Order placed by customer' },
            { status: 'confirmed', timestamp: new Date(Date.now() - 3600000 * 0.7), note: 'Accepted by Mehul Pandya' },
            { status: 'preparing', timestamp: new Date(Date.now() - 3600000 * 0.5), note: 'Cooked fresh by Chef Manpreet Singh' },
            { status: 'out_for_delivery', timestamp: new Date(Date.now() - 3600000 * 0.2), note: 'Rider on the way to Gotri area' },
          ],
          estimatedDeliveryTime: new Date(Date.now() + 900000),
          specialInstructions: 'Butter garlic naan well toasted.',
          createdAt: new Date(Date.now() - 3600000 * 0.9),
        };
      })(),

      // Order 7: Anjali Jadeja @ Rajkot Kalawad Road
      (() => {
        const fr = getFranchise('Kalawad');
        const cust = customerDocs[3];
        return {
          orderNumber: 'SWAD-7182107',
          invoiceNumber: 'INV-RAJ-2026-001',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[3].address,
          items: [
            { ...fallbackFood('Ringan Olo', 220), quantity: 2 },
            { ...fallbackFood('Sev Tameta', 190), quantity: 1 },
            { ...fallbackFood('Bajra Rotla', 40), quantity: 6 },
          ],
          pricing: {
            subtotal: 870,
            discount: 50,
            tax: 41,
            cgst: 20.5,
            sgst: 20.5,
            deliveryFee: 40,
            total: 901,
          },
          paymentInfo: { method: 'upi', status: 'paid', paidAt: new Date(Date.now() - 3600000 * 8) },
          orderStatus: 'delivered',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 8), note: 'Order placed' },
            { status: 'confirmed', timestamp: new Date(Date.now() - 3600000 * 7.7), note: 'Confirmed by Bhavesh Jadeja' },
            { status: 'preparing', timestamp: new Date(Date.now() - 3600000 * 7.3), note: 'Chef Govind Maharaj crafted desi Kathiyawadi feast' },
            { status: 'out_for_delivery', timestamp: new Date(Date.now() - 3600000 * 6.8), note: 'Dispatched to University Road' },
            { status: 'delivered', timestamp: new Date(Date.now() - 3600000 * 6.2), note: 'Delivered to customer doorstep' },
          ],
          specialInstructions: 'Extra spring garlic on Sev Tameta.',
          createdAt: new Date(Date.now() - 3600000 * 8),
        };
      })(),

      // Order 8: Anjali Jadeja @ Rajkot Yagnik Road Palace
      (() => {
        const fr = getFranchise('Yagnik');
        const cust = customerDocs[3];
        return {
          orderNumber: 'SWAD-7182108',
          invoiceNumber: 'INV-RAJ-2026-002',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[3].address,
          items: [
            { ...fallbackFood('Lasaniya Bataka', 210), quantity: 1 },
            { ...fallbackFood('Rotli', 25), quantity: 6 },
            { ...fallbackFood('Lassi', 90), quantity: 2 },
          ],
          pricing: {
            subtotal: 540,
            discount: 0,
            tax: 27,
            cgst: 13.5,
            sgst: 13.5,
            deliveryFee: 40,
            total: 607,
          },
          paymentInfo: { method: 'card', status: 'paid', paidAt: new Date(Date.now() - 3600000 * 0.4) },
          orderStatus: 'preparing',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 0.6), note: 'Order placed by customer' },
            { status: 'confirmed', timestamp: new Date(Date.now() - 3600000 * 0.4), note: 'Confirmed by Yuvrajsinh Vala' },
            { status: 'preparing', timestamp: new Date(Date.now() - 3600000 * 0.2), note: 'Chef preparing fresh spicy Lasaniya Bataka' },
          ],
          estimatedDeliveryTime: new Date(Date.now() + 1500000),
          specialInstructions: 'Thick dry fruit lassi in earthen matka cup.',
          createdAt: new Date(Date.now() - 3600000 * 0.6),
        };
      })(),

      // Order 9: Vikram Mehta @ Mumbai Borivali West
      (() => {
        const fr = getFranchise('Borivali');
        const cust = customerDocs[4];
        return {
          orderNumber: 'SWAD-7182109',
          invoiceNumber: 'INV-MUM-2026-001',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[4].address,
          items: [
            { ...fallbackFood('Punjabi Thali', 360), quantity: 2 },
            { ...fallbackFood('Paneer Tikka', 290), quantity: 1 },
            { ...fallbackFood('Butter Naan', 65), quantity: 4 },
          ],
          pricing: {
            subtotal: 1270,
            discount: 100,
            tax: 58,
            cgst: 29,
            sgst: 29,
            deliveryFee: 50,
            total: 1278,
          },
          paymentInfo: { method: 'razorpay', status: 'paid', paidAt: new Date(Date.now() - 3600000 * 4) },
          orderStatus: 'delivered',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 3600000 * 4), note: 'Order placed' },
            { status: 'confirmed', timestamp: new Date(Date.now() - 3600000 * 3.8), note: 'Accepted by Nitin Mehta' },
            { status: 'preparing', timestamp: new Date(Date.now() - 3600000 * 3.5), note: 'Chef Balwinder Singh prepared Tandoori Naan & Paneer' },
            { status: 'out_for_delivery', timestamp: new Date(Date.now() - 3600000 * 2.8), note: 'Dispatched to Shimpoli Signal' },
            { status: 'delivered', timestamp: new Date(Date.now() - 3600000 * 2.2), note: 'Delivered to Borivali West customer' },
          ],
          specialInstructions: 'Extra butter on Naan.',
          createdAt: new Date(Date.now() - 3600000 * 4),
        };
      })(),

      // Order 10: Vikram Mehta @ Mumbai Andheri West
      (() => {
        const fr = getFranchise('Andheri');
        const cust = customerDocs[4];
        return {
          orderNumber: 'SWAD-7182110',
          invoiceNumber: 'INV-MUM-2026-002',
          customer: cust._id,
          orderType: 'delivery',
          franchise: fr._id,
          franchiseDetails: {
            name: fr.name,
            city: fr.city,
            address: fr.address,
            phone: fr.phone,
            branchType: fr.branchType,
          },
          deliveryAddress: customerDefs[4].address,
          items: [
            { ...fallbackFood('Dhokla', 150), quantity: 2 },
            { ...fallbackFood('Khandvi', 160), quantity: 2 },
            { ...fallbackFood('Masala Chai', 80), quantity: 1 },
          ],
          pricing: {
            subtotal: 700,
            discount: 0,
            tax: 35,
            cgst: 17.5,
            sgst: 17.5,
            deliveryFee: 50,
            total: 785,
          },
          paymentInfo: { method: 'upi', status: 'pending' },
          orderStatus: 'pending',
          statusHistory: [
            { status: 'pending', timestamp: new Date(), note: 'Order placed by customer via SwadGhar Web' },
          ],
          estimatedDeliveryTime: new Date(Date.now() + 2700000),
          specialInstructions: 'Nylon Khaman with hot green chillies and mustard tadka.',
          createdAt: new Date(),
        };
      })(),
    ];

    const createdOrders = await Order.insertMany(sampleOrders);

    console.log('======================================================================');
    console.log('  [Seed Success] 15 Outlets & 10 Diverse Customer Orders Created!      ');
    console.log(`  Total Franchises : ${createdFranchises.length} (3 each in Ahmd, Surat, Vad, Rajkot, Mum)`);
    console.log(`  Total Orders     : ${createdOrders.length} (Diverse statuses & cities)`);
    console.log('======================================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedFranchisesAndOrders();
}

module.exports = seedFranchisesAndOrders;
