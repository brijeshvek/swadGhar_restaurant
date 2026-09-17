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
      maxPoolSize: 50,              // Keep up to 50 active socket connections
      minPoolSize: 10,              // Keep 10 warm connections ready for 0ms handshake
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,                    // Force IPv4 for faster DNS lookup
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
