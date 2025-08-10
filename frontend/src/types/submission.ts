// Submission-related types for the frontend

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
  submitted_at: string;
  updated_at: string;
}

export interface SubmissionWithAuthor extends Submission {
  first_name: string;
  last_name: string;
  email: string;
  affiliation: string;
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

export interface SubmissionFormData {
  title: string;
  abstract: string;
  keywords: string;
  co_authors: string;
  manuscript: File | null;
}

export interface SubmissionValidationErrors {
  title?: string;
  abstract?: string;
  keywords?: string;
  co_authors?: string;
  manuscript?: string;
}

export interface SubmissionStatistics {
  submitted?: number;
  under_review?: number;
  revisions_required?: number;
  accepted?: number;
  rejected?: number;
}

export const SUBMISSION_STATUS_LABELS: Record<Submission['status'], string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  revisions_required: 'Revisions Required',
  accepted: 'Accepted',
  rejected: 'Rejected'
};

export const SUBMISSION_STATUS_COLORS: Record<Submission['status'], string> = {
  submitted: 'bg-neutral-100 text-neutral-800',
  under_review: 'bg-secondary-100 text-secondary-800',
  revisions_required: 'bg-primary-100 text-primary-800',
  accepted: 'bg-secondary-100 text-secondary-800 border border-secondary-200',
  rejected: 'bg-primary-100 text-primary-800 border border-primary-200'
};