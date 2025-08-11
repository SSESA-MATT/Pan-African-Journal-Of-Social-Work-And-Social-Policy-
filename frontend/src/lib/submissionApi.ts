// API client for submission-related operations

import { 
  Submission, 
  SubmissionWithAuthor, 
  CreateSubmissionRequest, 
  UpdateSubmissionStatusRequest,
  SubmissionStatistics 
} from '../types/submission';

// Use Next.js API routes instead of external backend
const API_BASE_URL = '/api';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
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

export const submissionApi = {
  /**
   * Create a new manuscript submission
   */
  async createSubmission(
    submissionData: CreateSubmissionRequest,
    manuscriptFile: File
  ): Promise<{ message: string; submission: Submission }> {
    const formData = new FormData();
    formData.append('title', submissionData.title);
    formData.append('abstract', submissionData.abstract);
    formData.append('keywords', JSON.stringify(submissionData.keywords));
    formData.append('co_authors', JSON.stringify(submissionData.co_authors));
    formData.append('manuscript', manuscriptFile);

    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleResponse(response);
  },

  /**
   * Get current user's submissions
   */
  async getMySubmissions(): Promise<{ submissions: Submission[] }> {
    const response = await fetch(`${API_BASE_URL}/submissions/my`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get all submissions (admin/editor only)
   */
  async getAllSubmissions(): Promise<{ submissions: SubmissionWithAuthor[] }> {
    const response = await fetch(`${API_BASE_URL}/submissions/all`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get submission by ID
   */
  async getSubmissionById(id: string): Promise<{ submission: SubmissionWithAuthor }> {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Update submission status (admin/editor only)
   */
  async updateSubmissionStatus(
    id: string,
    statusUpdate: UpdateSubmissionStatusRequest
  ): Promise<{ message: string; submission: Submission }> {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}/status`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusUpdate),
    });

    return handleResponse(response);
  },

  /**
   * Update submission manuscript (for revisions)
   */
  async updateSubmissionManuscript(
    id: string,
    manuscriptFile: File
  ): Promise<{ message: string; submission: Submission }> {
    const formData = new FormData();
    formData.append('manuscript', manuscriptFile);

    const response = await fetch(`${API_BASE_URL}/submissions/${id}/manuscript`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleResponse(response);
  },

  /**
   * Get submission statistics (admin/editor only)
   */
  async getSubmissionStatistics(): Promise<{ statistics: SubmissionStatistics }> {
    const response = await fetch(`${API_BASE_URL}/submissions/statistics`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Search submissions (admin/editor only)
   */
  async searchSubmissions(query: string): Promise<{ submissions: Submission[] }> {
    const response = await fetch(`${API_BASE_URL}/submissions/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Get submissions pending review (admin/editor only)
   */
  async getSubmissionsPendingReview(): Promise<{ submissions: SubmissionWithAuthor[] }> {
    const response = await fetch(`${API_BASE_URL}/submissions/pending-review`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },

  /**
   * Upload revision (alias for updateSubmissionManuscript)
   */
  async uploadRevision(
    id: string,
    manuscriptFile: File
  ): Promise<{ message: string; submission: Submission }> {
    return this.updateSubmissionManuscript(id, manuscriptFile);
  },

  /**
   * Delete submission (admin only)
   */
  async deleteSubmission(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    return handleResponse(response);
  },
};