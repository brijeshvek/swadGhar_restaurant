const mongoose = require('mongoose');
const Franchise = require('../models/Franchise');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Default 5 Franchise Branches Data with 10 Dedicated Staff Members each (Total 50 Staff)
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
    staffTeam: [
      { name: 'Rajesh Patel', designation: 'General Branch Manager', email: 'ahmedabad.manager@swadghar.com', phone: '+91 98251 10001', experience: '15+ Years', specialty: 'Branch Operations & VIP Dining', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
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
    timings: '11:00 AM - 11:00 PM (Daily)',
    seatingCapacity: 130,
    features: ['Surti Farsan & Locho Live Counter', 'Royal Punjabi Tandoor Section', 'Family Private Lounges', 'Covered Parking'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Ghod+Dod+Road+Surat',
    managerName: 'Ketan Vaghani',
    staffTeam: [
      { name: 'Ketan Vaghani', designation: 'General Branch Manager', email: 'surat.manager@swadghar.com', phone: '+91 98252 20001', experience: '14+ Years', specialty: 'Diamond City Hospitality Leadership', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
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
    timings: '11:30 AM - 11:00 PM (Daily)',
    seatingCapacity: 110,
    features: ['Gaekwad Heritage Decor', 'Authentic Kathiyawadi Thali Bar', 'Open Courtyard Seating', 'Gourmet Dessert Corner'],
    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Alkapuri+Vadodara',
    managerName: 'Hardik Shah',
    staffTeam: [
      { name: 'Hardik Shah', designation: 'General Branch Manager', email: 'vadodara.manager@swadghar.com', phone: '+91 98253 30001', experience: '12+ Years', specialty: 'Heritage Dining & Event Planning', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
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
    timings: '11:00 AM - 11:30 PM (Daily)',
    seatingCapacity: 150,
    features: ['Traditional Rotla & Ringan Olo Station', 'Live Shehanai & Folk Music', 'Spacious Party Hall', 'Fast Takeaway Counter'],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Kalawad+Road+Rajkot',
    managerName: 'Bhavesh Jadeja',
    staffTeam: [
      { name: 'Bhavesh Jadeja', designation: 'General Branch Manager', email: 'rajkot.manager@swadghar.com', phone: '+91 98254 40001', experience: '15+ Years', specialty: 'Kathiyawad Hospitality Operations', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
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
    timings: '11:30 AM - 12:00 AM (Daily)',
    seatingCapacity: 90,
    features: ['Express Thali Meals', 'Authentic Gujarati & Punjabi Catering', 'Corporate Delivery Fleet', 'Late Night Dining'],
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Borivali+West+Mumbai',
    managerName: 'Nitin Mehta',
    staffTeam: [
      { name: 'Nitin Mehta', designation: 'General Branch Manager', email: 'mumbai.manager@swadghar.com', phone: '+91 98255 50001', experience: '13+ Years', specialty: 'Metro City Restaurant Management', shift: 'Full Day', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80' },
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
