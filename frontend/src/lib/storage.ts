/**
 * Token storage utilities for client-side authentication
 */

const ACCESS_TOKEN_KEY = 'africa_journal_access_token';
const REFRESH_TOKEN_KEY = 'africa_journal_refresh_token';
const USER_KEY = 'africa_journal_user';

export const tokenStorage = {
  /**
   * Store access token
   */
  setAccessToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  /**
   * Get access token
   */
  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Store refresh token
   */
  setRefreshToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * Store user data
   */
  setUser: (user: any): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Get user data
   */
  getUser: (): any | null => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  /**
   * Clear all auth data
   */
  clearAuth: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Store complete auth response
   */
  setAuthData: (authData: { user: any; token: string; refresh_token: string }): void => {
    tokenStorage.setAccessToken(authData.token);
    tokenStorage.setRefreshToken(authData.refresh_token);
    tokenStorage.setUser(authData.user);
  },
};