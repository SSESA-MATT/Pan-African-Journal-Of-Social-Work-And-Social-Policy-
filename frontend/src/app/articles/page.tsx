'use client';

import React, { useState, useEffect } from 'react';
import { ArticleList } from '@/components/ArticleList';
import { ArticleFilters } from '@/components/ArticleFilters';
import { ArticleSearchFilters } from '@/types/article';

export default function ArticlesPage() {
  const [filters, setFilters] = useState<ArticleSearchFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleFiltersChange = (newFilters: ArticleSearchFilters) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
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

        {/* Search and Filters */}
        <div className="mb-8">
          <ArticleFilters
            filters={filters}
            searchQuery={searchQuery}
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Articles List */}
        <ArticleList
          filters={filters}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}