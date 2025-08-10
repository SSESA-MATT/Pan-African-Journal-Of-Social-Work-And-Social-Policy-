// API client for article-related operations

import { 
  Article, 
  ArticleWithDetails, 
  Volume, 
  Issue, 
  VolumeWithIssues,
  IssueWithArticles,
  CreateVolumeRequest,
  CreateIssueRequest,
  PublishArticleRequest,
  ArticleSearchFilters,
  ArticleSearchResponse
} from '../types/article';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const articleApi = {
  /**
   * Get all published articles with pagination and filtering
   */
  async getPublishedArticles(
    page: number = 1,
    limit: number = 10,
    filters?: ArticleSearchFilters
  ): Promise<ArticleSearchResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/articles?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<{ article: ArticleWithDetails }> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Search articles
   */
  async searchArticles(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ArticleSearchResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/articles/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get all volumes with their issues
   */
  async getVolumes(): Promise<{ volumes: VolumeWithIssues[] }> {
    const response = await fetch(`${API_BASE_URL}/volumes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get volume by ID with issues and articles
   */
  async getVolumeById(id: string): Promise<{ volume: VolumeWithIssues }> {
    const response = await fetch(`${API_BASE_URL}/volumes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get issue by ID with articles
   */
  async getIssueById(id: string): Promise<{ issue: IssueWithArticles }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get articles by volume and issue
   */
  async getArticlesByVolumeAndIssue(
    volumeNumber: number,
    issueNumber: number
  ): Promise<{ articles: ArticleWithDetails[] }> {
    const response = await fetch(
      `${API_BASE_URL}/articles/volume/${volumeNumber}/issue/${issueNumber}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return handleResponse(response);
  },

  // Admin/Editor functions below require authentication

  /**
   * Create a new volume (admin/editor only)
   */
  async createVolume(volumeData: CreateVolumeRequest): Promise<{ message: string; volume: Volume }> {
    const response = await fetch(`${API_BASE_URL}/volumes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(volumeData),
    });

    return handleResponse(response);
  },

  /**
   * Create a new issue (admin/editor only)
   */
  async createIssue(issueData: CreateIssueRequest): Promise<{ message: string; issue: Issue }> {
    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(issueData),
    });

    return handleResponse(response);
  },

  /**
   * Publish an article from a submission (admin/editor only)
   */
  async publishArticle(articleData: PublishArticleRequest): Promise<{ message: string; article: Article }> {
    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(articleData),
    });

    return handleResponse(response);
  },

  /**
   * Update article metadata (admin/editor only)
   */
  async updateArticle(
    id: string,
    updateData: Partial<Pick<Article, 'title' | 'abstract' | 'authors' | 'keywords'>>
  ): Promise<{ message: string; article: Article }> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  /**
   * Delete article (admin only)
   */
  async deleteArticle(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Update volume (admin/editor only)
   */
  async updateVolume(
    id: string,
    updateData: Partial<CreateVolumeRequest>
  ): Promise<{ message: string; volume: Volume }> {
    const response = await fetch(`${API_BASE_URL}/volumes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  /**
   * Update issue (admin/editor only)
   */
  async updateIssue(
    id: string,
    updateData: Partial<CreateIssueRequest>
  ): Promise<{ message: string; issue: Issue }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    return handleResponse(response);
  },

  /**
   * Delete volume (admin only)
   */
  async deleteVolume(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/volumes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Delete issue (admin only)
   */
  async deleteIssue(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Get all submissions ready for publication (admin/editor only)
   */
  async getSubmissionsReadyForPublication(): Promise<{ submissions: any[] }> {
    const response = await fetch(`${API_BASE_URL}/submissions/ready-for-publication`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },
};