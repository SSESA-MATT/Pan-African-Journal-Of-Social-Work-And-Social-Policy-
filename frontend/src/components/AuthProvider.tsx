'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthContextType, LoginRequest, RegisterRequest } from '@/types/auth';
import { authService } from '@/lib/auth';
import { tokenStorage } from '@/lib/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = tokenStorage.getAccessToken();
        const storedUser = tokenStorage.getUser();

        console.log('AuthProvider init - storedToken:', !!storedToken, 'storedUser:', storedUser);

        if (storedToken && storedUser) {
          // For Supabase, we trust the stored token if user exists
          // Supabase handles token expiry automatically
          setToken(storedToken);
          setUser(storedUser);
          console.log('Auth restored from storage - user role:', storedUser.role);
        } else {
          console.log('No stored auth found');
          tokenStorage.clearAuth();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        tokenStorage.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Starting login process...');
      const authData = await authService.login(credentials);
      console.log('Login API response:', authData);
      
      tokenStorage.setAuthData(authData);
      setToken(authData.token);
      setUser(authData.user);
      console.log('Auth state updated - user:', authData.user, 'token:', !!authData.token);
    } catch (error) {
      console.error('Login error:', error);
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
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenStorage.clearAuth();
      setToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = !!user && !!token;
  
  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated,
  };

  // Debug logging
  React.useEffect(() => {
    console.log('Auth state update:', {
      user: !!user,
      token: !!token,
      isAuthenticated,
      isLoading,
      userRole: user?.role
    });
  }, [user, token, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={value}>
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