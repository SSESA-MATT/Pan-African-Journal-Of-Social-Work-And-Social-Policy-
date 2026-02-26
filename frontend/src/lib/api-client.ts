/**
 * Unified API client for the Pan-African Journal frontend.
 *
 * All calls go to the Express backend at NEXT_PUBLIC_API_URL.
 * Routes match the backend exactly:
 *   /api/auth/*          → authApi
 *   /api/manuscripts/*   → manuscriptsApi
 *   /api/reviews/*       → reviewsApi
 *   /api/articles/*      → articlesApi   (includes volumes, issues, publish)
 *   /api/users/*         → usersApi
 */

import { tokenStorage } from './storage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Helpers ─────────────────────────────────────────────────

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = tokenStorage.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || body.message || `HTTP ${res.status}`);
  }

  return res.json();
}

/** Convenience for public endpoints (no token attached) */
function publicRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return request<T>(endpoint, options, false);
}

// ═══════════════════════════════════════════════════════════════
//  AUTH  —  /api/auth/*
// ═══════════════════════════════════════════════════════════════
export const authApi = {
  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    affiliation?: string;
    role?: 'author' | 'reviewer';
    expertise?: string[];
  }) {
    return request('/auth/register', { method: 'POST', body: JSON.stringify(data) }, false);
  },

  login(credentials: { email: string; password: string }) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }, false);
  },

  refreshToken(refreshToken: string) {
    return request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }, false);
  },

  getProfile() {
    return request('/auth/profile');
  },

  updateProfile(data: Record<string, any>) {
    return request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
  },

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return request('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) });
  },

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return request('/auth/profile/avatar', { method: 'PUT', body: formData });
  },

  deleteAvatar() {
    return request('/auth/profile/avatar', { method: 'DELETE' });
  },

  logout() {
    return request('/auth/logout', { method: 'POST' });
  },

  validate() {
    return request('/auth/validate');
  },
};

