/**
 * Auth service — thin wrapper around apiClient.auth
 * Used by AuthProvider for login / register / logout flows.
 */

import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';
import { authApi } from './api-client';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return authApi.login(credentials);
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return authApi.register({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      affiliation: data.affiliation,
      role: data.role,
    });
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    return authApi.refreshToken(token);
  }

  async getProfile(): Promise<AuthResponse['user']> {
    const res = await authApi.getProfile();
    return res.user;
  }

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Swallow — we clear local storage regardless
    }
  }
}

export const authService = new AuthService();
