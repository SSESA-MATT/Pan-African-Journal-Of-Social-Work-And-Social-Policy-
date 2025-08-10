import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import xss from 'xss';

dotenv.config();

// CSRF protection middleware
export const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    httpOnly: true
  }
});

// Configure security headers using Helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline in production
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*.cloudinary.com"],
      connectSrc: ["'self'", `${process.env.FRONTEND_URL || 'http://localhost:3000'}`],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
  hsts: {
    maxAge: 15552000, // 180 days
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
});

// Setup required for CSRF
export const setupCsrf = [
  cookieParser(),
  csrfProtection,
  (req: Request, res: Response, next: NextFunction) => {
    // Add CSRF token to res.locals for use in templates
    res.locals.csrfToken = req.csrfToken();
    next();
  }
];

// Middleware to sanitize request body
export const sanitizeRequestBody = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    const sanitized = sanitizeObject(req.body);
    req.body = sanitized;
  }
  next();
};

// Middleware to sanitize request query parameters
export const sanitizeQueryParams = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query) {
    const sanitized = sanitizeObject(req.query);
    req.query = sanitized;
  }
  next();
};

// Helper function to sanitize objects recursively
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj !== 'object') {
    // If it's a string, sanitize it
    if (typeof obj === 'string') {
      return xss(obj);
    }
    // Return primitive values as is
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  // Handle objects
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip password fields (don't sanitize them)
    if (key === 'password' || key === 'passwordConfirmation') {
      sanitized[key] = value;
      continue;
    }
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
}

// Helper to escape HTML in response data
export function escapeHtml(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data !== 'object') {
    if (typeof data === 'string') {
      return xss(data);
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => escapeHtml(item));
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = escapeHtml(value);
  }
  
  return sanitized;
}

// Middleware to escape HTML in response
export const escapeHtmlResponse = (req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json;
  
  res.json = function(data: any): Response {
    return originalJson.call(this, escapeHtml(data));
  };
  
  next();
};

// Protection against reflected XSS attacks
export const noCache = (req: Request, res: Response, next: NextFunction): void => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
};
