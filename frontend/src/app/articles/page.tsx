'use client';

import React, { useState, useEffect } from 'react';
import { ArticleList } from '@/components/ArticleList';
import { ArticleFilters } from '@/components/ArticleFilters';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ArticleSearchFilters } from '@/types/article';

export default function ArticlesPage() {
  const [filters, setFilters] = useState<ArticleSearchFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFiltersChange = (newFilters: ArticleSearchFilters) => {
    try {
      setFilters(newFilters);
      setError(null);
    } catch (err) {
      setError('Failed to update filters');
      console.error('Filter update error:', err);
    }
  };

  const handleSearchChange = (query: string) => {
    try {
      setSearchQuery(query);
      setError(null);
    } catch (err) {
      setError('Failed to update search');
      console.error('Search update error:', err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-900 via-accent-black to-neutral-800 text-white rounded-lg mb-8">
            <div className="px-6 md:px-8 py-12">
              <div className="max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Published Articles
                </h1>
                <p className="text-xl text-neutral-200 mb-6">
                  Explore our collection of peer-reviewed research in social work and social policy
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-accent-red rounded-full"></div>
                  <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-8">
            <ErrorBoundary fallback={
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">Search and filters are temporarily unavailable.</p>
              </div>
            }>
              <ArticleFilters
                filters={filters}
                searchQuery={searchQuery}
                onFiltersChange={handleFiltersChange}
                onSearchChange={handleSearchChange}
              />
            </ErrorBoundary>
          </div>

          {/* Articles List */}
          <ErrorBoundary fallback={
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-8 text-center">
              <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">Articles Temporarily Unavailable</h3>
              <p className="text-neutral-600">We're working to restore access to our articles. Please try again later.</p>
            </div>
          }>
            <ArticleList
              filters={filters}
              searchQuery={searchQuery}
            />
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}