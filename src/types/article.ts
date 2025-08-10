// Article-related types for the frontend

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
  volume?: Volume;
  description: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  submission_id: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  pdf_url: string;
  issue_id: string;
  issue?: Issue;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithDetails extends Article {
  volume_number: number;
  issue_number: number;
  volume_year: number;
  volume_description: string;
  issue_description: string;
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
  title?: string;
  abstract?: string;
  authors?: string[];
  keywords?: string[];
}

export interface ArticleSearchFilters {
  volume?: number;
  issue?: number;
  year?: number;
  keyword?: string;
  author?: string;
}

export interface ArticleSearchResponse {
  articles: ArticleWithDetails[];
  total: number;
  page: number;
  totalPages: number;
}

export interface VolumeWithIssues extends Volume {
  issues: Issue[];
}

export interface IssueWithArticles extends Issue {
  articles: Article[];
}

export const ARTICLE_STATUS_LABELS = {
  published: 'Published',
  draft: 'Draft'
} as const;

export const ARTICLE_STATUS_COLORS = {
  published: 'bg-accent-green/10 text-green-800 border-green-200',
  draft: 'bg-neutral-100 text-neutral-800 border-neutral-200'
} as const;