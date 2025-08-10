import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { EmailService } from '../services';
import { CreateUserRequest, LoginRequest } from '../models/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response) => {
    try {
      const userData: CreateUserRequest = req.body;
      const result = await this.authService.register(userData);
      
      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail(
          userData.email,
          `${userData.first_name} ${userData.last_name}`,
          userData.role || 'author'
        );
        console.log(`Welcome email sent to ${userData.email}`);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Continue registration process even if email fails
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'User with this email already exists') {
          return res.status(409).json({
            error: 'Registration Failed',
            message: error.message,
          });
        }
      }

      res.status(500).json({
        error: 'Registration Failed',
        message: 'An error occurred during registration',
      });
    }
  };

  /**
   * Login user
   */
  login = async (req: Request, res: Response) => {
    try {
      const credentials: LoginRequest = req.body;
      const result = await this.authService.login(credentials);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Invalid email or password') {
          return res.status(401).json({
            error: 'Login Failed',
            message: error.message,
          });
        }
      }

      res.status(500).json({
        error: 'Login Failed',
        message: 'An error occurred during login',
      });
    }
  };

  /**
   * Refresh access token
   */
  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Refresh token is required',
        });
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      
      res.status(401).json({
        error: 'Token Refresh Failed',
        message: 'Invalid or expired refresh token',
      });
    }
  };

  /**
   * Get current user profile
   */
  getProfile = async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication Required',
          message: 'User not authenticated',
        });
      }

      const user = await this.authService.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          error: 'User Not Found',
          message: 'User profile not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      
      res.status(500).json({
        error: 'Profile Retrieval Failed',
        message: 'An error occurred while retrieving profile',
      });
    }
  };

  /**
   * Logout user (client-side token removal)
   */
  logout = async (req: Request, res: Response) => {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // by removing the tokens from storage
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  };

  /**
   * Validate token endpoint
   */
  validateToken = async (req: Request, res: Response) => {
    // If we reach this point, the authenticate middleware has already validated the token
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user,
      },
    });
  };
}