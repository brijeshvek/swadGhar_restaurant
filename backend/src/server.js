const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  SwadGhar Backend Server running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  SwadGhar  : http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Periodically log memory usage every 60 seconds
setInterval(() => {
  const memory = process.memoryUsage();

  console.log("[Memory Usage]", {
    rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`,
  });
}, 60000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Fatal Unhandled Rejection]: ${err.message}`);
  // In production, keep server alive if recoverable or restart gracefully
});
