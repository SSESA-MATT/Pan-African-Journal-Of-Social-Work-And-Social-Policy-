'use client';

import React, { useState } from 'react';
import { Calendar, User, Tag, BookOpen, Eye, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

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
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
  query: string;
}

interface SearchResultsProps {
  searchResponse: SearchResponse;
  onPageChange?: (page: number) => void;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchResponse,
  onPageChange,
  onResultClick,
  className = ''
}) => {
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());

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
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  const renderPagination = () => {
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
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
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
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    );

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, searchResponse.total)} of {searchResponse.total.toLocaleString()} results
        </div>
        <div className="flex">
          {pages}
        </div>
      </div>
    );
  };

  if (!searchResponse.results.length) {
    return (
      <div className={`search-results-empty ${className}`}>
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500">
            {searchResponse.query 
              ? `No results found for "${searchResponse.query}". Try adjusting your search terms or filters.`
              : 'Enter a search query to find articles.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`search-results ${className}`}>
      <div className="space-y-6">
        {searchResponse.results.map((result, index) => {
          const isExpanded = expandedAbstracts.has(result.id);
          const abstractText = isExpanded ? result.abstract : truncateText(result.abstract);
          
          return (
            <article
              key={result.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Article Header */}
              <div className="flex items-start justify-between mb-3">
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
                
                {/* Relevance Score */}
                {result.rank && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Relevance</div>
                    <div className="text-sm font-medium text-blue-600">
                      {Math.round(result.rank * 100)}%
                    </div>
                  </div>
                )}
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
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 cursor-pointer"
                      >
                        {keyword}
                      </span>
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
                  
                  {/* External Link */}
                  <button className="flex items-center text-gray-600 hover:text-gray-800 text-sm font-medium">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Share
                  </button>
                </div>
                
                {/* Article ID */}
                <div className="text-xs text-gray-400">
                  ID: {result.id}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {searchResponse.totalPages > 1 && renderPagination()}
    </div>
  );
};

export default SearchResults;