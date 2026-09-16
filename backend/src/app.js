const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly fallback
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request Body Parsers
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

// Root API Welcome
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SwadGhar Restaurant Management System API',
    documentation: '/api/docs',
    health: '/api/health',
  });
});

// Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
