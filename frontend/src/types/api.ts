// Auth types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  affiliation?: string;
  role: 'admin' | 'editor' | 'reviewer' | 'author';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  affiliation?: string;
  role?: 'admin' | 'editor' | 'reviewer' | 'author';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  session?: any;
  message: string;
}

// Submission types
export interface Submission {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  author_id: string;
  manuscript_url?: string;
  status: 'submitted' | 'under_review' | 'revision_required' | 'accepted' | 'rejected' | 'published';
  submission_date: string;
  review_start_date?: string;
  decision_date?: string;
  editor_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubmissionRequest {
  title: string;
  abstract: string;
  keywords: string[];
  author_id: string;
  manuscript_url?: string;
}

// Review types
export interface Review {
  id: string;
  submission_id: string;
  reviewer_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
  comments: string;
  confidential_comments?: string;
  rating?: number;
  assigned_date: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewRequest {
  submission_id: string;
  reviewer_id: string;
  comments?: string;
  confidential_comments?: string;
  recommendation?: Review['recommendation'];
  rating?: number;
}
