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

// Use same-origin cookies for auth. Next.js API routes receive cookies automatically
// Helper: centralized request wrapper that includes credentials and unified error handling
// When NEXT_PUBLIC_DEBUG_API is set to '1' the client will send x-debug=1 to ask APIs for richer error details
const DEBUG_API = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === '1';
const apiRequest = async (input: RequestInfo, init: RequestInit = {}) => {
  const opts: RequestInit = {
    credentials: 'include', // send cookies for session authentication
    headers: {
      // Default JSON header - form-data callers will override or omit
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...(DEBUG_API ? { 'x-debug': '1' } : {}),
    },
    ...init,
  };

  const response = await fetch(input, opts);

  const contentType = response.headers.get('content-type') || '';
  let body: any = null;
  try {
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }
  } catch (e) {
    body = null;
  }

  if (!response.ok) {
    const err: any = new Error(body?.message || `HTTP error ${response.status}`);
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return body;
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

    // For form-data, omit the Content-Type so the browser sets the boundary
    const response = await apiRequest(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      body: formData,
      // don't set Content-Type here
      headers: {},
    });

    return response;
  },

  /**
   * Get current user's submissions
   */
  async getMySubmissions(): Promise<{ submissions: Submission[] }> {
    return apiRequest(`${API_BASE_URL}/submissions/my`, { method: 'GET' });
  },

  /**
   * Get all submissions (admin/editor only)
   */
  async getAllSubmissions(): Promise<{ submissions: SubmissionWithAuthor[] }> {
    return apiRequest(`${API_BASE_URL}/submissions/all`, { method: 'GET' });
  },

  /**
   * Get submission by ID
   */
  async getSubmissionById(id: string): Promise<{ submission: SubmissionWithAuthor }> {
    return apiRequest(`${API_BASE_URL}/submissions/${id}`, { method: 'GET' });
  },

  /**
   * Update submission status (admin/editor only)
   */
  async updateSubmissionStatus(
    id: string,
    statusUpdate: UpdateSubmissionStatusRequest
  ): Promise<{ message: string; submission: Submission }> {
    return apiRequest(`${API_BASE_URL}/submissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusUpdate),
    });
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

    const response = await apiRequest(`${API_BASE_URL}/submissions/${id}/manuscript`, {
      method: 'PUT',
      body: formData,
      headers: {},
    });

    return response;
  },

  /**
   * Get submission statistics (admin/editor only)
   */
  async getSubmissionStatistics(): Promise<{ statistics: SubmissionStatistics }> {
    return apiRequest(`${API_BASE_URL}/submissions/statistics`, { method: 'GET' });
  },

  /**
   * Search submissions (admin/editor only)
   */
  async searchSubmissions(query: string): Promise<{ submissions: Submission[] }> {
    return apiRequest(`${API_BASE_URL}/submissions/search?q=${encodeURIComponent(query)}`, { method: 'GET' });
  },

  /**
   * Get submissions pending review (admin/editor only)
   */
  async getSubmissionsPendingReview(): Promise<{ submissions: SubmissionWithAuthor[] }> {
    return apiRequest(`${API_BASE_URL}/submissions/pending-review`, { method: 'GET' });
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
    return apiRequest(`${API_BASE_URL}/submissions/${id}`, { method: 'DELETE' });
  },

  /**
   * Get detailed submission information
   */
  async getSubmissionDetails(id: string): Promise<{ submission: SubmissionWithAuthor }> {
    return apiRequest(`${API_BASE_URL}/submissions/${id}/details`, { method: 'GET' });
  },
};