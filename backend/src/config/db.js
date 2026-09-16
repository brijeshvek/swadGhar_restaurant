const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    // Fallback advice for local or wrong credentials
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Database Warning] Please check your MONGODB_URI in backend/.env if you encounter authentication or network errors.');
    }
    // We do not exit the process immediately in dev mode to allow healthchecks and offline mocking if needed
  }
};

module.exports = connectDB;
