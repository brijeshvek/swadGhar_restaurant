const mongoose = require('mongoose');

const autoSeedIfEmpty = async () => {
  try {
    const User = require('../models/User');
    const Food = require('../models/Food');
    
    const userCount = await User.countDocuments();
    const foodCount = await Food.countDocuments();

    if (userCount === 0 || foodCount === 0) {
      console.log('[Database] Initializing MongoDB dataset with default users, dishes, categories, coupons, and settings...');
      const seedData = require('../seeds/seed');
      await seedData();
      console.log('[Database] Auto-seeding completed successfully.');
    } else {
      console.log(`[Database Ready] Connected with ${userCount} users and ${foodCount} menu items ready for Store/Get/Update.`);
    }
  } catch (seedErr) {
    console.warn('[Database Auto-Seed Notice]:', seedErr.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    
    // Auto-seed if collections are empty
    await autoSeedIfEmpty();
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Database Warning] Running in dual-mode (Live MongoDB with graceful memory fallback for offline development).');
    }
  }
};

module.exports = connectDB;
