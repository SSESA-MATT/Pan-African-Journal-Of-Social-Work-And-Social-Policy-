'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  User, 
  Tag, 
  BookOpen, 
  Eye, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Quote,
  Share2,
  Bookmark,
  TrendingUp,
  Clock,
  AlertCircle,
  Search
} from 'lucide-react';

// Types
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

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
  query: string;
}

type SortOption = 'relevance' | 'date' | 'title' | 'citations' | 'views';
type SortOrder = 'asc' | 'desc';

interface SearchResultsDisplayProps {
  searchResponse: SearchResponse | null;
  loading?: boolean;
  error?: string | null;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: SortOption, sortOrder: SortOrder) => void;
  onResultClick?: (result: SearchResult) => void;
  currentSort?: { sortBy: SortOption; sortOrder: SortOrder };
  className?: string;
}

const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({
  searchResponse,
  loading = false,
  error = null,
  onPageChange,
  onSortChange,
  onResultClick,
  currentSort = { sortBy: 'relevance', sortOrder: 'desc' },
  className = ''
}) => {
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());

  // Article type and language mappings
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

  // Utility functions
  const toggleAbstract = (articleId: string) => {
    setExpandedAbstracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const highlightSearchTerms = (text: string, query: string) => {
    if (!query) return text;
    
    const terms = query.split(/\s+/).filter(term => term.length > 2);
    let highlightedText = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded font-medium">$1</mark>');
    });
    
    return highlightedText;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleShare = async (result: SearchResult) => {
    const shareData = {
      title: result.title,
      text: `${result.title} by ${result.authors.join(', ')}`,
      url: `${window.location.origin}/articles/${result.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareData.url);
      // You could show a toast notification here
    }
  };

  const handleCitation = (result: SearchResult, format: 'apa' | 'mla' | 'chicago' | 'bibtex') => {
    // This would typically open a citation modal or download the citation
    console.log(`Generate ${format} citation for article ${result.id}`);
  };

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: TrendingUp },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'title', label: 'Title', icon: BookOpen },
    { value: 'citations', label: 'Citations', icon: Quote },
    { value: 'views', label: 'Views', icon: Eye }
  ];

  // Pagination component
  const renderPagination = () => {
    if (!searchResponse || searchResponse.totalPages <= 1) return null;

    const { page, totalPages } = searchResponse;
    const maxVisiblePages = 7;
    const pages = [];

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange?.(1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300">
            ...
          </span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange?.(i)}
          className={`px-3 py-2 text-sm font-medium border border-gray-300 ${
            i === page
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange?.(totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange?.(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    );

    return (
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-gray-700">
          Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, searchResponse.total)} of {searchResponse.total.toLocaleString()} results
        </div>
        <div className="flex">
          {pages}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className={`search-results-loading ${className}`}>
        <div className="space-y-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="flex space-x-4 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`search-results-error ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Search Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!searchResponse || !searchResponse.results.length) {
    return (
      <div className={`search-results-empty ${className}`}>
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500 mb-6">
            {searchResponse?.query 
              ? `No results found for "${searchResponse.query}". Try adjusting your search terms or filters.`
              : 'Enter a search query to find articles.'
            }
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="font-medium text-blue-900 mb-2">Search Tips</div>
              <ul className="text-blue-700 space-y-1 text-left">
                <li>• Use quotes for exact phrases</li>
                <li>• Try different keywords</li>
                <li>• Check your spelling</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="font-medium text-green-900 mb-2">Popular Topics</div>
              <ul className="text-green-700 space-y-1 text-left">
                <li>• Education</li>
                <li>• Healthcare</li>
                <li>• Technology</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`search-results-display ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="text-gray-700">
            <span className="font-semibold">{searchResponse.total.toLocaleString()}</span> articles found
            {searchResponse.query && (
              <span className="text-gray-500"> for "<em>{searchResponse.query}</em>"</span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {searchResponse.searchTime}ms
          </div>
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={currentSort.sortBy}
            onChange={(e) => onSortChange?.(e.target.value as SortOption, currentSort.sortOrder)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => onSortChange?.(currentSort.sortBy, currentSort.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            title={`Sort ${currentSort.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {currentSort.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        {searchResponse.results.map((result, index) => {
          const isExpanded = expandedAbstracts.has(result.id);
          const isBookmarked = bookmarkedArticles.has(result.id);
          const abstractText = isExpanded ? result.abstract : truncateText(result.abstract);
          
          return (
            <article
              key={result.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Article Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                    <button
                      onClick={() => onResultClick?.(result)}
                      className="hover:text-blue-600 transition-colors duration-200 text-left"
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchTerms(result.title, searchResponse.query)
                      }}
                    />
                  </h2>
                  
                  {/* Article Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    {/* Authors */}
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{result.authors.join(', ')}</span>
                    </div>
                    
                    {/* Publication Date */}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(result.published_at)}</span>
                    </div>
                    
                    {/* Volume/Issue */}
                    {result.volume_info && (
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>
                          Vol. {result.volume_info.volume_number}
                          {result.issue_info && `, Issue ${result.issue_info.issue_number}`}
                        </span>
                      </div>
                    )}
                    
                    {/* Article Type */}
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {articleTypeMap[result.article_type as keyof typeof articleTypeMap] || result.article_type}
                    </span>
                    
                    {/* Language */}
                    {result.language_code !== 'en' && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {languageMap[result.language_code as keyof typeof languageMap] || result.language_code}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Relevance Score & Metrics */}
                <div className="text-right ml-4">
                  {result.rank && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Relevance</div>
                      <div className="text-sm font-medium text-blue-600">
                        {Math.round(result.rank * 100)}%
                      </div>
                    </div>
                  )}
                  
                  {result.metrics && (
                    <div className="flex space-x-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {formatNumber(result.metrics.views)}
                      </div>
                      <div className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {formatNumber(result.metrics.downloads)}
                      </div>
                      <div className="flex items-center">
                        <Quote className="w-3 h-3 mr-1" />
                        {formatNumber(result.metrics.citations)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Abstract */}
              <div className="mb-4">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerms(abstractText, searchResponse.query)
                  }}
                />
                {result.abstract.length > 300 && (
                  <button
                    onClick={() => toggleAbstract(result.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
              
              {/* Keywords */}
              {result.keywords.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Tag className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="text-sm text-gray-600">Keywords:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 cursor-pointer transition-colors"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerms(keyword, searchResponse.query)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  {/* View Article */}
                  <button
                    onClick={() => onResultClick?.(result)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Article
                  </button>
                  
                  {/* Download PDF */}
                  {result.pdf_url && (
                    <a
                      href={result.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download PDF
                    </a>
                  )}
                  
                  {/* Citation */}
                  <button
                    onClick={() => handleCitation(result, 'apa')}
                    className="flex items-center text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    <Quote className="w-4 h-4 mr-1" />
                    Cite
                  </button>
                  
                  {/* Share */}
                  <button
                    onClick={() => handleShare(result)}
                    className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Bookmark */}
                  <button
                    onClick={() => toggleBookmark(result.id)}
                    className={`p-2 rounded-full transition-colors ${
                      isBookmarked 
                        ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  
                  {/* External Link */}
                  <button
                    onClick={() => onResultClick?.(result)}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Open article"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default SearchResultsDisplay;