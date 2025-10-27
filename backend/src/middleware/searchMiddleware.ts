import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Rate limiting for search endpoints
 */
export const searchRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many search requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain conditions
  skip: (req: Request) => {
    // Skip rate limiting for authenticated admin users (if implemented)
    return false;
  }
});

/**
 * More restrictive rate limiting for export endpoints
 */
export const exportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 export requests per hour
  message: {
    error: 'Too many export requests',
    message: 'Export limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Validate search query parameters
 */
export const validateSearchQuery = (req: Request, res: Response, next: NextFunction) => {
  const { q, title, authors, keywords } = req.query;

  // Check if at least one search parameter is provided
  if (!q && !title && !authors && !keywords) {
    return res.status(400).json({
      error: 'Invalid search parameters',
      message: 'At least one search parameter (q, title, authors, or keywords) is required'
    });
  }

  // Validate query length
  if (q && typeof q === 'string' && q.length > 500) {
    return res.status(400).json({
      error: 'Query too long',
      message: 'Search query must be less than 500 characters'
    });
  }

  // Validate pagination parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (page < 1) {
    return res.status(400).json({
      error: 'Invalid pagination',
      message: 'Page must be greater than 0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      error: 'Invalid pagination',
      message: 'Limit must be between 1 and 100'
    });
  }

  // Validate date range if provided
  const { dateFrom, dateTo } = req.query;
  if (dateFrom && dateTo) {
    const startDate = new Date(dateFrom as string);
    const endDate = new Date(dateTo as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date format must be YYYY-MM-DD'
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        error: 'Invalid date range',
        message: 'Start date must be before end date'
      });
    }

    // Check if date range is not too wide (e.g., more than 50 years)
    const yearsDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (yearsDiff > 50) {
      return res.status(400).json({
        error: 'Date range too wide',
        message: 'Date range cannot exceed 50 years'
      });
    }
  }

  next();
};

/**
 * Validate export parameters
 */
export const validateExportParams = (req: Request, res: Response, next: NextFunction) => {
  const { format, limit } = req.query;

  // Validate format
  const allowedFormats = ['json', 'csv', 'bibtex'];
  if (format && !allowedFormats.includes(format as string)) {
    return res.status(400).json({
      error: 'Invalid export format',
      message: `Allowed formats: ${allowedFormats.join(', ')}`
    });
  }

  // Validate export limit
  const exportLimit = parseInt(limit as string) || 1000;
  if (exportLimit > 5000) {
    return res.status(400).json({
      error: 'Export limit exceeded',
      message: 'Maximum export limit is 5000 records'
    });
  }

  next();
};

/**
 * Sanitize search input to prevent injection attacks
 */
export const sanitizeSearchInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    // Remove potentially dangerous characters
    return str
      .replace(/[<>\"'%;()&+]/g, '') // Remove HTML/SQL injection chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 500); // Limit length
  };

  // Sanitize query parameters
  if (req.query.q) {
    req.query.q = sanitizeString(req.query.q as string);
  }
  
  if (req.query.title) {
    req.query.title = sanitizeString(req.query.title as string);
  }

  // Sanitize array parameters
  ['authors', 'keywords', 'types'].forEach(param => {
    if (req.query[param]) {
      const values = (req.query[param] as string).split(',');
      req.query[param] = values
        .map(v => sanitizeString(v))
        .filter(v => v.length > 0)
        .slice(0, 20) // Limit array size
        .join(',');
    }
  });

  next();
};

/**
 * Log search requests for analytics
 */
export const logSearchRequest = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Store start time for response time calculation
  req.searchStartTime = startTime;

  // Log the search request (in production, you might want to use a proper logger)
  console.log(`Search Request: ${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Log response when request completes
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    console.log(`Search Response: ${res.statusCode}`, {
      responseTime: `${responseTime}ms`,
      path: req.path
    });
    
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Cache control headers for search responses
 */
export const setCacheHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set cache headers based on the endpoint
  if (req.path.includes('/popular') || req.path.includes('/stats')) {
    // Cache popular queries and stats for 5 minutes
    res.set('Cache-Control', 'public, max-age=300');
  } else if (req.path.includes('/suggestions')) {
    // Cache suggestions for 1 minute
    res.set('Cache-Control', 'public, max-age=60');
  } else if (req.path.includes('/facets')) {
    // Cache facets for 2 minutes
    res.set('Cache-Control', 'public, max-age=120');
  } else {
    // Default cache for search results - 30 seconds
    res.set('Cache-Control', 'public, max-age=30');
  }

  next();
};

/**
 * CORS headers for search API
 */
export const setCorsHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
};

/**
 * Error handling middleware for search routes
 */
export const handleSearchErrors = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Search API Error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Determine error type and respond accordingly
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: error.message
    });
  }

  if (error.name === 'DatabaseError' || error.message.includes('database')) {
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'Please try again later'
    });
  }

  if (error.name === 'TimeoutError') {
    return res.status(504).json({
      error: 'Search timeout',
      message: 'Search took too long to complete. Please try a more specific query.'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
};

// Extend Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      searchStartTime?: number;
    }
  }
}