import { UserRepository } from '@/lib/server/UserRepository';
import { User } from '@/types/api';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  /**
   * Get users with pagination and filtering
   */
  async getUsers(
    page: number = 1,
    limit: number = 10,
    filters?: {
      role?: User['role'];
      search?: string;
      is_active?: boolean;
    }
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    return await this.userRepository.findWithPagination(page, limit, filters);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(id: string, updates: Partial<User>): Promise<User | null> {
    return await this.userRepository.updateProfile(id, updates);
  }

  /**
   * Update user role
   */
  async updateUserRole(id: string, role: User['role']): Promise<User | null> {
    return await this.userRepository.updateRole(id, role);
  }

  /**
   * Update user status
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<User | null> {
    return await this.userRepository.updateStatus(id, isActive);
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<User[]> {
    return await this.userRepository.search(query);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: User['role']): Promise<User[]> {
    return await this.userRepository.findByRole(role);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<User['role'], number>;
  }> {
    return await this.userRepository.getStats();
  }
}
