import { Request, Response } from 'express';
import { UserService, UpdateUserRequest, CreateUserByAdminRequest } from '../services/UserService';
import { AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get all users with pagination (admin only)
   */
  getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.userService.getUsers(page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update user profile
   */
  updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateUserRequest = req.body;

      // Users can only update their own profile unless they're admin
      if (req.user?.role !== 'admin' && req.user?.userId !== id) {
        res.status(403).json({
          success: false,
          message: 'You can only update your own profile',
        });
        return;
      }

      const updatedUser = await this.userService.updateUser(id, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Update user role (admin only)
   */
  updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['author', 'reviewer', 'editor', 'admin'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role specified',
        });
        return;
      }

      const updatedUser = await this.userService.updateUserRole(id, role);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: updatedUser,
        message: 'User role updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update user role',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Delete user (admin only)
   */
  deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (req.user?.userId === id) {
        res.status(400).json({
          success: false,
          message: 'You cannot delete your own account',
        });
        return;
      }

      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Search users
   */
  searchUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const users = await this.userService.searchUsers(q);

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search users',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get users by role
   */
  getUsersByRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { role } = req.params;

      if (!['author', 'reviewer', 'editor', 'admin'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role specified',
        });
        return;
      }

      const users = await this.userService.getUsersByRole(role as any);

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users by role',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get user statistics (admin only)
   */
  getUserStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.userService.getUserStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Create user by admin
   */
  createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userData: CreateUserByAdminRequest = req.body;

      const newUser = await this.userService.createUserByAdmin(userData);

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}