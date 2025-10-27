// API client for publication-related operations

import { Submission } from '../types/submission';

const API_BASE_URL = '/api';

// Helper: centralized request wrapper
const apiRequest = async (input: RequestInfo, init: RequestInit = {}) => {
  const opts: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
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

export interface PublishArticleRequest {
  submission_id: string;
  volume_id: string;
  issue_id: string;
  published_at?: string;
}

export interface Volume {
  id: string;
  volume_number: number;
  year: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  issue_number: number;
  volume_id: string;
  description: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVolumeRequest {
  volume_number: number;
  year: number;
  description: string;
}

export interface CreateIssueRequest {
  issue_number: number;
  volume_id: string;
  description: string;
  published_at?: string;
}

export const publicationApi = {
  /**
   * Publish an accepted submission as an article
   */
  async publishArticle(request: PublishArticleRequest): Promise<{ message: string; article: any }> {
    return apiRequest(`${API_BASE_URL}/publications/publish`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get all volumes with their issues
   */
  async getVolumes(): Promise<{ volumes: Volume[] }> {
    return apiRequest(`${API_BASE_URL}/volumes`, { method: 'GET' });
  },

  /**
   * Create a new volume
   */
  async createVolume(request: CreateVolumeRequest): Promise<{ message: string; volume: Volume }> {
    return apiRequest(`${API_BASE_URL}/publications/volumes`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Create a new issue
   */
  async createIssue(request: CreateIssueRequest): Promise<{ message: string; issue: Issue }> {
    return apiRequest(`${API_BASE_URL}/publications/issues`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get issues for a specific volume
   */
  async getIssuesForVolume(volumeId: string): Promise<{ issues: Issue[] }> {
    return apiRequest(`${API_BASE_URL}/publications/volumes/${volumeId}/issues`, { method: 'GET' });
  },

  /**
   * Get accepted submissions ready for publication
   */
  async getAcceptedSubmissions(): Promise<{ submissions: Submission[] }> {
    return apiRequest(`${API_BASE_URL}/submissions/accepted`, { method: 'GET' });
  },

  /**
   * Get published articles
   */
  async getPublishedArticles(): Promise<{ articles: any[] }> {
    return apiRequest(`${API_BASE_URL}/articles`, { method: 'GET' });
  },
};