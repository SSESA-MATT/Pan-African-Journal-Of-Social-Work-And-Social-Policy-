import { Request, Response } from 'express';
import { UserController } from '../UserController';
import { UserService } from '../../services/UserService';
import { AuthenticatedRequest } from '../../middleware/auth';

// Mock UserService
jest.mock('../../services/UserService');

const mockUserService = UserService as jest.MockedClass<typeof UserService>;

describe('UserController', () => {
  let userController: UserController;
  let mockService: jest.Mocked<UserService>;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockService = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      updateUserRole: jest.fn(),
      deleteUser: jest.fn(),
      searchUsers: jest.fn(),
      getUsersByRole: jest.fn(),
      getUserStats: jest.fn(),
      createUserByAdmin: jest.fn(),
    } as any;

    mockUserService.mockImplementation(() => mockService);
    userController = new UserController();

    mockRequest = {
      user: { userId: '1', email: 'admin@example.com', role: 'admin' },
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getUsers', () => {
    it('should return paginated users successfully', async () => {
      const mockUsersResponse = {
        users: [{
          id: '1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          affiliation: 'Test University',
          role: 'author' as const,
          created_at: new Date(),
          updated_at: new Date(),
        }],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      };

      mockService.getUsers.mockResolvedValue(mockUsersResponse);
      mockRequest.query = { page: '1', limit: '10' };

      await userController.getUsers(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockService.getUsers).toHaveBeenCalledWith(1, 10);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsersResponse,
      });
    });

    it('should handle service errors', async () => {
      mockService.getUsers.mockRejectedValue(new Error('Service error'));

      await userController.getUsers(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch users',
        error: 'Service error',
      });
    });
  });

  describe('getUserById', () => {
    it('should return user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        affiliation: 'Test University',
        role: 'author' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockService.getUserById.mockResolvedValue(mockUser);
      mockRequest.params = { id: '1' };

      await userController.getUserById(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockService.getUserById).toHaveBeenCalledWith('1');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should return 404 if user not found', async () => {
      mockService.getUserById.mockResolvedValue(null);
      mockRequest.params = { id: '1' };

      await userController.getUserById(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });
  });

  describe('updateUser', () => {
    it('should allow admin to update any user', async () => {
      const mockUser = {
        id: '2',
        email: 'updated@example.com',
        first_name: 'Updated',
        last_name: 'User',
        affiliation: 'Updated University',
        role: 'author' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updateData = { email: 'updated@example.com' };

      mockService.updateUser.mockResolvedValue(mockUser);
      mockRequest.params = { id: '2' };
      mockRequest.body = updateData;
      mockRequest.user = { userId: '1', email: 'admin@example.com', role: 'admin' };

      await userController.updateUser(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockService.updateUser).toHaveBeenCalledWith('2', updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User updated successfully',
      });
    });

    it('should allow user to update own profile', async () => {
      const mockUser = {
        id: '1',
        email: 'updated@example.com',
        first_name: 'Updated',
        last_name: 'User',
        affiliation: 'Updated University',
        role: 'author' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updateData = { email: 'updated@example.com' };

      mockService.updateUser.mockResolvedValue(mockUser);
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockRequest.user = { userId: '1', email: 'user@example.com', role: 'author' };

      await userController.updateUser(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockService.updateUser).toHaveBeenCalledWith('1', updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User updated successfully',
      });
    });

    it('should deny non-admin from updating other users', async () => {
      mockRequest.params = { id: '2' };
      mockRequest.user = { userId: '1', email: 'user@example.com', role: 'author' };

      await userController.updateUser(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'You can only update your own profile',
      });
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        affiliation: 'Test University',
        role: 'reviewer' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockService.updateUserRole.mockResolvedValue(mockUser);
      mockRequest.params = { id: '1' };
      mockRequest.body = { role: 'reviewer' };

      await userController.updateUserRole(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockService.updateUserRole).toHaveBeenCalledWith('1', 'reviewer');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User role updated successfully',
      });
    });

    it('should reject invalid roles', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { role: 'invalid' };

      await userController.updateUserRole(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid role specified',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockService.deleteUser.mockResolvedValue(true);
      mockRequest.params = { id: '2' };
      mockRequest.user = { userId: '1', email: 'admin@example.com', role: 'admin' };

      await userController.deleteUser(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockService.deleteUser).toHaveBeenCalledWith('2');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully',
      });
    });

    it('should prevent admin from deleting themselves', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.user = { userId: '1', email: 'admin@example.com', role: 'admin' };

      await userController.deleteUser(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'You cannot delete your own account',
      });
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const mockUsers = [{
        id: '1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        affiliation: 'Test University',
        role: 'author' as const,
        created_at: new Date(),
        updated_at: new Date(),
      }];
      mockService.searchUsers.mockResolvedValue(mockUsers);
      mockRequest.query = { q: 'test' };

      await userController.searchUsers(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockService.searchUsers).toHaveBeenCalledWith('test');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
      });
    });

    it('should require search query', async () => {
      mockRequest.query = {};

      await userController.searchUsers(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Search query is required',
      });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        affiliation: 'University',
        role: 'author' as const,
      };
      const mockUser = {
        id: '1',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
        affiliation: 'University',
        role: 'author' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.createUserByAdmin.mockResolvedValue(mockUser);
      mockRequest.body = userData;

      await userController.createUser(mockRequest as AuthenticatedRequest, mockResponse as Response);

      expect(mockService.createUserByAdmin).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User created successfully',
      });
    });
  });
});