const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const foodRoutes = require('./routes/food.routes');
const settingsRoutes = require('./routes/settings.routes');
const couponRoutes = require('./routes/coupon.routes');
const orderRoutes = require('./routes/order.routes');
const reservationRoutes = require('./routes/reservation.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');

const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SwadGhar Restaurant API is healthy and operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Root API Welcome
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SwadGhar Restaurant Management System API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      categories: '/api/categories',
      foods: '/api/foods',
      orders: '/api/orders',
      reservations: '/api/reservations',
      coupons: '/api/coupons',
      payments: '/api/payments',
      reviews: '/api/reviews',
      admin: '/api/admin',
      settings: '/api/settings',
    },
  });
});

// Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
