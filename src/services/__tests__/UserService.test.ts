import { UserService } from '../UserService';
import { UserRepository } from '../../models/UserRepository';
import { User } from '../../models/types';
import { hashPassword } from '../../utils/password';

// Mock dependencies
jest.mock('../../models/UserRepository');
jest.mock('../../utils/password');

const mockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password_hash: 'hashedpassword',
    first_name: 'John',
    last_name: 'Doe',
    affiliation: 'Test University',
    role: 'author',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = {
      findWithPagination: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updateRole: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      findByRole: jest.fn(),
      getUserStats: jest.fn(),
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    mockUserRepository.mockImplementation(() => mockRepository);
    userService = new UserService();
  });

  describe('getUsers', () => {
    it('should return paginated users without password hashes', async () => {
      const mockResponse = {
        users: [mockUser],
        total: 1,
        totalPages: 1,
        currentPage: 1,
      };

      mockRepository.findWithPagination.mockResolvedValue(mockResponse);

      const result = await userService.getUsers(1, 10);

      expect(mockRepository.findWithPagination).toHaveBeenCalledWith(1, 10);
      expect(result.users[0]).not.toHaveProperty('password_hash');
      expect(result.users[0].email).toBe(mockUser.email);
    });
  });

  describe('getUserById', () => {
    it('should return user without password hash', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('1');

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).not.toHaveProperty('password_hash');
      expect(result?.email).toBe(mockUser.email);
    });

    it('should return null if user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await userService.getUserById('1');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = { first_name: 'Jane' };
      const updatedUser = { ...mockUser, first_name: 'Jane' };

      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updateData);

      expect(mockRepository.update).toHaveBeenCalledWith('1', {
        ...updateData,
        updated_at: expect.any(Date),
      });
      expect(result?.first_name).toBe('Jane');
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should check for email conflicts', async () => {
      const updateData = { email: 'existing@example.com' };
      const existingUser = { ...mockUser, id: '2', email: 'existing@example.com' };

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(userService.updateUser('1', updateData)).rejects.toThrow('Email already exists');
    });

    it('should allow updating to same email', async () => {
      const updateData = { email: 'test@example.com' };
      const updatedUser = { ...mockUser, email: 'test@example.com' };

      mockRepository.findByEmail.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', updateData);

      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const updatedUser = { ...mockUser, role: 'reviewer' as const };
      mockRepository.updateRole.mockResolvedValue(updatedUser);

      const result = await userService.updateUserRole('1', 'reviewer');

      expect(mockRepository.updateRole).toHaveBeenCalledWith('1', 'reviewer');
      expect(result?.role).toBe('reviewer');
      expect(result).not.toHaveProperty('password_hash');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });
  });

  describe('searchUsers', () => {
    it('should search users and return without password hashes', async () => {
      mockRepository.search.mockResolvedValue([mockUser]);

      const result = await userService.searchUsers('john');

      expect(mockRepository.search).toHaveBeenCalledWith('john');
      expect(result[0]).not.toHaveProperty('password_hash');
      expect(result[0].first_name).toBe('John');
    });
  });

  describe('getUsersByRole', () => {
    it('should get users by role without password hashes', async () => {
      mockRepository.findByRole.mockResolvedValue([mockUser]);

      const result = await userService.getUsersByRole('author');

      expect(mockRepository.findByRole).toHaveBeenCalledWith('author');
      expect(result[0]).not.toHaveProperty('password_hash');
      expect(result[0].role).toBe('author');
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockStats = { author: 5, reviewer: 3, editor: 2, admin: 1 };
      mockRepository.getUserStats.mockResolvedValue(mockStats);

      const result = await userService.getUserStats();

      expect(mockRepository.getUserStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('createUserByAdmin', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        affiliation: 'New University',
        role: 'author' as const,
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue('hashedpassword');
      mockRepository.create.mockResolvedValue(mockUser);

      const result = await userService.createUserByAdmin(userData);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockHashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: userData.email,
        password_hash: 'hashedpassword',
        first_name: userData.first_name,
        last_name: userData.last_name,
        affiliation: userData.affiliation,
        role: userData.role,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
        affiliation: 'New University',
        role: 'author' as const,
      };

      mockRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.createUserByAdmin(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });
});