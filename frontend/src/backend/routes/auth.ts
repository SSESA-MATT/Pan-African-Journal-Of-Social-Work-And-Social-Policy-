import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest, registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation';
import { authenticate } from '../middleware/auth';
import { registrationLimiter, loginLimiter } from '../middleware/rateLimit';
import { auditAction } from '../middleware/auditLogger';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  registrationLimiter, 
  validateRequest(registerSchema), 
  auditAction('User Registration'),
  authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', 
  loginLimiter, 
  validateRequest(loginSchema), 
  auditAction('User Login'),
  authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', 
  loginLimiter,
  validateRequest(refreshTokenSchema), 
  auditAction('Token Refresh'),
  authController.refreshToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', 
  authenticate, 
  auditAction('Get User Profile'),
  authController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', 
  authenticate, 
  auditAction('User Logout'),
  authController.logout);

/**
 * @route   GET /api/auth/validate
 * @desc    Validate token
 * @access  Private
 */
router.get('/validate', authenticate, authController.validateToken);

export default router;