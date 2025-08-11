import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import fileRoutes from './routes/files';
import submissionRoutes from './routes/submissions';
import reviewRoutes from './routes/reviews';

// Import services
import { EmailService } from './services';

// Import security middleware
import { securityHeaders, sanitizeRequestBody, sanitizeQueryParams, escapeHtmlResponse, noCache } from './middleware/security';
import { apiLimiter } from './middleware/rateLimit';
import { auditLogger } from './middleware/auditLogger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core middleware
app.use(securityHeaders);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(sanitizeRequestBody);
app.use(sanitizeQueryParams);
app.use(escapeHtmlResponse);
app.use(noCache);

// Logging middleware
app.use(auditLogger);

// Apply rate limiting to all routes
app.use(apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Africa Journal API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/reviews', reviewRoutes);

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: 'The requested API endpoint does not exist',
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`🚀 Africa Journal API server running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialize email service
    try {
      const isEmailReady = await EmailService.verifyEmailConnection();
      if (isEmailReady) {
        console.log('📧 Email service initialized successfully');
      } else {
        console.warn('⚠️ Email service could not be initialized');
      }
    } catch (error) {
      console.error('❌ Error initializing email service:', error);
    }
  });
}

// Export app for Vercel
export { app };