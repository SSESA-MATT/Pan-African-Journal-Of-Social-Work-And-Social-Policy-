// TypeScript types for journal enhancement features

export interface DOI {
  id: string;
  article_id: string;
  doi_string: string;
  registration_status: 'pending' | 'registered' | 'failed' | 'updated';
  registered_at?: string;
  crossref_response?: object;
  metadata: object;
  created_at: string;
  updated_at: string;
}

export interface ArticleMetric {
  id: string;
  article_id: string;
  metric_type: 'view' | 'download' | 'citation' | 'share';
  count: number;
  last_updated: string;
  metadata: object;
}

export interface ArticleMetricEvent {
  id: string;
  article_id: string;
  event_type: 'view' | 'download' | 'citation' | 'share';
  user_session?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  country_code?: string;
  city?: string;
  metadata: object;
  timestamp: string;
}

export interface EditorialEvent {
  id: string;
  event_type: 'submission' | 'review_due' | 'revision_due' | 'publication' | 'deadline' | 'meeting' | 'special_issue';
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  submission_id?: string;
  manuscript_id?: string;
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminder_sent: boolean;
  metadata: object;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchAnalytics {
  id: string;
  search_query: string;
  filters_applied: object;
  results_count: number;
  user_session?: string;
  ip_address?: string;
  user_agent?: string;
  search_time_ms?: number;
  clicked_results: string[];
  timestamp: string;
}

export interface ArticleKeyword {
  id: string;
  article_id: string;
  keyword: string;
  weight: number;
  created_at: string;
}

export interface ArticleAuthor {
  id: string;
  article_id: string;
  author_name: string;
  author_email?: string;
  orcid_id?: string;
  affiliation?: string;
  author_order: number;
  corresponding_author: boolean;
  created_at: string;
}

export interface CitationExport {
  id: string;
  article_id: string;
  format: 'bibtex' | 'endnote' | 'ris' | 'apa' | 'chicago' | 'mla';
  user_session?: string;
  ip_address?: string;
  exported_at: string;
}

export interface RelatedArticle {
  id: string;
  article_id: string;
  related_article_id: string;
  similarity_score: number;
  relationship_type: 'keyword_similarity' | 'author_similarity' | 'citation_similarity' | 'manual_curation';
  created_at: string;
}

// Enhanced Article type with new fields
export interface EnhancedArticle {
  id: string;
  submission_id: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  pdf_url: string;
  issue_id: string;
  volume_id?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  doi?: DOI;
  metrics?: {
    views: number;
    downloads: number;
    citations: number;
    shares: number;
  };
  related_articles?: RelatedArticle[];
  normalized_authors?: ArticleAuthor[];
}

// View types
export interface ArticleMetricsSummary {
  article_id: string;
  title: string;
  published_at: string;
  view_count: number;
  download_count: number;
  citation_count: number;
  share_count: number;
  metrics_last_updated: string;
}

export interface UpcomingEditorialEvent extends EditorialEvent {
  assigned_to_name?: string;
  submission_title?: string;
  manuscript_title?: string;
  urgency_status: 'overdue' | 'due_soon' | 'upcoming';
}

export interface SearchAnalyticsSummary {
  search_date: string;
  total_searches: number;
  unique_sessions: number;
  avg_results_count: number;
  avg_search_time_ms: number;
  zero_result_searches: number;
  searches_with_clicks: number;
}

// API Request/Response types
export interface SearchRequest {
  query?: string;
  title?: string;
  authors?: string[];
  keywords?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  volumeNumbers?: number[];
  issueNumbers?: number[];
  articleTypes?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'title' | 'citations';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFacets {
  volumes: Array<{id: string, number: number, count: number}>;
  issues: Array<{id: string, number: number, count: number}>;
  years: Array<{year: number, count: number}>;
  articleTypes: Array<{type: string, count: number}>;
}

export interface SearchResponse {
  articles: EnhancedArticle[];
  facets: SearchFacets;
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
}

export interface DOIRegistrationRequest {
  article_id: string;
  metadata: {
    title: string;
    authors: Array<{
      name: string;
      orcid?: string;
      affiliation?: string;
    }>;
    publication_date: string;
    journal: {
      title: string;
      issn?: string;
      volume?: number;
      issue?: number;
    };
    abstract?: string;
    keywords?: string[];
    url: string;
  };
}

export interface CitationFormats {
  bibtex: string;
  endnote: string;
  ris: string;
  apa: string;
  chicago: string;
  mla: string;
}

export interface AnalyticsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  articleIds?: string[];
  metricTypes?: string[];
  countries?: string[];
}

export interface AnalyticsReport {
  summary: {
    total_views: number;
    total_downloads: number;
    total_citations: number;
    unique_visitors: number;
    top_articles: Array<{
      article_id: string;
      title: string;
      views: number;
      downloads: number;
    }>;
  };
  geographic_distribution: Array<{
    country_code: string;
    country_name: string;
    views: number;
    downloads: number;
  }>;
  time_series: Array<{
    date: string;
    views: number;
    downloads: number;
    citations: number;
  }>;
}

export interface EditorialCalendarFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  eventTypes?: string[];
  assignedTo?: string[];
  status?: string[];
  priority?: string[];
}

export interface WorkflowReport {
  summary: {
    total_events: number;
    completed_events: number;
    overdue_events: number;
    upcoming_deadlines: number;
  };
  by_type: Array<{
    event_type: string;
    count: number;
    avg_completion_time: number;
  }>;
  by_assignee: Array<{
    user_id: string;
    user_name: string;
    assigned_events: number;
    completed_events: number;
    overdue_events: number;
  }>;
}