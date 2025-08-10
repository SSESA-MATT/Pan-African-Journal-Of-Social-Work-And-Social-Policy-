'use client';

import React, { useState, useEffect } from 'react';
import { ArticleSearchFilters, VolumeWithIssues } from '@/types/article';
import { articleApi } from '@/lib/articleApi';

interface ArticleFiltersProps {
  filters: ArticleSearchFilters;
  searchQuery: string;
  onFiltersChange: (filters: ArticleSearchFilters) => void;
  onSearchChange: (query: string) => void;
}

export const ArticleFilters: React.FC<ArticleFiltersProps> = ({
  filters,
  searchQuery,
  onFiltersChange,
  onSearchChange,
}) => {
  const [volumes, setVolumes] = useState<VolumeWithIssues[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVolumes();
  }, []);

  const loadVolumes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await articleApi.getVolumes();
      setVolumes(response.volumes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load volumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ArticleSearchFilters, value: string | number | undefined) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }

    // Reset issue filter when volume changes
    if (key === 'volume') {
      delete newFilters.issue;
    }

    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const getIssuesForSelectedVolume = () => {
    if (!filters.volume) return [];
    const selectedVolume = volumes.find(v => v.volume_number === filters.volume);
    return selectedVolume?.issues || [];
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.length > 0;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
      <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Search & Filter Articles
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-accent-red hover:text-accent-red/80 font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Search Articles
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title, author, or keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Volume Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Volume
            </label>
            <select
              value={filters.volume || ''}
              onChange={(e) => handleFilterChange('volume', e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">All Volumes</option>
              {volumes.map((volume) => (
                <option key={volume.id} value={volume.volume_number}>
                  Volume {volume.volume_number} ({volume.year})
                </option>
              ))}
            </select>
          </div>

          {/* Issue Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Issue
            </label>
            <select
              value={filters.issue || ''}
              onChange={(e) => handleFilterChange('issue', e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
              disabled={isLoading || !filters.volume}
            >
              <option value="">All Issues</option>
              {getIssuesForSelectedVolume().map((issue) => (
                <option key={issue.id} value={issue.issue_number}>
                  Issue {issue.issue_number}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Year
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">All Years</option>
              {Array.from(new Set(volumes.map(v => v.year)))
                .sort((a, b) => b - a)
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          </div>

          {/* Author Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Author
            </label>
            <input
              type="text"
              placeholder="Filter by author..."
              value={filters.author || ''}
              onChange={(e) => handleFilterChange('author', e.target.value || undefined)}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-sm font-medium text-neutral-600">Active filters:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-green-800 border border-green-200">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => onSearchChange('')}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-600 hover:bg-green-200 hover:text-green-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {filters.volume && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                  Volume {filters.volume}
                  <button
                    onClick={() => handleFilterChange('volume', undefined)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {filters.issue && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200">
                  Issue {filters.issue}
                  <button
                    onClick={() => handleFilterChange('issue', undefined)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {filters.year && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
                  Year {filters.year}
                  <button
                    onClick={() => handleFilterChange('year', undefined)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-600 hover:bg-yellow-200 hover:text-yellow-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {filters.author && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-red/10 text-red-800 border border-red-200">
                  Author: {filters.author}
                  <button
                    onClick={() => handleFilterChange('author', undefined)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-red-600 hover:bg-red-200 hover:text-red-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};