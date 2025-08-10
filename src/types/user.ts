import { User } from './auth';

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  affiliation?: string;
  email?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  affiliation: string;
  role: User['role'];
}

export interface UserStats {
  [role: string]: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}