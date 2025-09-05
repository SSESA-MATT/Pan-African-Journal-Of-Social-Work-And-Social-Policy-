import { getToken } from './auth';

// Use Next.js API routes instead of external backend
const API_BASE_URL = '/api';

export interface Review {
  id: string;
  submission_id: string;
  reviewer_id: string;
  comments: string;
  recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
  submitted_at: string;
}

export interface CreateReviewRequest {
  submissionId: string;
  comments: string;
  recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
}

export interface ReviewerDashboardData {
  pendingReviews: any[];
  completedReviews: any[];
  reviewStats: {
    totalReviews: number;
    pendingCount: number;
  };
}

export interface AssignReviewerRequest {
  submissionId: string;
  reviewerId: string;
}

class ReviewApi {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a new review
   */
  async createReview(reviewData: CreateReviewRequest): Promise<{ message: string; review: Review }> {
    return this.makeRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  /**
   * Get reviewer's own reviews
   */
  async getMyReviews(): Promise<{ reviews: any[] }> {
    return this.makeRequest('/reviews/my-reviews');
  }

  /**
   * Get pending reviews for reviewer
   */
  async getPendingReviews(): Promise<{ pendingReviews: any[] }> {
    return this.makeRequest('/reviews/pending');
  }

  /**
   * Get reviewer dashboard data
   */
  async getReviewerDashboard(): Promise<ReviewerDashboardData> {
    return this.makeRequest('/reviews/dashboard');
  }

  /**
   * Get reviews for a specific submission (admin/editor only)
   */
  async getReviewsForSubmission(submissionId: string): Promise<{
    reviews: Review[];
    summary: {
      total_reviews: number;
      recommendations: Record<string, number>;
    };
  }> {
    return this.makeRequest(`/reviews/submission/${submissionId}`);
  }

  /**
   * Assign reviewer to submission (admin/editor only)
   */
  async assignReviewer(assignmentData: AssignReviewerRequest): Promise<{ message: string }> {
    return this.makeRequest('/reviews/assign', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  /**
   * Get available reviewers (admin/editor only)
   */
  async getAvailableReviewers(): Promise<{
    reviewers: Array<{
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      affiliation: string;
      role: string;
    }>;
  }> {
    return this.makeRequest('/reviews/available-reviewers');
  }

  /**
   * Get all reviews with details (admin/editor only)
   */
  async getAllReviews(): Promise<{ reviews: any[] }> {
    return this.makeRequest('/reviews/all');
  }

  /**
   * Get review statistics (admin/editor only)
   */
  async getReviewStatistics(): Promise<{
    stats: Record<string, number>;
    averageReviewTime: number;
  }> {
    return this.makeRequest('/reviews/statistics');
  }
}

export const reviewApi = new ReviewApi();