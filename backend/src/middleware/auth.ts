import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User, { IUser, UserRole } from '../models/User';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Authenticate user via JWT Bearer token
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or account deactivated.' });
      return;
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired. Please login again.' });
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token.' });
      return;
    }
    res.status(500).json({ error: 'Authentication failed.' });
  }
};

/**
 * Optional authentication — populates req.user if token is present, but doesn't fail
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user.id;
      }
    }
  } catch {
    // Silently ignore auth errors for optional auth
  }
  next();
};

/**
 * Require specific roles
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Access denied.',
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Require ownership of a resource or admin/editor role
 */
export const requireOwnershipOrRole = (getOwnerId: (req: Request) => string | undefined, ...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const ownerId = getOwnerId(req);
    const isOwner = ownerId && req.userId === ownerId.toString();
    const hasRole = roles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      res.status(403).json({ error: 'Access denied. You do not have permission to access this resource.' });
      return;
    }

    next();
  };
};
