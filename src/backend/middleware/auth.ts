import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { User } from '../models/types';

// Extend Express Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'No authorization header provided',
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'No token provided',
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication Failed',
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Authorization middleware factory - checks user roles
 */
export const authorize = (...allowedRoles: User['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const adminOnly = authorize('admin');

/**
 * Editor or Admin middleware
 */
export const editorOrAdmin = authorize('editor', 'admin');

/**
 * Reviewer, Editor, or Admin middleware
 */
export const reviewerOrAbove = authorize('reviewer', 'editor', 'admin');

/**
 * Any authenticated user middleware
 */
export const authenticatedUser = authenticate;

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (allowedRoles: User['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Resource ownership middleware - ensures user can only access their own resources
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication Required',
        message: 'User not authenticated',
      });
    }

    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
    
    // Admins and editors can access any resource
    if (req.user.role === 'admin' || req.user.role === 'editor') {
      return next();
    }

    // Users can only access their own resources
    if (req.user.userId !== resourceUserId) {
      return res.status(403).json({
        error: 'Access Forbidden',
        message: 'You can only access your own resources',
      });
    }

    next();
  };
};