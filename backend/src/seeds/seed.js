const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Food = require('../models/Food');
const Coupon = require('../models/Coupon');
const RestaurantSettings = require('../models/RestaurantSettings');
const Review = require('../models/Review');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('[Seed] Connected to MongoDB');

    // 1. Clear existing data
    console.log('[Seed] Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Food.deleteMany({}),
      Coupon.deleteMany({}),
      RestaurantSettings.deleteMany({}),
      Review.deleteMany({}),
    ]);

    // 2. Create Users (Admin, Staff, Customer)
    console.log('[Seed] Creating Default Users...');
    const adminUser = await User.create({
      name: 'SwadGhar Admin',
      email: 'admin@swadghar.com',
      password: 'Admin@123', // Will be hashed by pre-save hook
      phone: '+91 98980 12345',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      addresses: [{
        street: 'Admin Quarters, Boulevard Plaza',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
        isDefault: true,
      }],
    });

    const staffUser = await User.create({
      name: 'Ramesh Patel (Staff)',
      email: 'staff@swadghar.com',
      password: 'Staff@123',
      phone: '+91 98765 11223',
      role: 'staff',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    });

    const customerUser = await User.create({
      name: 'Aarav Sharma',
      email: 'customer@gmail.com',
      password: 'Customer@123',
      phone: '+91 98220 55443',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      addresses: [{
        street: '402, Shivalik High Street, Near Judges Bungalow',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380054',
        landmark: 'Opposite Central Park',
        isDefault: true,
      }],
    });

    // 3. Create Categories
    console.log('[Seed] Creating Food Categories...');
    const categoriesData = [
      {
        name: 'Starters & Crisps',
        description: 'Crispy, flavorful appetizers to ignite your palate.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        sortOrder: 1,
      },
      {
        name: 'Gujarati Delights',
        description: 'Authentic Kathiyawadi and traditional Gujarati heritage recipes.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        sortOrder: 2,
      },
      {
        name: 'Punjabi & North Indian',
        description: 'Rich creamy gravies infused with slow-simmered spices and desi ghee.',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
        sortOrder: 3,
      },
      {
        name: 'Royal Dum Biryani',
        description: 'Long-grain basmati infused with saffron, caramelized onions and herbs.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        sortOrder: 4,
      },
      {
        name: 'Tandoor & Breads',
        description: 'Clay-oven fired naans, rotis, and succulent tikkas.',
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
        sortOrder: 5,
      },
      {
        name: 'Indo-Chinese',
        description: 'Wok-tossed noodles, manchurians, and fiery schezwan delicacies.',
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
        sortOrder: 6,
      },
      {
        name: 'Artisanal Desserts',
        description: 'Sweet sinful pleasures crafted from condensed milk, saffron and pistachios.',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        sortOrder: 7,
      },
      {
        name: 'Beverages & Coolers',
        description: 'Thirst-quenching lassis, mocktails and traditional cooling drinks.',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
        sortOrder: 8,
      },
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    // 4. Create Food Items
    console.log('[Seed] Creating Food Items...');
    const foodsData = [
      // Starters
      {
        name: 'Paneer Tikka Angara',
        category: catMap['Starters & Crisps'],
        description: 'Cottage cheese cubes marinated in Kashmiri red chili, yogurt and roasted gram flour, char-grilled to perfection in clay tandoor.',
        price: 320,
        discountPrice: 280,
        image: 'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'spicy',
        ingredients: ['Fresh Paneer', 'Hung Curd', 'Kashmiri Chili', 'Garam Masala', 'Mustard Oil'],
        nutrition: { calories: 380, protein: 18, carbs: 12, fats: 26 },
        preparationTime: 20,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        rating: 4.9,
        numReviews: 42,
        tags: ['Tandoori', 'Paneer', 'Chef Special', 'Spicy'],
      },
      {
        name: 'Hara Bhara Kebab',
        category: catMap['Starters & Crisps'],
        description: 'Nutritious patties made from fresh spinach, green peas, potatoes and aromatic spices with a cashew center.',
        price: 260,
        discountPrice: 0,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'medium',
        ingredients: ['Spinach', 'Green Peas', 'Potatoes', 'Cashews', 'Mint'],
        nutrition: { calories: 240, protein: 8, carbs: 28, fats: 10 },
        preparationTime: 15,
        isAvailable: true,
        isPopular: false,
        isFeatured: false,
        rating: 4.6,
        numReviews: 18,
        tags: ['Healthy', 'Crispy', 'Vegetarian'],
      },
      {
        name: 'Crispy Corn Salt & Pepper',
        category: catMap['Starters & Crisps'],
        description: 'Golden sweet corn kernels tossed with crunchy bell peppers, spring onions, and freshly cracked black pepper.',
        price: 240,
        discountPrice: 210,
        image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80',
        foodType: 'vegan',
        spiceLevel: 'medium',
        ingredients: ['Sweet Corn', 'Spring Onions', 'Capsicum', 'Black Pepper', 'Garlic'],
        nutrition: { calories: 290, protein: 6, carbs: 42, fats: 11 },
        preparationTime: 15,
        isAvailable: true,
        isPopular: true,
        isFeatured: false,
        rating: 4.7,
        numReviews: 29,
        tags: ['Crunchy', 'Snack', 'Vegan'],
      },

      // Gujarati Delights
      {
        name: 'Royal Gujarati Thali Special',
        category: catMap['Gujarati Delights'],
        description: 'Grand festive thali featuring Ringna No Olo, Gujarati Sweet Kadi, Ringna Bateta Shaak, Dal Fry, Jeera Rice, 4 Phulka Rotis, Farsan, Papad, Pickle and Gulab Jamun.',
        price: 450,
        discountPrice: 399,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Pure Desi Ghee', 'Besan', 'Wheat Flour', 'Eggplant', 'Jaggery', 'Spices'],
        nutrition: { calories: 850, protein: 22, carbs: 120, fats: 32 },
        preparationTime: 25,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        rating: 5.0,
        numReviews: 86,
        tags: ['Grand Thali', 'Kathiyawadi', 'Traditional', 'Best Seller'],
      },
      {
        name: 'Sev Tameta Nu Shaak with Bajra No Rotlo',
        category: catMap['Gujarati Delights'],
        description: 'Tangy and sweet tomato curry topped with crisp ratlami sev, served with hand-patted hot Pearl Millet (Bajra) flatbread and white butter.',
        price: 290,
        discountPrice: 0,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'medium',
        ingredients: ['Ripe Tomatoes', 'Ratlami Sev', 'Bajra Flour', 'Safed Makhan', 'Jaggery'],
        nutrition: { calories: 480, protein: 12, carbs: 64, fats: 19 },
        preparationTime: 20,
        isAvailable: true,
        isPopular: true,
        isFeatured: false,
        rating: 4.8,
        numReviews: 34,
        tags: ['Kathiyawadi', 'Desi Ghee', 'Rotlo'],
      },

      // Punjabi & North Indian
      {
        name: 'Paneer Butter Masala',
        category: catMap['Punjabi & North Indian'],
        description: 'Velvety rich tomato and cashew gravy delicately flavored with crushed kasuri methi and finished with generous churns of fresh butter.',
        price: 360,
        discountPrice: 320,
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'medium',
        ingredients: ['Fresh Paneer', 'Cashew Paste', 'Fresh Cream', 'Kasuri Methi', 'Tomatoes'],
        nutrition: { calories: 510, protein: 16, carbs: 22, fats: 38 },
        preparationTime: 20,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        rating: 4.9,
        numReviews: 110,
        tags: ['Creamy', 'North Indian', 'Most Loved'],
      },
      {
        name: 'Dal Makhani Shahi',
        category: catMap['Punjabi & North Indian'],
        description: 'Black lentils slow-cooked overnight over slow charcoal embers with tomatoes, garlic and finished with churned butter and dairy cream.',
        price: 310,
        discountPrice: 0,
        image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Urad Dal', 'Rajma', 'Butter', 'Fresh Cream', 'Tomato Puree'],
        nutrition: { calories: 420, protein: 18, carbs: 45, fats: 20 },
        preparationTime: 15,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        rating: 4.8,
        numReviews: 76,
        tags: ['Overnight Cooked', 'Rich', 'Classic'],
      },
      {
        name: 'Kadhai Paneer Lazeez',
        category: catMap['Punjabi & North Indian'],
        description: 'Tender paneer cubes cooked with crunchy diced capsicum and onions in freshly ground whole coriander and red chili masala.',
        price: 350,
        discountPrice: 310,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'spicy',
        ingredients: ['Paneer', 'Bell Peppers', 'Onions', 'Kadhai Spices', 'Tomatoes'],
        nutrition: { calories: 440, protein: 17, carbs: 19, fats: 32 },
        preparationTime: 20,
        isAvailable: true,
        isPopular: false,
        isFeatured: false,
        rating: 4.7,
        numReviews: 45,
        tags: ['Spicy', 'Tawa Cooked', 'Punjabi'],
      },

      // Royal Dum Biryani
      {
        name: 'SwadGhar Shahi Veg Dum Biryani',
        category: catMap['Royal Dum Biryani'],
        description: 'Aged Daawat basmati rice layered with garden fresh vegetables, paneer cubes, saffron milk and sealed with dough in a heavy-bottom handi.',
        price: 380,
        discountPrice: 340,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'medium',
        ingredients: ['Basmati Rice', 'Saffron', 'Mint', 'Fried Onions', 'Paneer', 'Veggies'],
        nutrition: { calories: 590, protein: 15, carbs: 85, fats: 22 },
        preparationTime: 25,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        rating: 4.9,
        numReviews: 95,
        tags: ['Dum Biryani', 'Hyderabadi Style', 'Aromatic'],
      },
      {
        name: 'Paneer Tikka Biryani',
        category: catMap['Royal Dum Biryani'],
        description: 'Smoky tandoori paneer tikka pieces infused with layered saffron rice and served with refreshing boondi raita and salan.',
        price: 395,
        discountPrice: 0,
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'spicy',
        ingredients: ['Tandoori Paneer', 'Basmati Rice', 'Biryani Spices', 'Raita'],
        nutrition: { calories: 620, protein: 19, carbs: 82, fats: 25 },
        preparationTime: 25,
        isAvailable: true,
        isPopular: false,
        isFeatured: false,
        rating: 4.7,
        numReviews: 38,
        tags: ['Smoky', 'Biryani', 'Raita Included'],
      },

      // Tandoor & Breads
      {
        name: 'Butter Garlic Naan',
        category: catMap['Tandoor & Breads'],
        description: 'Leavened soft flatbread topped with minced roasted garlic and fresh coriander, brushed with clarified melted butter.',
        price: 85,
        discountPrice: 0,
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Refined Flour', 'Garlic', 'Butter', 'Coriander'],
        nutrition: { calories: 190, protein: 5, carbs: 32, fats: 6 },
        preparationTime: 10,
        isAvailable: true,
        isPopular: true,
        isFeatured: false,
        rating: 4.8,
        numReviews: 60,
        tags: ['Clay Tandoor', 'Crispy Soft', 'Garlic'],
      },
      {
        name: 'Amritsari Stuffed Kulcha',
        category: catMap['Tandoor & Breads'],
        description: 'Crispy flaky tandoori kulcha stuffed with spicy potato and paneer mash, served with spicy chole and pickled onions.',
        price: 160,
        discountPrice: 140,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'medium',
        ingredients: ['Flour', 'Potato Mash', 'Paneer', 'Anardana', 'Green Chilies'],
        nutrition: { calories: 340, protein: 9, carbs: 52, fats: 12 },
        preparationTime: 15,
        isAvailable: true,
        isPopular: true,
        isFeatured: false,
        rating: 4.9,
        numReviews: 44,
        tags: ['Amritsari', 'Stuffed', 'Punjabi'],
      },

      // Indo-Chinese
      {
        name: 'Veg Hakka Noodles',
        category: catMap['Indo-Chinese'],
        description: 'Wok-tossed long noodles with shredded cabbage, carrots, bell peppers, garlic and light soy sauce.',
        price: 240,
        discountPrice: 210,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
        foodType: 'vegan',
        spiceLevel: 'mild',
        ingredients: ['Noodles', 'Bell Peppers', 'Cabbage', 'Soy Sauce', 'Spring Onion'],
        nutrition: { calories: 380, protein: 8, carbs: 62, fats: 11 },
        preparationTime: 15,
        isAvailable: true,
        isPopular: true,
        isFeatured: false,
        rating: 4.6,
        numReviews: 32,
        tags: ['Wok Tossed', 'Indo Chinese', 'Vegan'],
      },
      {
        name: 'Chilli Paneer Dry',
        category: catMap['Indo-Chinese'],
        description: 'Crispy battered paneer cubes tossed in spicy chilli garlic sauce with capsicum and spring onions.',
        price: 290,
        discountPrice: 0,
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'spicy',
        ingredients: ['Paneer', 'Capsicum', 'Soy Sauce', 'Chilli Paste', 'Garlic'],
        nutrition: { calories: 410, protein: 16, carbs: 24, fats: 28 },
        preparationTime: 15,
        isAvailable: true,
        isPopular: true,
        isFeatured: false,
        rating: 4.8,
        numReviews: 50,
        tags: ['Spicy', 'Appetizer', 'Chilli Garlic'],
      },

      // Desserts
      {
        name: 'Gulab Jamun with Rabdi',
        category: catMap['Artisanal Desserts'],
        description: 'Warm, melt-in-mouth khoya gulab jamuns served atop thick saffron-cardamom rabdi garnished with sliced pistachios and silver vark.',
        price: 180,
        discountPrice: 150,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Khoya', 'Milk Rabdi', 'Saffron', 'Pistachios', 'Cardamom'],
        nutrition: { calories: 410, protein: 7, carbs: 65, fats: 14 },
        preparationTime: 10,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        rating: 5.0,
        numReviews: 120,
        tags: ['Royal Dessert', 'Rabdi', 'Sweet'],
      },
      {
        name: 'Matka Kulfi Falooda',
        category: catMap['Artisanal Desserts'],
        description: 'Traditional slow-churned malai kulfi served with rose syrup, sweet basil seeds (sabja) and delicate vermicelli noodles.',
        price: 195,
        discountPrice: 0,
        image: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Full Cream Milk', 'Rose Syrup', 'Falooda Sev', 'Sabja Seeds', 'Almonds'],
        nutrition: { calories: 360, protein: 6, carbs: 54, fats: 12 },
        preparationTime: 10,
        isAvailable: true,
        isPopular: true,
        isFeatured: false,
        rating: 4.9,
        numReviews: 68,
        tags: ['Kulfi', 'Falooda', 'Cooling'],
      },

      // Beverages
      {
        name: 'Royal Kesariya Mango Lassi',
        category: catMap['Beverages & Coolers'],
        description: 'Thick, creamy yogurt churned with Alphonso mango pulp and infused with Kashmiri saffron strands and crushed almonds.',
        price: 140,
        discountPrice: 120,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Thick Curd', 'Alphonso Mango', 'Kashmiri Kesar', 'Sugar', 'Almonds'],
        nutrition: { calories: 280, protein: 7, carbs: 48, fats: 6 },
        preparationTime: 8,
        isAvailable: true,
        isPopular: true,
        isFeatured: true,
        rating: 4.9,
        numReviews: 88,
        tags: ['Mango Lassi', 'Refreshing', 'Kesar'],
      },
      {
        name: 'Masala Chaas (Spiced Buttermilk)',
        category: catMap['Beverages & Coolers'],
        description: 'Traditional refreshing churned buttermilk tempered with roasted cumin, fresh mint, coriander, ginger and black salt.',
        price: 60,
        discountPrice: 0,
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Buttermilk', 'Roasted Jeera', 'Kala Namak', 'Mint Leaves', 'Ginger'],
        nutrition: { calories: 55, protein: 3, carbs: 6, fats: 2 },
        preparationTime: 5,
        isAvailable: true,
        isPopular: false,
        isFeatured: false,
        rating: 4.8,
        numReviews: 40,
        tags: ['Digestive', 'Kathiyawadi', 'Chilled'],
      },
    ];

    const createdFoods = await Food.insertMany(foodsData);

    // 5. Create Sample Coupons
    console.log('[Seed] Creating Promotional Coupons...');
    const couponsData = [
      {
        code: 'WELCOME50',
        discountType: 'percentage',
        discountValue: 50,
        minOrderAmount: 200,
        maxDiscount: 100,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        usageLimit: 500,
        description: '50% off up to ₹100 for your first order at SwadGhar',
        isActive: true,
      },
      {
        code: 'SWAD100',
        discountType: 'fixed',
        discountValue: 100,
        minOrderAmount: 499,
        maxDiscount: 100,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        usageLimit: 1000,
        description: 'Flat ₹100 OFF on orders above ₹499',
        isActive: true,
      },
      {
        code: 'FESTIVE20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 350,
        maxDiscount: 200,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 300,
        description: 'Festive dining treat: 20% discount up to ₹200',
        isActive: true,
      },
    ];
    await Coupon.insertMany(couponsData);

    // 6. Create Restaurant Settings
    console.log('[Seed] Creating Restaurant Settings...');
    const defaultSettings = {
      restaurantName: 'SwadGhar Fine Dining & Delicacies',
      tagline: 'A Tradition of Authentic Royal Flavors & Warm Hospitality',
      description: 'Experience the finest Indian, Gujarati, Punjabi, Tandoori & Chinese cuisines crafted with hand-ground spices and time-honored recipes.',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      email: 'contact@swadghar.com',
      phone: '+91 98765 43210',
      address: {
        street: '104 Heritage Boulevard, Ring Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
        country: 'India',
        googleMapUrl: 'https://maps.google.com/?q=Ahmedabad+Gujarat',
      },
      openingHours: [
        { day: 'Monday', openTime: '11:00 AM', closeTime: '11:00 PM', isOpen: true },
        { day: 'Tuesday', openTime: '11:00 AM', closeTime: '11:00 PM', isOpen: true },
        { day: 'Wednesday', openTime: '11:00 AM', closeTime: '11:00 PM', isOpen: true },
        { day: 'Thursday', openTime: '11:00 AM', closeTime: '11:00 PM', isOpen: true },
        { day: 'Friday', openTime: '11:00 AM', closeTime: '11:30 PM', isOpen: true },
        { day: 'Saturday', openTime: '10:30 AM', closeTime: '11:30 PM', isOpen: true },
        { day: 'Sunday', openTime: '10:30 AM', closeTime: '11:30 PM', isOpen: true },
      ],
      financial: {
        taxRatePercentage: 5,
        deliveryFee: 40,
        freeDeliveryThreshold: 499,
        minOrderAmount: 150,
      },
      tableCapacity: {
        totalTables: 24,
        maxGuestsPerTable: 10,
        maxReservationAdvanceDays: 30,
      },
      socialLinks: {
        instagram: 'https://instagram.com/swadghar',
        facebook: 'https://facebook.com/swadghar',
        twitter: 'https://twitter.com/swadghar',
      },
      isOnlineOrderingOpen: true,
      isTableBookingOpen: true,
    };
    await RestaurantSettings.create(defaultSettings);

    // 7. Create Sample Reviews
    console.log('[Seed] Creating Sample Reviews...');
    const thaliFood = createdFoods.find(f => f.name.includes('Thali'));
    const paneerFood = createdFoods.find(f => f.name.includes('Paneer Butter'));

    if (thaliFood) {
      await Review.create({
        food: thaliFood._id,
        customer: customerUser._id,
        customerName: customerUser.name,
        customerAvatar: customerUser.avatar,
        rating: 5,
        comment: 'Outstanding authentic taste! The Gujarati Kadhi and Bajra Rotlo were hot, fresh, and full of authentic ghee aroma. Highly recommended for family dining.',
        isApproved: true,
      });
    }

    if (paneerFood) {
      await Review.create({
        food: paneerFood._id,
        customer: customerUser._id,
        customerName: customerUser.name,
        customerAvatar: customerUser.avatar,
        rating: 5,
        comment: 'Super soft paneer and silky smooth gravy. Paired perfectly with Butter Garlic Naan.',
        isApproved: true,
      });
    }

    console.log('===========================================================');
    console.log('  [Seed Success] SwadGhar Database Populated Successfully! ');
    console.log('  Admin User    : admin@swadghar.com    / Password: Admin@123');
    console.log('  Staff User    : staff@swadghar.com    / Password: Staff@123');
    console.log('  Customer User : customer@gmail.com    / Password: Customer@123');
    console.log(`  Categories    : ${createdCategories.length}`);
    console.log(`  Food Items    : ${createdFoods.length}`);
    console.log(`  Coupons       : ${couponsData.length}`);
    console.log('===========================================================');

    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('[Seed Error] Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
