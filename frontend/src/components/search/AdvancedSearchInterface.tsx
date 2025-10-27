'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Calendar, User, Tag, BookOpen, Globe } from 'lucide-react';
import { debounce } from 'lodash';

// Types for search functionality
interface SearchFilters {
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

interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'title' | 'citations' | 'views';
  sortOrder?: 'asc' | 'desc';
  includeFacets?: boolean;
  includeMetrics?: boolean;
}

interface SearchResult {
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
}

interface SearchResponse {
  results: SearchResult[];
  facets?: any[];
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
  query: string;
}

interface SearchSuggestion {
  text: string;
  type: 'query' | 'author' | 'keyword' | 'title';
  count: number;
}

interface AdvancedSearchInterfaceProps {
  onSearchResults?: (results: SearchResponse) => void;
  onSearchError?: (error: string) => void;
  onSearchStart?: () => void;
  initialQuery?: string;
  className?: string;
}

const AdvancedSearchInterface: React.FC<AdvancedSearchInterfaceProps> = ({
  onSearchResults,
  onSearchError,
  onSearchStart,
  initialQuery = '',
  className = ''
}) => {
  // State management
  const [filters, setFilters] = useState<SearchFilters>({ query: initialQuery });
  const [options, setOptions] = useState<SearchOptions>({
    page: 1,
    limit: 20,
    sortBy: 'relevance',
    sortOrder: 'desc',
    includeFacets: true,
    includeMetrics: true
  });
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Article type mapping
  const articleTypeMap = {
    'research_article': 'Research Article',
    'review_article': 'Review Article',
    'case_study': 'Case Study',
    'brief_communication': 'Brief Communication',
    'commentary': 'Commentary',
    'policy_brief': 'Policy Brief',
    'practice_note': 'Practice Note',
    'student_voice': 'Student Voice'
  };

  const languageMap = {
    'en': 'English',
    'fr': 'French',
    'ar': 'Arabic',
    'sw': 'Swahili',
    'pt': 'Portuguese',
    'es': 'Spanish'
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: SearchFilters, searchOptions: SearchOptions) => {
      if (!searchFilters.query && !searchFilters.title && !searchFilters.authors?.length && !searchFilters.keywords?.length) {
        setResults(null);
        return;
      }

      setLoading(true);
      setError(null);
      onSearchStart?.();

      try {
        const queryParams = new URLSearchParams();
        
        // Add search parameters
        if (searchFilters.query) queryParams.append('q', searchFilters.query);
        if (searchFilters.title) queryParams.append('title', searchFilters.title);
        if (searchFilters.authors?.length) queryParams.append('authors', searchFilters.authors.join(','));
        if (searchFilters.keywords?.length) queryParams.append('keywords', searchFilters.keywords.join(','));
        if (searchFilters.dateRange?.start) queryParams.append('dateFrom', searchFilters.dateRange.start);
        if (searchFilters.dateRange?.end) queryParams.append('dateTo', searchFilters.dateRange.end);
        if (searchFilters.volumeNumbers?.length) queryParams.append('volumes', searchFilters.volumeNumbers.join(','));
        if (searchFilters.issueNumbers?.length) queryParams.append('issues', searchFilters.issueNumbers.join(','));
        if (searchFilters.articleTypes?.length) queryParams.append('types', searchFilters.articleTypes.join(','));
        if (searchFilters.language) queryParams.append('language', searchFilters.language);
        
        // Add search options
        queryParams.append('page', searchOptions.page?.toString() || '1');
        queryParams.append('limit', searchOptions.limit?.toString() || '20');
        queryParams.append('sortBy', searchOptions.sortBy || 'relevance');
        queryParams.append('sortOrder', searchOptions.sortOrder || 'desc');

        const response = await fetch(`/api/search/articles?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setResults(data.data);
          onSearchResults?.(data.data);
        } else {
          throw new Error(data.message || 'Search failed');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred during search';
        setError(errorMessage);
        setResults(null);
        onSearchError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    }, 300),
    [onSearchResults]
  );

  // Get suggestions
  const getSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSuggestions(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to get suggestions:', err);
      }
    }, 200),
    []
  );

  // Handle search input change
  const handleQueryChange = (value: string) => {
    setFilters(prev => ({ ...prev, query: value }));
    getSuggestions(value);
    setShowSuggestions(true);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'author') {
      setFilters(prev => ({
        ...prev,
        authors: [...(prev.authors || []), suggestion.text]
      }));
    } else if (suggestion.type === 'keyword') {
      setFilters(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), suggestion.text]
      }));
    } else {
      setFilters(prev => ({ ...prev, query: suggestion.text }));
    }
    setShowSuggestions(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({ query: filters.query });
    setOptions(prev => ({ ...prev, page: 1 }));
  };

  // Remove specific filter
  const removeFilter = (type: string, value?: string | number) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (type) {
        case 'query':
          newFilters.query = '';
          break;
        case 'title':
          newFilters.title = undefined;
          break;
        case 'author':
          newFilters.authors = (newFilters.authors || []).filter(a => a !== value);
          break;
        case 'keyword':
          newFilters.keywords = (newFilters.keywords || []).filter(k => k !== value);
          break;
        case 'dateRange':
          newFilters.dateRange = undefined;
          break;
        case 'language':
          newFilters.language = undefined;
          break;
      }
      
      return newFilters;
    });
  };

  // Execute search when filters or options change
  useEffect(() => {
    debouncedSearch(filters, options);
  }, [filters, options, debouncedSearch]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.title) count++;
    if (filters.authors?.length) count += filters.authors.length;
    if (filters.keywords?.length) count += filters.keywords.length;
    if (filters.dateRange) count++;
    if (filters.volumeNumbers?.length) count += filters.volumeNumbers.length;
    if (filters.issueNumbers?.length) count += filters.issueNumbers.length;
    if (filters.articleTypes?.length) count += filters.articleTypes.length;
    if (filters.language) count++;
    return count;
  }, [filters]);

  return (
    <div className={`advanced-search-interface ${className}`}>
      {/* Main Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={filters.query || ''}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search articles, authors, keywords..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
        
        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center">
                  {suggestion.type === 'author' && <User className="w-4 h-4 mr-2 text-gray-400" />}
                  {suggestion.type === 'keyword' && <Tag className="w-4 h-4 mr-2 text-gray-400" />}
                  {suggestion.type === 'title' && <BookOpen className="w-4 h-4 mr-2 text-gray-400" />}
                  {suggestion.type === 'query' && <Search className="w-4 h-4 mr-2 text-gray-400" />}
                  <span className="text-gray-900">{suggestion.text}</span>
                </div>
                <span className="text-xs text-gray-500">{suggestion.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
          {showAdvancedFilters ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </button>
        
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Title Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={filters.title || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Search in titles"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      start: e.target.value,
                      end: prev.dateRange?.end || ''
                    }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      start: prev.dateRange?.start || '',
                      end: e.target.value
                    }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Language
              </label>
              <select
                value={filters.language || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Languages</option>
                {Object.entries(languageMap).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.title && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Title: {filters.title}
              <button
                onClick={() => removeFilter('title')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.authors?.map((author, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Author: {author}
              <button
                onClick={() => removeFilter('author', author)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          {filters.keywords?.map((keyword, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Keyword: {keyword}
              <button
                onClick={() => removeFilter('keyword', keyword)}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          {filters.dateRange && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              Date: {filters.dateRange.start} - {filters.dateRange.end}
              <button
                onClick={() => removeFilter('dateRange')}
                className="ml-2 text-yellow-600 hover:text-yellow-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.language && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
              Language: {languageMap[filters.language as keyof typeof languageMap]}
              <button
                onClick={() => removeFilter('language')}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Search Results Summary */}
      {results && (
        <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              Found <strong>{results.total.toLocaleString()}</strong> articles
              {results.query && (
                <span> for "<em>{results.query}</em>"</span>
              )}
            </span>
            <span className="text-sm text-gray-500">
              ({results.searchTime}ms)
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <select
              value={options.sortBy}
              onChange={(e) => setOptions(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="title">Title</option>
            </select>
            
            <select
              value={options.sortOrder}
              onChange={(e) => setOptions(prev => ({ ...prev, sortOrder: e.target.value as any, page: 1 }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Searching...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchInterface;