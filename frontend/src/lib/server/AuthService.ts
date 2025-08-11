import { supabase } from '@/lib/supabase';
import { UserRepository } from '@/lib/server/UserRepository';
import { User, CreateUserRequest, LoginRequest, AuthResponse } from '@/types/api';

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
        is_active: true,
      });

      return {
        user: userProfile,
        session: authData.session,
        message: 'User registered successfully. Please check your email for verification.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user using Supabase Auth
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user || !authData.session) {
        throw new Error('Invalid credentials');
      }

      // Get user profile from our database
      const userProfile = await this.userRepository.findById(authData.user.id);
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return {
        user: userProfile,
        session: authData.session,
        message: 'Login successful'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Validate token and get user
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
    } catch (error: any) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findById(userId);
    } catch (error: any) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(accessToken: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Verification failed');
      }

      // Get user profile from our database
      const userProfile = await this.userRepository.findById(data.user.id);
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return {
        user: userProfile,
        session: data.session,
        message: 'Email verified successfully'
      };
    } catch (error: any) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user || !data.session) {
        throw new Error('Session refresh failed');
      }

      // Get user profile from our database
      const userProfile = await this.userRepository.findById(data.user.id);
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      return {
        user: userProfile,
        session: data.session,
        message: 'Session refreshed successfully'
      };
    } catch (error: any) {
      console.error('Session refresh error:', error);
      throw error;
    }
  }
}
