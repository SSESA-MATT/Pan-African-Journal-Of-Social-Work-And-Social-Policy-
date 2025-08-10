'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleSearchFilters, ArticleWithDetails, ArticleSearchResponse } from '@/types/article';
import { articleApi } from '@/lib/articleApi';

interface ArticleListProps {
  filters: ArticleSearchFilters;
  searchQuery: string;
}

export const ArticleList: React.FC<ArticleListProps> = ({ filters, searchQuery }) => {
  const [articles, setArticles] = useState<ArticleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const articlesPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
    loadArticles(1);
  }, [filters, searchQuery]);

  useEffect(() => {
    loadArticles(currentPage);
  }, [currentPage]);

  const loadArticles = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      let response: ArticleSearchResponse;

      if (searchQuery.trim()) {
        response = await articleApi.searchArticles(searchQuery, page, articlesPerPage);
      } else {
        response = await articleApi.getPublishedArticles(page, articlesPerPage, filters);
      }

      setArticles(response.articles);
      setTotalPages(response.totalPages);
      setTotalArticles(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} et al.`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading && articles.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Articles</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => loadArticles(currentPage)}
              className="px-4 py-2 bg-accent-red text-white rounded-md hover:bg-accent-red/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {searchQuery ? 'Search Results' : 'Published Articles'}
            </h2>
            <p className="text-neutral-600 mt-1">
              {totalArticles === 0 ? 'No articles found' : 
               totalArticles === 1 ? '1 article found' : 
               `${totalArticles} articles found`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
          
          {totalArticles > 0 && (
            <div className="text-sm text-neutral-500">
              Showing {((currentPage - 1) * articlesPerPage) + 1}-{Math.min(currentPage * articlesPerPage, totalArticles)} of {totalArticles}
            </div>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Articles Found</h3>
            <p className="text-neutral-600 mb-4">
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search criteria or filters.'
                : 'No articles have been published yet.'}
            </p>
            {(searchQuery || Object.keys(filters).length > 0) && (
              <Link
                href="/articles"
                className="inline-flex items-center px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors"
              >
                View All Articles
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Article Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-green-800 border border-green-200">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Published
                    </span>
                    <span className="text-xs text-neutral-500">
                      Vol. {article.volume_number}, Issue {article.issue_number}
                    </span>
                  </div>
                  
                  <Link href={`/articles/${article.id}`}>
                    <h3 className="text-lg font-semibold text-neutral-900 hover:text-accent-green transition-colors line-clamp-2 cursor-pointer">
                      {article.title}
                    </h3>
                  </Link>
                </div>

                {/* Authors */}
                <div className="mb-3">
                  <p className="text-sm text-neutral-600">
                    by {formatAuthors(article.authors)}
                  </p>
                </div>

                {/* Abstract */}
                <div className="mb-4">
                  <p className="text-sm text-neutral-700 line-clamp-3">
                    {truncateText(article.abstract, 150)}
                  </p>
                </div>

                {/* Keywords */}
                {article.keywords && article.keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {article.keywords.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                          {keyword}
                        </span>
                      ))}
                      {article.keywords.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                          +{article.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div className="text-xs text-neutral-500">
                    Published {formatDate(article.published_at)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/articles/${article.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-accent-green border border-accent-green rounded-md hover:bg-accent-green hover:text-white transition-colors"
                    >
                      Read More
                    </Link>
                    
                    {article.pdf_url && (
                      <a
                        href={article.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-accent-green text-white'
                          : 'text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for Page Changes */}
      {isLoading && articles.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-green"></div>
              <span className="text-neutral-700">Loading articles...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};