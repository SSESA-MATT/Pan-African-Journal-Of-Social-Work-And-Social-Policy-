import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import config from './config';
import connectDB from './config/database';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import manuscriptRoutes from './routes/manuscripts';
import reviewRoutes from './routes/reviews';
import articleRoutes from './routes/articles';

const app = express();

// ─── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ─── Core Middleware ─────────────────────────────────────────
app.use(helmet());

// CORS — allow the production frontend URL plus any Vercel preview URLs
const allowedOrigins = [
  config.frontendUrl,
  ...(config.nodeEnv === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : []),
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      // Allow all Vercel preview deployments for your project
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ─── Health Check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'Pan-African Journal API',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/manuscripts', manuscriptRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/articles', articleRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested API endpoint does not exist.',
  });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong.',
  });
});

// ─── Start Server ────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   Pan-African Journal API                    ║
  ║   Running on port ${config.port}                      ║
  ║   Environment: ${config.nodeEnv.padEnd(28)}║
  ║   Frontend: ${config.frontendUrl.padEnd(31)}║
  ╚══════════════════════════════════════════════╝
  `);
});

export default app;
