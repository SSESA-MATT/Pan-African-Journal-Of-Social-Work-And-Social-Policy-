export interface SearchFilters {
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
  language?: string;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'title' | 'citations' | 'views';
  sortOrder?: 'asc' | 'desc';
  includeFacets?: boolean;
  includeMetrics?: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  published_at: string;
  volume_id: string;
  issue_id: string;
  article_type: string;
  language_code: string;
  pdf_url: string;
  rank?: number;
  metrics?: {
    views: number;
    downloads: number;
    citations: number;
  };
  volume_info?: {
    volume_number: number;
    year: number;
  };
  issue_info?: {
    issue_number: number;
    description: string;
  };
}

export interface FacetValue {
  value: string | number;
  label: string;
  count: number;
  selected?: boolean;
}

export interface FacetGroup {
  key: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'date';
  values: FacetValue[];
  multiSelect?: boolean;
  collapsed?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  facets?: FacetGroup[];
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
  query: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'author' | 'keyword' | 'title';
  count: number;
}

export interface SearchApiResponse {
  success: boolean;
  data?: SearchResponse;
  message?: string;
  error?: string;
}