import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contacts.js';
import blogRoutes from './routes/blog.js';
import portfolioRoutes from './routes/portfolio.js';
import emailRoutes from './routes/email.js';
import adminRoutes from './routes/admin.js';
import adminAuthRoutes from './routes/adminAuth.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { logger } from './middleware/logger.js';

// Import database
import { initDatabase } from './database/init.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Initialize database
await initDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down requests after rate limit
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request above 50
});

app.use(limiter);
app.use(speedLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';

app.use(`${apiPrefix}/${apiVersion}/auth`, authRoutes);
app.use(`${apiPrefix}/${apiVersion}/contacts`, contactRoutes);
app.use(`${apiPrefix}/${apiVersion}/blog`, blogRoutes);
app.use(`${apiPrefix}/${apiVersion}/portfolio`, portfolioRoutes);
app.use(`${apiPrefix}/${apiVersion}/email`, emailRoutes);
app.use(`${apiPrefix}/${apiVersion}/admin`, adminRoutes);
app.use(`${apiPrefix}/${apiVersion}/admin-auth`, adminAuthRoutes);
app.use(`${apiPrefix}/${apiVersion}/settings`, settingsRoutes);
app.use(`${apiPrefix}/${apiVersion}/upload`, uploadRoutes);

// API documentation endpoint
app.get(`${apiPrefix}/docs`, (req, res) => {
  res.json({
    title: 'Jeff Honforloco Photography API',
    version: apiVersion,
    description: 'Backend API for Jeff Honforloco Photography Platform',
    endpoints: {
      auth: `${apiPrefix}/${apiVersion}/auth`,
      contacts: `${apiPrefix}/${apiVersion}/contacts`,
      blog: `${apiPrefix}/${apiVersion}/blog`,
      portfolio: `${apiPrefix}/${apiVersion}/portfolio`,
      email: `${apiPrefix}/${apiVersion}/email`,
      admin: `${apiPrefix}/${apiVersion}/admin`,
      adminAuth: `${apiPrefix}/${apiVersion}/admin-auth`
    },
    documentation: 'https://github.com/jeffhonforloco/photography-backend#api-documentation'
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📚 API Documentation: http://${HOST}:${PORT}${apiPrefix}/docs`);
  console.log(`🏥 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default app;
