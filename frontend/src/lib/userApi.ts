import { User } from '@/types/auth';
import { UpdateUserRequest, CreateUserRequest, UserStats, UsersResponse, ApiResponse } from '@/types/user';

// Use Next.js API routes instead of external backend
const API_BASE_URL = '/api';

class UserApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getUsers(page: number = 1, limit: number = 10): Promise<ApiResponse<UsersResponse>> {
    const response = await fetch(
      `${API_BASE_URL}/users?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse<ApiResponse<UsersResponse>>(response);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  async updateUserRole(id: string, role: User['role']): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<void>>(response);
  }

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    const response = await fetch(
      `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse<ApiResponse<User[]>>(response);
  }

  async getUsersByRole(role: User['role']): Promise<ApiResponse<User[]>> {
    // The Next.js app provides a dedicated route for reviewers at /api/users/reviewers
    // while other role endpoints may follow the /api/users/role/:role pattern.
    const endpoint = role === 'reviewer' ? `${API_BASE_URL}/users/reviewers` : `${API_BASE_URL}/users/role/${role}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<User[]>>(response);
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<UserStats>>(response);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${API_BASE_URL}/users/all`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<User[]>>(response);
  }

  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  async getCurrentUserProfile(): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  async bulkUpdateUserRoles(userIds: string[], role: User['role']): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/users/bulk/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userIds, role }),
    });
    return this.handleResponse<ApiResponse<void>>(response);
  }

  async sendBulkEmail(userIds: string[], subject: string, message: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}/users/bulk/email`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userIds, subject, message }),
    });
    return this.handleResponse<ApiResponse<void>>(response);
  }
}

export const userApi = new UserApiService();