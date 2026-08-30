import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, getDBStatus } from './config/db.js';
import productRoutes from './routes/products.js';
import saleRoutes from './routes/sales.js';
import customerRoutes from './routes/customers.js';
import analyticsRoutes from './routes/analytics.js';
import backupRoutes from './routes/backup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1. Security & CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or in development
      if (!origin || NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Cross-Origin Request Blocked by CORS Policy'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key'],
    credentials: true,
  })
);

// 2. Request Parsers & Payload Bounds
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Security Response Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 4. Connect to Database
connectDB();

// 5. Health & Diagnostic Probes
app.get('/api/health/live', (req, res) => {
  res.json({ status: 'live', timestamp: new Date().toISOString() });
});

app.get('/api/health/ready', (req, res) => {
  const isDBConnected = getDBStatus();
  if (isDBConnected) {
    res.json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: 'degraded', database: 'in-memory-fallback', timestamp: new Date().toISOString() });
  }
});

// Legacy Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: NODE_ENV,
    database: getDBStatus() ? 'connected' : 'in-memory-cache',
  });
});

// 6. Domain API Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/backup', backupRoutes);

// 7. 404 Handler for Unmatched API Routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// 8. Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.message || err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : err.message || 'Server Error',
    code: err.code || 'SERVER_ERROR',
  });
});

const server = app.listen(PORT, () => {
  console.log(`[SmartShop Enterprise Server]: Running on http://localhost:${PORT} (${NODE_ENV})`);
});

// 9. Graceful Process Shutdown Handler
const gracefulShutdown = async (signal) => {
  console.log(`[Server]: Received ${signal}, draining connections and shutting down...`);
  server.close(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('[Server]: Database connection cleanly closed.');
      }
      console.log('[Server]: Process terminated cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('[Server]: Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force close after 10s timeout
  setTimeout(() => {
    console.error('[Server]: Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
