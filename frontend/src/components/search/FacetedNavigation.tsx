'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X, 
  Calendar,
  BookOpen,
  User,
  Tag,
  Globe,
  FileText,
  TrendingUp,
  Clock,
  Search,
  RotateCcw
} from 'lucide-react';

// Types
interface FacetValue {
  value: string | number;
  label: string;
  count: number;
  selected?: boolean;
}

interface FacetGroup {
  key: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'date' | 'slider';
  values: FacetValue[];
  multiSelect?: boolean;
  collapsed?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface FacetedNavigationProps {
  facets: FacetGroup[];
  onFacetChange?: (facetKey: string, value: string | number, selected: boolean) => void;
  onClearFacet?: (facetKey: string) => void;
  onClearAll?: () => void;
  onApplyFilters?: () => void;
  loading?: boolean;
  totalResults?: number;
  className?: string;
  syncWithUrl?: boolean;
}

const FacetedNavigation: React.FC<FacetedNavigationProps> = ({
  facets,
  onFacetChange,
  onClearFacet,
  onClearAll,
  onApplyFilters,
  loading = false,
  totalResults = 0,
  className = '',
  syncWithUrl = true
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [collapsedFacets, setCollapsedFacets] = useState<Set<string>>(new Set());
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [pendingChanges, setPendingChanges] = useState(false);

  // Facet icons mapping
  const facetIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'types': FileText,
    'years': Calendar,
    'volumes': BookOpen,
    'issues': BookOpen,
    'authors': User,
    'keywords': Tag,
    'languages': Globe,
    'subjects': TrendingUp,
    'institutions': BookOpen
  };

  // Initialize collapsed state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('faceted-navigation-collapsed');
      if (saved) {
        try {
          setCollapsedFacets(new Set(JSON.parse(saved)));
        } catch (e) {
          console.warn('Failed to parse saved collapsed facets');
        }
      }
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('faceted-navigation-collapsed', JSON.stringify([...collapsedFacets]));
    }
  }, [collapsedFacets]);

  // Sync with URL parameters
  useEffect(() => {
    if (syncWithUrl && searchParams) {
      // Update facet selections based on URL parameters
      facets.forEach(facet => {
        const urlValue = searchParams.get(facet.key);
        if (urlValue) {
          const values = urlValue.split(',');
          values.forEach(value => {
            const numValue = isNaN(Number(value)) ? value : Number(value);
            onFacetChange?.(facet.key, numValue, true);
          });
        }
      });
    }
  }, [searchParams, syncWithUrl, facets, onFacetChange]);

  const toggleFacetCollapse = (facetKey: string) => {
    setCollapsedFacets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(facetKey)) {
        newSet.delete(facetKey);
      } else {
        newSet.add(facetKey);
      }
      return newSet;
    });
  };

  const handleFacetChange = (facetKey: string, value: string | number, selected: boolean) => {
    onFacetChange?.(facetKey, value, selected);
    setPendingChanges(true);
    
    // Update URL if sync is enabled
    if (syncWithUrl) {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = params.get(facetKey)?.split(',').filter(Boolean) || [];
      
      if (selected) {
        if (!currentValues.includes(value.toString())) {
          currentValues.push(value.toString());
        }
      } else {
        const index = currentValues.indexOf(value.toString());
        if (index > -1) {
          currentValues.splice(index, 1);
        }
      }
      
      if (currentValues.length > 0) {
        params.set(facetKey, currentValues.join(','));
      } else {
        params.delete(facetKey);
      }
      
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  const handleClearFacet = (facetKey: string) => {
    onClearFacet?.(facetKey);
    setPendingChanges(true);
    
    if (syncWithUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(facetKey);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  const handleClearAll = () => {
    onClearAll?.();
    setPendingChanges(true);
    setSearchTerms({});
    
    if (syncWithUrl) {
      const params = new URLSearchParams(searchParams.toString());
      facets.forEach(facet => params.delete(facet.key));
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters?.();
    setPendingChanges(false);
  };

  const getSelectedCount = (facet: FacetGroup) => {
    return facet.values.filter(value => value.selected).length;
  };

  const getTotalSelectedCount = () => {
    return facets.reduce((total, facet) => total + getSelectedCount(facet), 0);
  };

  const getFilteredFacetValues = (facet: FacetGroup) => {
    const searchTerm = searchTerms[facet.key]?.toLowerCase() || '';
    if (!searchTerm) return facet.values;
    
    return facet.values.filter(value => 
      value.label.toLowerCase().includes(searchTerm)
    );
  };

  const renderFacetValue = (facet: FacetGroup, value: FacetValue, index: number) => {
    const inputId = `${facet.key}-${index}`;
    
    if (facet.type === 'checkbox') {
      return (
        <label
          key={index}
          htmlFor={inputId}
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors group"
        >
          <div className="flex items-center min-w-0 flex-1">
            <input
              id={inputId}
              type="checkbox"
              checked={value.selected || false}
              onChange={(e) => handleFacetChange(facet.key, value.value, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700 truncate group-hover:text-gray-900">
              {value.label}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {value.count.toLocaleString()}
          </span>
        </label>
      );
    }
    
    if (facet.type === 'radio') {
      return (
        <label
          key={index}
          htmlFor={inputId}
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors group"
        >
          <div className="flex items-center min-w-0 flex-1">
            <input
              id={inputId}
              type="radio"
              name={facet.key}
              checked={value.selected || false}
              onChange={(e) => handleFacetChange(facet.key, value.value, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700 truncate group-hover:text-gray-900">
              {value.label}
            </span>
          </div>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {value.count.toLocaleString()}
          </span>
        </label>
      );
    }
    
    if (facet.type === 'range') {
      return (
        <button
          key={index}
          onClick={() => handleFacetChange(facet.key, value.value, !value.selected)}
          className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors ${
            value.selected
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <span className="text-sm font-medium">
            {value.label}
          </span>
          <span className="text-xs">
            {value.count.toLocaleString()}
          </span>
        </button>
      );
    }
    
    return null;
  };

  const renderFacetGroup = (facet: FacetGroup) => {
    const isCollapsed = collapsedFacets.has(facet.key);
    const selectedCount = getSelectedCount(facet);
    const filteredValues = getFilteredFacetValues(facet);
    const hasValues = filteredValues.length > 0;
    const Icon = facet.icon || facetIcons[facet.key] || Filter;

    if (!hasValues && selectedCount === 0) return null;

    return (
      <div key={facet.key} className="border border-gray-200 rounded-lg bg-white shadow-sm">
        {/* Facet Header */}
        <button
          onClick={() => toggleFacetCollapse(facet.key)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200 rounded-t-lg"
          aria-expanded={!isCollapsed}
          aria-controls={`facet-${facet.key}`}
        >
          <div className="flex items-center min-w-0 flex-1">
            <Icon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
            <span className="font-medium text-gray-900 truncate">{facet.label}</span>
            {selectedCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                {selectedCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            {selectedCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFacet(facet.key);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                title={`Clear ${facet.label} filters`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {/* Facet Content */}
        {!isCollapsed && (
          <div id={`facet-${facet.key}`} className="px-4 pb-4">
            {facet.description && (
              <p className="text-xs text-gray-500 mb-3">{facet.description}</p>
            )}
            
            {/* Search within facet */}
            {facet.values.length > 10 && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${facet.label.toLowerCase()}...`}
                  value={searchTerms[facet.key] || ''}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, [facet.key]: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {/* Facet Values */}
            <div className="max-h-64 overflow-y-auto">
              {filteredValues.length > 0 ? (
                <div className="space-y-1">
                  {filteredValues.map((value, index) => renderFacetValue(facet, value, index))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">
                  No matching {facet.label.toLowerCase()} found
                </div>
              )}
            </div>

            {/* Show More/Less for long lists */}
            {facet.values.length > 10 && !searchTerms[facet.key] && (
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                Show {filteredValues.length < facet.values.length ? 'more' : 'all'} ({facet.values.length - filteredValues.length} more)
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!facets.length) {
    return (
      <div className={`faceted-navigation-empty ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Filter className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No filters available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`faceted-navigation ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {getTotalSelectedCount() > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {getTotalSelectedCount()}
              </span>
            )}
          </div>
          
          {getTotalSelectedCount() > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              title="Clear all filters"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear all
            </button>
          )}
        </div>
        
        {/* Results count */}
        {totalResults > 0 && (
          <div className="text-sm text-gray-600">
            {totalResults.toLocaleString()} articles match your filters
          </div>
        )}
        
        {/* Apply filters button (if there are pending changes) */}
        {pendingChanges && (
          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        )}
      </div>

      {/* Facet Groups */}
      <div className="space-y-4">
        {facets.map(renderFacetGroup)}
      </div>

      {/* Quick Filters */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Quick Filters
        </h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors">
            <Clock className="w-4 h-4 inline mr-2" />
            Recent Articles (Last 30 days)
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors">
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Most Cited
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors">
            <BookOpen className="w-4 h-4 inline mr-2" />
            Open Access Only
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors">
            <User className="w-4 h-4 inline mr-2" />
            Peer Reviewed
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Updating filters...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacetedNavigation;