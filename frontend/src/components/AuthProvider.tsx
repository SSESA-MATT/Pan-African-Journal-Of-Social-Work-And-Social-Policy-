'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, LoginRequest, RegisterRequest } from '@/types/auth';
import { authService } from '@/lib/auth';
import { tokenStorage } from '@/lib/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Decode JWT payload and check expiration
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Add 60s buffer so we don't use a token about to expire
    return payload.exp * 1000 < Date.now() + 60000;
  } catch {
    return true;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedToken = tokenStorage.getAccessToken();
    const storedUser = tokenStorage.getUser<User>();

    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      // Token missing, invalid, or expired — clear stale auth data
      tokenStorage.clearAuth();
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const authData = await authService.login(credentials);
      tokenStorage.setAuthData(authData);
      setToken(authData.token);
      setUser(authData.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const authData = await authService.register(userData);
      tokenStorage.setAuthData(authData);
      setToken(authData.token);
      setUser(authData.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      tokenStorage.clearAuth();
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const { authApi } = await import('@/lib/api-client');
      const data = await authApi.getProfile();
      setUser(data.user);
      tokenStorage.setUser(data.user);
    } catch {
      // If profile fetch fails, keep current user
    }
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};