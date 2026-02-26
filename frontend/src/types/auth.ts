export type UserRole = 'author' | 'reviewer' | 'editor' | 'admin';

/**
 * User object as returned by the backend (snake_case for response fields).
 */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  affiliation: string;
  role: UserRole;
  bio?: string;
  expertise?: string[];
  orcid?: string;
  profile_picture?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration payload — camelCase because the backend Zod schema
 * expects firstName / lastName (not first_name / last_name).
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  affiliation?: string;
  role?: 'author' | 'reviewer';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}