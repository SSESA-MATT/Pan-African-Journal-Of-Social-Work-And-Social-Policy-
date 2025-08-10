import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import dotenv from 'dotenv';

// Simple console logger until we import the actual logger
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};

dotenv.config();

// Redis client for rate limiting (use if configured in env)
let redisClient: RedisClientType | null = null;
let redisReady = false;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: { 
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 1000) 
    }
  });
  
  // Connect to Redis and handle events
  (async () => {
    redisClient!.on('error', (err: Error) => {
      logger.error('Redis client error:', err);
      redisReady = false;
    });
    
    redisClient!.on('connect', () => {
      logger.info('Redis client connected');
      redisReady = true;
    });

    redisClient!.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });
    
    try {
      await redisClient!.connect();
    } catch (err) {
      logger.error('Redis connection failed:', err);
      // Don't throw - we'll fallback to memory store
    }
  })();
}

// Create a store for rate limiting
const limiterStore = process.env.REDIS_URL && redisClient && redisReady ? 
  new RedisStore({
    sendCommand: (...args: string[]) => redisClient!.sendCommand(args),
  }) : undefined; // Will use memory store if Redis is not available

// Create general API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: limiterStore,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests, please try again later.',
  },
  skip: (req: Request) => process.env.NODE_ENV === 'test', // Skip in test environment
});

// Login specific limiter (more restrictive)
export const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 login attempts per 30 minutes
  standardHeaders: true,
  legacyHeaders: false,
  store: limiterStore,
  message: {
    error: 'Too Many Login Attempts',
    message: 'Too many login attempts from this IP, please try again after 30 minutes.',
  },
  skip: (req: Request) => process.env.NODE_ENV === 'test', // Skip in test environment
});

// Registration specific limiter
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: limiterStore,
  message: {
    error: 'Too Many Registration Attempts',
    message: 'Too many registration attempts from this IP, please try again after an hour.',
  },
  skip: (req: Request) => process.env.NODE_ENV === 'test', // Skip in test environment
});

// Submission specific limiter
export const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: limiterStore,
  message: {
    error: 'Too Many Submissions',
    message: 'Too many submissions from this IP, please try again after an hour.',
  },
  skip: (req: Request) => process.env.NODE_ENV === 'test', // Skip in test environment
});

/**
 * Gracefully shut down Redis connections
 */
export const cleanupRedis = async (): Promise<void> => {
  if (redisClient && redisReady) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
};

// Register cleanup handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, cleaning up Redis connections');
  cleanupRedis().catch(() => process.exit(1));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, cleaning up Redis connections');
  cleanupRedis().catch(() => process.exit(1));
});

export default {
  apiLimiter,
  loginLimiter,
  registrationLimiter,
  submissionLimiter,
  cleanupRedis
};