// ═══════════════════════════════════════════════════════════════
//  MANUSCRIPTS  —  /api/manuscripts/*
// ═══════════════════════════════════════════════════════════════
export const manuscriptsApi = {
  /** Submit a new manuscript (with file upload via FormData) */
  create(data: FormData) {
    return request('/manuscripts', { method: 'POST', body: data });
  },

  /** Author's own manuscripts */
  getMy(params?: { status?: string; page?: number; limit?: number }) {
    const q = params ? `?${new URLSearchParams(params as any)}` : '';
    return request(`/manuscripts/my${q}`);
  },

  /** All manuscripts — editor / admin */
  getAll(params?: { status?: string; page?: number; limit?: number; search?: string }) {
    const q = params ? `?${new URLSearchParams(params as any)}` : '';
    return request(`/manuscripts/all${q}`);
  },

  /** Dashboard statistics — editor / admin */
  getStatistics() {
    return request('/manuscripts/statistics');
  },

  /** Single manuscript by ID */
  getById(id: string) {
    return request(`/manuscripts/${id}`);
  },

  /** Update manuscript (with optional file) */
  update(id: string, data: FormData) {
    return request(`/manuscripts/${id}`, { method: 'PUT', body: data });
  },

  /** Update manuscript without file (JSON body) */
  updateJson(id: string, data: Record<string, any>) {
    return request(`/manuscripts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  /** Editor: change manuscript status */
  updateStatus(id: string, body: { status: string; editorComments?: string; revisionDeadline?: string }) {
    return request(`/manuscripts/${id}/status`, { method: 'PUT', body: JSON.stringify(body) });
  },

  /** Admin: assign editor */
  assignEditor(id: string, editorId: string) {
    return request(`/manuscripts/${id}/assign-editor`, { method: 'PUT', body: JSON.stringify({ editorId }) });
  },

  /** Download manuscript file */
  getDownloadLink(id: string) {
    return request(`/manuscripts/${id}/download`);
  },
};

// ═══════════════════════════════════════════════════════════════
//  REVIEWS  —  /api/reviews/*
// ═══════════════════════════════════════════════════════════════
export const reviewsApi = {
  /** Assign a reviewer to a manuscript — editor / admin */
  assign(data: { manuscriptId: string; reviewerId: string; dueDate?: string; round?: number }) {
    return request('/reviews/assign', { method: 'POST', body: JSON.stringify(data) });
  },

  /** Reviewer's own assignments */
  getMy(params?: { status?: string; page?: number; limit?: number }) {
    const q = params ? `?${new URLSearchParams(params as any)}` : '';
    return request(`/reviews/my${q}`);
  },

  /** Reviewer dashboard aggregate */
  getDashboard() {
    return request('/reviews/dashboard');
  },

  /** Available reviewers for a manuscript — editor / admin */
  getAvailableReviewers(params?: { manuscriptId?: string; expertise?: string }) {
    const q = params ? `?${new URLSearchParams(params as any)}` : '';
    return request(`/reviews/available-reviewers${q}`);
  },

  /** All reviews — editor / admin */
  getAll(params?: { status?: string; manuscriptId?: string; page?: number; limit?: number }) {
    const q = params ? `?${new URLSearchParams(params as any)}` : '';
    return request(`/reviews/all${q}`);
  },

  /** Review statistics — editor / admin */
  getStatistics() {
    return request('/reviews/statistics');
  },

  /** Single review by ID */
  getById(id: string) {
    return request(`/reviews/${id}`);
  },

  /** Submit or update a review */
  update(id: string, data: {
    recommendation?: string;
    commentsToAuthor?: string;
    commentsToEditor?: string;
    ratings?: Record<string, number>;
    status?: string;
    declineReason?: string;
  }) {
    return request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
};

// ═══════════════════════════════════════════════════════════════
//  ARTICLES  —  /api/articles/*  (includes volumes / issues / publish)
// ═══════════════════════════════════════════════════════════════
export const articlesApi = {
  /** Published articles — public, paginated */
  getAll(params?: {
    page?: number;
    limit?: number;
    volume?: string;
    issue?: string;
    category?: string;
    keyword?: string;
    author?: string;
    search?: string;
    sort?: string;
  }) {
    const q = params ? `?${new URLSearchParams(params as any)}` : '';
    return publicRequest(`/articles${q}`);
  },

  /** Full-text search */
  search(query: string, page = 1, limit = 12) {
    return publicRequest(`/articles/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  },

  /** Single article by ID or slug */
  getByIdOrSlug(idOrSlug: string) {
    return publicRequest(`/articles/${idOrSlug}`);
  },

  /** All volumes (with nested issues) */
  getVolumes() {
    return publicRequest('/articles/volumes');
  },

  /** Articles in a specific issue */
  getIssueArticles(volumeId: string, issueId: string) {
    return publicRequest(`/articles/volumes/${volumeId}/issues/${issueId}`);
  },

  /** Create volume — admin / editor */
  createVolume(data: { volumeNumber: number; year: number; title?: string; description?: string }) {
    return request('/articles/volumes', { method: 'POST', body: JSON.stringify(data) });
  },

  /** Create issue — admin / editor */
  createIssue(data: { volumeId: string; issueNumber: number; title?: string; description?: string }) {
    return request('/articles/issues', { method: 'POST', body: JSON.stringify(data) });
  },

  /** Publish an accepted manuscript — admin / editor */
  publish(data: { manuscriptId: string; volumeId: string; issueId: string; doi?: string; pages?: { start: number; end: number } }) {
    return request('/articles/publish', { method: 'POST', body: JSON.stringify(data) });
  },
};

// ═══════════════════════════════════════════════════════════════
//  USERS  —  /api/users/*
// ═══════════════════════════════════════════════════════════════
export const usersApi = {
  /** List users — admin */
  getAll(params?: { role?: string; search?: string; page?: number; limit?: number }) {
    const q = params ? `?${new URLSearchParams(params as any)}` : '';
    return request(`/users${q}`);
  },

  /** User stats — admin */
  getStats() {
    return request('/users/stats');
  },

  /** Single user — admin */
  getById(id: string) {
    return request(`/users/${id}`);
  },

  /** Update role — admin */
  updateRole(id: string, role: string) {
    return request(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
  },

  /** Toggle active status — admin */
  updateStatus(id: string, isActive: boolean) {
    return request(`/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) });
  },

  /** Delete user — admin */
  remove(id: string) {
    return request(`/users/${id}`, { method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════════════════════════
//  HEALTH
// ═══════════════════════════════════════════════════════════════
export const healthApi = {
  check() {
    const base = API_BASE.replace('/api', '');
    return publicRequest(`${base === '' ? '' : ''}/health`.replace(API_BASE, ''));
  },
};

// Convenience namespace export
const apiClient = { auth: authApi, manuscripts: manuscriptsApi, reviews: reviewsApi, articles: articlesApi, users: usersApi, health: healthApi };

export { apiClient };
export default apiClient;
