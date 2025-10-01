export interface Manuscript {
  id: string;
  title: string;
  abstract: string;
  content: string;
  keywords: string[];
  authors: string[];
  corresponding_author: string;
  author_id: string;
  status: ManuscriptStatus;
  submission_date: string;
  last_updated: string;
  assigned_reviewers?: string[];
  reviews?: Review[];
  files?: ManuscriptFile[];
  metadata?: ManuscriptMetadata;
  editor_comments?: string;
  word_count?: number;
  manuscript_url?: string;
}

export interface ManuscriptMetadata {
  word_count: number;
  manuscript_type: 'research' | 'review' | 'case-study' | 'commentary' | 'brief-communication';
  funding_information?: string;
  conflict_of_interest?: string;
  ethics_approval?: string;
  data_availability?: string;
}

export interface ManuscriptFile {
  id: string;
  manuscript_id: string;
  filename: string;
  file_type: 'manuscript' | 'figure' | 'table' | 'supplementary';
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export type ManuscriptStatus = 
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'awaiting-revision'
  | 'revised-submitted'
  | 'accepted'
  | 'rejected'
  | 'published';

export interface Review {
  id: string;
  manuscript_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  status: ReviewStatus;
  recommendation: ReviewRecommendation;
  comments_to_author?: string;
  comments_to_editor?: string;
  quality_rating: number;
  originality_rating: number;
  significance_rating: number;
  presentation_rating: number;
  overall_rating: number;
  submitted_date?: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 
  | 'assigned'
  | 'in-progress'
  | 'completed'
  | 'overdue';

export type ReviewRecommendation = 
  | 'accept'
  | 'minor-revisions'
  | 'major-revisions'
  | 'reject-resubmit'
  | 'reject';

export interface ManuscriptSubmissionRequest {
  title: string;
  abstract: string;
  content: string;
  keywords: string[];
  authors: string[];
  corresponding_author: string;
  manuscript_type: ManuscriptMetadata['manuscript_type'];
  research_areas?: string;
  funding_information?: string;
  conflict_of_interest?: string;
  ethics_approval?: string;
  data_availability?: string;
  author_id?: string;
}

export interface ManuscriptUpdateRequest {
  title?: string;
  abstract?: string;
  content?: string;
  keywords?: string[];
  authors?: string[];
  metadata?: Partial<ManuscriptMetadata>;
}

export interface ReviewSubmissionRequest {
  manuscript_id: string;
  recommendation: ReviewRecommendation;
  comments_to_author?: string;
  comments_to_editor?: string;
  quality_rating: number;
  originality_rating: number;
  significance_rating: number;
  presentation_rating: number;
  overall_rating: number;
}
