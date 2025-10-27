'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

interface FacetValue {
  value: string | number;
  label: string;
  count: number;
  selected?: boolean;
}

interface FacetGroup {
  key: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'date';
  values: FacetValue[];
  multiSelect?: boolean;
  collapsed?: boolean;
}

interface SearchFacetsProps {
  facets: FacetGroup[];
  onFacetChange?: (facetKey: string, value: string | number, selected: boolean) => void;
  onClearFacet?: (facetKey: string) => void;
  onClearAll?: () => void;
  className?: string;
}

const SearchFacets: React.FC<SearchFacetsProps> = ({
  facets,
  onFacetChange,
  onClearFacet,
  onClearAll,
  className = ''
}) => {
  const [collapsedFacets, setCollapsedFacets] = useState<Set<string>>(new Set());

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

  const getSelectedCount = (facet: FacetGroup) => {
    return facet.values.filter(value => value.selected).length;
  };

  const getTotalSelectedCount = () => {
    return facets.reduce((total, facet) => total + getSelectedCount(facet), 0);
  };

  if (!facets.length) {
    return null;
  }

  return (
    <div className={`search-facets ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {getTotalSelectedCount() > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {getTotalSelectedCount()}
            </span>
          )}
        </div>
        
        {getTotalSelectedCount() > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      {/* Facet Groups */}
      <div className="space-y-4">
        {facets.map((facet) => {
          const isCollapsed = collapsedFacets.has(facet.key);
          const selectedCount = getSelectedCount(facet);
          const hasValues = facet.values.length > 0;

          if (!hasValues) return null;

          return (
            <div key={facet.key} className="border border-gray-200 rounded-lg">
              {/* Facet Header */}
              <button
                onClick={() => toggleFacetCollapse(facet.key)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{facet.label}</span>
                  {selectedCount > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {selectedCount}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearFacet?.(facet.key);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Facet Values */}
              {!isCollapsed && (
                <div className="px-3 pb-3">
                  <div className="max-h-64 overflow-y-auto">
                    {facet.type === 'checkbox' && (
                      <div className="space-y-2">
                        {facet.values.map((value, index) => (
                          <label
                            key={index}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={value.selected || false}
                                onChange={(e) => onFacetChange?.(facet.key, value.value, e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 truncate">
                                {value.label}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">
                              {value.count.toLocaleString()}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {facet.type === 'radio' && (
                      <div className="space-y-2">
                        {facet.values.map((value, index) => (
                          <label
                            key={index}
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={facet.key}
                                checked={value.selected || false}
                                onChange={(e) => onFacetChange?.(facet.key, value.value, e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 truncate">
                                {value.label}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">
                              {value.count.toLocaleString()}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {facet.type === 'range' && (
                      <div className="space-y-3">
                        {facet.values.map((value, index) => (
                          <button
                            key={index}
                            onClick={() => onFacetChange?.(facet.key, value.value, !value.selected)}
                            className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors duration-200 ${
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
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Show More/Less for long lists */}
                  {facet.values.length > 10 && (
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Show more ({facet.values.length - 10} more)
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Filters */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Filters</h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200">
            Recent Articles (Last 30 days)
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200">
            Most Cited
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200">
            Open Access Only
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200">
            Peer Reviewed
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFacets;