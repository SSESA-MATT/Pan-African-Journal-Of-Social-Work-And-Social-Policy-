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
    // Try admin endpoint first, fallback to regular users endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId: id, updates: userData }),
      });
      
      if (response.ok) {
        const result = await this.handleResponse<{ user: User, message: string }>(response);
        return { data: result.user, success: true };
      }
    } catch (error) {
      console.log('Admin endpoint failed, trying regular endpoint');
    }

    // Fallback to regular users endpoint (not implemented yet, but structure for future)
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse<ApiResponse<User>>(response);
  }

  async updateUserRole(id: string, role: User['role']): Promise<ApiResponse<User>> {
    // Try admin endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId: id, updates: { role } }),
      });
      
      if (response.ok) {
        const result = await this.handleResponse<{ user: User, message: string }>(response);
        return { data: result.user, success: true };
      }
    } catch (error) {
      console.log('Admin endpoint failed for role update');
    }

    // Fallback approach
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
    // Use the admin reviewers endpoint for reviewers, and regular users endpoint for others
    const endpoint = role === 'reviewer' ? `${API_BASE_URL}/admin/reviewers` : `${API_BASE_URL}/users`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    if (role === 'reviewer') {
      // The admin/reviewers endpoint returns users directly
      return this.handleResponse<ApiResponse<User[]>>(response);
    } else {
      // The users endpoint returns users array directly, filter by role
      const users = await this.handleResponse<User[]>(response);
      const filteredUsers = users.filter(user => user.role === role);
      return { data: filteredUsers, success: true };
    }
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    // The users/stats endpoint returns { statistics: UserStats }
    const result = await this.handleResponse<{ statistics: UserStats }>(response);
    return { data: result.statistics, success: true };
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
    
    // The users/all endpoint returns users array directly
    const users = await this.handleResponse<User[]>(response);
    return { data: users, success: true };
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