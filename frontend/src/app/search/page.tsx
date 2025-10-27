'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdvancedSearchInterface from '@/components/search/AdvancedSearchInterface';
import SearchResultsDisplay from '@/components/search/SearchResultsDisplay';
import FacetedNavigation from '@/components/search/FacetedNavigation';

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

interface FacetGroup {
  key: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'date';
  values: Array<{
    value: string | number;
    label: string;
    count: number;
    selected?: boolean;
  }>;
  multiSelect?: boolean;
  collapsed?: boolean;
}

interface SearchResponse {
  results: SearchResult[];
  facets?: FacetGroup[];
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
  query: string;
}

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [facets, setFacets] = useState<FacetGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFacets, setShowFacets] = useState(true);
  const [currentSort, setCurrentSort] = useState<{ sortBy: 'relevance' | 'date' | 'title' | 'citations' | 'views'; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  // Get initial query from URL params
  const initialQuery = searchParams.get('q') || '';

  // Handle search results
  const handleSearchResults = (results: SearchResponse) => {
    setSearchResponse(results);
    setError(null);
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (results.query) {
      params.set('q', results.query);
    }
    if (results.page > 1) {
      params.set('page', results.page.toString());
    }
    
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  };

  // Handle search error
  const handleSearchError = (errorMessage: string) => {
    setError(errorMessage);
    setSearchResponse(null);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (searchResponse) {
      // This would trigger a new search with the updated page
      // The AdvancedSearchInterface component handles this internally
      setLoading(true);
      // You would typically call your search API here with the new page
    }
  };

  // Handle sort change
  const handleSortChange = (sortBy: 'relevance' | 'date' | 'title' | 'citations' | 'views', sortOrder: 'asc' | 'desc') => {
    setCurrentSort({ sortBy, sortOrder });
    setLoading(true);
    // You would typically call your search API here with the new sort parameters
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    // Navigate to article detail page
    router.push(`/articles/${result.id}`);
  };

  // Handle facet changes
  const handleFacetChange = (facetKey: string, value: string | number, selected: boolean) => {
    setFacets(prevFacets => 
      prevFacets.map(facet => {
        if (facet.key === facetKey) {
          return {
            ...facet,
            values: facet.values.map(val => 
              val.value === value ? { ...val, selected } : val
            )
          };
        }
        return facet;
      })
    );
  };

  // Clear specific facet
  const handleClearFacet = (facetKey: string) => {
    setFacets(prevFacets => 
      prevFacets.map(facet => {
        if (facet.key === facetKey) {
          return {
            ...facet,
            values: facet.values.map(val => ({ ...val, selected: false }))
          };
        }
        return facet;
      })
    );
  };

  // Clear all facets
  const handleClearAllFacets = () => {
    setFacets(prevFacets => 
      prevFacets.map(facet => ({
        ...facet,
        values: facet.values.map(val => ({ ...val, selected: false }))
      }))
    );
  };

  // Apply filters (trigger new search)
  const handleApplyFilters = () => {
    setLoading(true);
    // This would typically trigger a new search with current facet selections
    // The search logic would read the current facet state and make an API call
  };

  // Load facets when search results change
  useEffect(() => {
    if (searchResponse?.facets) {
      setFacets(searchResponse.facets);
    }
  }, [searchResponse]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Search Articles</h1>
              <p className="mt-1 text-sm text-gray-600">
                Discover research from across Africa's leading academic institutions
              </p>
            </div>
            
            {/* Toggle Facets Button (Mobile) */}
            <button
              onClick={() => setShowFacets(!showFacets)}
              className="lg:hidden flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Filters
              {facets.some(facet => facet.values.some(val => val.selected)) && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {facets.reduce((total, facet) => 
                    total + facet.values.filter(val => val.selected).length, 0
                  )}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Facets */}
          <div className={`lg:col-span-1 ${showFacets ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8">
              <FacetedNavigation
                facets={facets}
                onFacetChange={handleFacetChange}
                onClearFacet={handleClearFacet}
                onClearAll={handleClearAllFacets}
                onApplyFilters={handleApplyFilters}
                loading={loading}
                totalResults={searchResponse?.total || 0}
                syncWithUrl={true}
              />
            </div>
          </div>

          {/* Main Content - Search and Results */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Search Interface */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <AdvancedSearchInterface
                  onSearchResults={handleSearchResults}
                  onSearchError={handleSearchError}
                  onSearchStart={() => setLoading(true)}
                  initialQuery={initialQuery}
                />
              </div>

              {/* Search Results */}
              <SearchResultsDisplay
                searchResponse={searchResponse}
                loading={loading}
                error={error}
                onPageChange={handlePageChange}
                onSortChange={handleSortChange}
                onResultClick={handleResultClick}
                currentSort={currentSort}
              />


            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Search Help</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Use quotation marks for exact phrases</li>
                <li>Add + before words that must be included</li>
                <li>Use - to exclude specific terms</li>
                <li>Try different keyword combinations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Popular Searches</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/search?q=TVET" className="hover:text-blue-600">Technical Education</a></li>
                <li><a href="/search?q=healthcare" className="hover:text-blue-600">Healthcare Systems</a></li>
                <li><a href="/search?q=agriculture" className="hover:text-blue-600">Agricultural Innovation</a></li>
                <li><a href="/search?q=technology" className="hover:text-blue-600">Technology Integration</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Research Areas</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Education & Pedagogy</li>
                <li>Health & Medicine</li>
                <li>Technology & Innovation</li>
                <li>Social Sciences</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;