// Core data model interfaces for the Africa Journal platform

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  affiliation: string;
  role: 'author' | 'reviewer' | 'editor' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface Submission {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  author_id: string;
  co_authors: string[];
  status: 'submitted' | 'under_review' | 'revisions_required' | 'accepted' | 'rejected';
  manuscript_url: string;
  editor_comments?: string;
  submitted_at: Date;
  updated_at: Date;
}

export interface Review {
  id: string;
  submission_id: string;
  reviewer_id: string;
  comments: string;
  recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
  submitted_at: Date;
}

export interface Article {
  id: string;
  submission_id: string;
  title: string;
  abstract: string;
  authors: string[];
  pdf_url: string;
  issue_id: string;
  published_at: Date;
}

export interface Issue {
  id: string;
  issue_number: number;
  volume_id: string;
  description: string;
  published_at: Date;
}

export interface Volume {
  id: string;
  volume_number: number;
  year: number;
  description: string;
}

// Request/Response DTOs
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  affiliation: string;
  role?: 'author' | 'reviewer';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refresh_token: string;
}

export interface CreateSubmissionRequest {
  title: string;
  abstract: string;
  keywords: string[];
  co_authors: string[];
}

export interface UpdateSubmissionStatusRequest {
  status: Submission['status'];
  editor_comments?: string;
}

export interface CreateReviewRequest {
  comments: string;
  recommendation: Review['recommendation'];
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
}

export interface PublishArticleRequest {
  submission_id: string;
  issue_id: string;
}