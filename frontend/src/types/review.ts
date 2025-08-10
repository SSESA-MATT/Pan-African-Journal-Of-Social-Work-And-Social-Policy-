export interface Review {
  id: string;
  submission_id: string;
  reviewer_id: string;
  comments: string;
  recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
  submitted_at: string;
}

export interface ReviewWithDetails extends Review {
  submission_title: string;
  submission_status: string;
  reviewer_first_name: string;
  reviewer_last_name: string;
  reviewer_email: string;
}

export interface PendingReview {
  id: string;
  title: string;
  abstract: string;
  status: string;
  submitted_at: string;
  author_first_name: string;
  author_last_name: string;
}

export interface CompletedReview extends Review {
  title: string;
  abstract: string;
  status: string;
  submission_date: string;
  author_first_name: string;
  author_last_name: string;
}

export interface ReviewerDashboardData {
  pendingReviews: PendingReview[];
  completedReviews: CompletedReview[];
  reviewStats: {
    totalReviews: number;
    pendingCount: number;
  };
}

export interface ReviewSummary {
  total_reviews: number;
  recommendations: Record<string, number>;
}

export interface Reviewer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  affiliation: string;
  role: string;
}

export interface ReviewStatistics {
  stats: Record<string, number>;
  averageReviewTime: number;
}

export type RecommendationType = 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';

export const RECOMMENDATION_LABELS: Record<RecommendationType, string> = {
  accept: 'Accept',
  minor_revisions: 'Minor Revisions',
  major_revisions: 'Major Revisions',
  reject: 'Reject',
};

export const RECOMMENDATION_COLORS: Record<RecommendationType, string> = {
  accept: 'text-green-600 bg-green-50',
  minor_revisions: 'text-yellow-600 bg-yellow-50',
  major_revisions: 'text-orange-600 bg-orange-50',
  reject: 'text-red-600 bg-red-50',
};