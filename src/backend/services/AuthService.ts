import { supabase } from '../config/supabase';
import { UserRepository } from '../models/UserRepository';
import { User, CreateUserRequest, LoginRequest, AuthResponse } from '../models/types';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user using Supabase Auth
   */
  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            affiliation: userData.affiliation,
            role: userData.role || 'author'
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create user profile in our users table with the Supabase user ID
      const userProfile = await this.userRepository.createWithId({
        id: authData.user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        affiliation: userData.affiliation,
        role: userData.role || 'author',
      });

      return {
        user: userProfile,
        token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  /**
   * Login user using Supabase Auth
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        throw new Error('Invalid email or password');
      }

      if (!authData.user || !authData.session) {
        throw new Error('Authentication failed');
      }

      // Get user profile from our database
      const userProfile = await this.userRepository.findByEmail(credentials.email);
      if (!userProfile) {
        // If user doesn't exist in our database, create it from Supabase user
        const newUserProfile = await this.userRepository.createWithId({
          id: authData.user.id,
          email: authData.user.email!,
          first_name: authData.user.user_metadata?.first_name || '',
          last_name: authData.user.user_metadata?.last_name || '',
          affiliation: authData.user.user_metadata?.affiliation || '',
          role: authData.user.user_metadata?.role || 'author',
        });
        
        return {
          user: newUserProfile,
          token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        };
      }

      return {
        user: userProfile,
        token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }

  /**
   * Validate Supabase token
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return null;
      }

      // Get user profile from our database
      const userProfile = await this.userRepository.findById(user.id);
      return userProfile;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error || !data.session || !data.user) {
        throw new Error('Token refresh failed');
      }

      // Get user profile
      const userProfile = await this.userRepository.findById(data.user.id);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return {
        user: userProfile,
        token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore logout errors as token might already be invalid
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: User['role']): Promise<User | null> {
    return await this.userRepository.updateRole(userId, role);
  }

  /**
   * Get all users with pagination (admin only)
   */
  async getUsers(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    return await this.userRepository.findWithPagination(page, limit);
  }

  /**
   * Search users (admin only)
   */
  async searchUsers(searchTerm: string): Promise<User[]> {
    return await this.userRepository.search(searchTerm);
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(): Promise<Record<string, number>> {
    return await this.userRepository.getUserStats();
  }
}