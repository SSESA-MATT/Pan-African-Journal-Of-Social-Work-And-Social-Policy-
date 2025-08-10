import { UserRepository } from '../models/UserRepository';
import { User } from '../models/types';
import { hashPassword } from '../utils/password';

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  affiliation?: string;
  email?: string;
}

export interface CreateUserByAdminRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  affiliation: string;
  role: User['role'];
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get all users with pagination
   */
  async getUsers(page: number = 1, limit: number = 10): Promise<{
    users: Omit<User, 'password_hash'>[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const result = await this.userRepository.findWithPagination(page, limit);
    return {
      ...result,
      users: result.users.map(user => this.excludePassword(user)),
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }
    return this.excludePassword(user);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<Omit<User, 'password_hash'> | null> {
    // Check if email is being updated and if it already exists
    if (updateData.email) {
      const existingUser = await this.userRepository.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already exists');
      }
    }

    const updatedUser = await this.userRepository.update(userId, {
      ...updateData,
      updated_at: new Date(),
    });

    if (!updatedUser) {
      return null;
    }

    return this.excludePassword(updatedUser);
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: User['role']): Promise<Omit<User, 'password_hash'> | null> {
    const updatedUser = await this.userRepository.updateRole(userId, role);
    if (!updatedUser) {
      return null;
    }
    return this.excludePassword(updatedUser);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<boolean> {
    return await this.userRepository.delete(userId);
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm: string): Promise<Omit<User, 'password_hash'>[]> {
    const users = await this.userRepository.search(searchTerm);
    return users.map(user => this.excludePassword(user));
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: User['role']): Promise<Omit<User, 'password_hash'>[]> {
    const users = await this.userRepository.findByRole(role);
    return users.map(user => this.excludePassword(user));
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<Record<string, number>> {
    return await this.userRepository.getUserStats();
  }

  /**
   * Create user by admin
   */
  async createUserByAdmin(userData: CreateUserByAdminRequest): Promise<Omit<User, 'password_hash'>> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Create user
    const newUser = await this.userRepository.create({
      email: userData.email,
      password_hash: passwordHash,
      first_name: userData.first_name,
      last_name: userData.last_name,
      affiliation: userData.affiliation,
      role: userData.role,
    });

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return this.excludePassword(newUser);
  }

  /**
   * Helper method to exclude password from user object
   */
  private excludePassword(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}