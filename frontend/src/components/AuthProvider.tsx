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

        if (storedToken && storedUser) {
          // Validate token with server
          const isValid = await authService.validateToken(storedToken);
          
          if (isValid) {
            setToken(storedToken);
            setUser(storedUser);
          } else {
            // Try to refresh token
            const refreshToken = tokenStorage.getRefreshToken();
            if (refreshToken) {
              try {
                const authData = await authService.refreshToken(refreshToken);
                tokenStorage.setAuthData(authData);
                setToken(authData.token);
                setUser(authData.user);
              } catch {
                // Refresh failed, clear auth data
                tokenStorage.clearAuth();
              }
            } else {
              tokenStorage.clearAuth();
            }
          }
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

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

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