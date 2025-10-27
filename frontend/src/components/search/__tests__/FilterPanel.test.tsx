import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterPanel from '../FilterPanel';

// Mock data
const mockFilters = [
  {
    key: 'types',
    label: 'Article Types',
    type: 'checkbox' as const,
    multiSelect: true,
    values: [
      { value: 'research_article', label: 'Research Article', count: 1250, selected: false },
      { value: 'review_article', label: 'Review Article', count: 340, selected: false },
      { value: 'case_study', label: 'Case Study', count: 180, selected: true }
    ]
  },
  {
    key: 'years',
    label: 'Publication Year',
    type: 'checkbox' as const,
    multiSelect: true,
    values: [
      { value: 2024, label: '2024', count: 245, selected: false },
      { value: 2023, label: '2023', count: 567, selected: true }
    ]
  }
];

const mockActiveFilters = [
  {
    groupKey: 'types',
    groupLabel: 'Article Types',
    value: 'case_study',
    label: 'Case Study'
  },
  {
    groupKey: 'years',
    groupLabel: 'Publication Year',
    value: 2023,
    label: '2023'
  }
];

describe('FilterPanel', () => {
  const mockProps = {
    filters: mockFilters,
    activeFilters: mockActiveFilters,
    onFilterChange: jest.fn(),
    onClearGroup: jest.fn(),
    onClearAll: jest.fn(),
    onApplyFilters: jest.fn(),
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders filter groups correctly', () => {
    render(<FilterPanel {...mockProps} />);
    
    expect(screen.getByText('Article Types')).toBeInTheDocument();
    expect(screen.getByText('Publication Year')).toBeInTheDocument();
    expect(screen.getByText('Research Article')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('displays active filter count', () => {
    render(<FilterPanel {...mockProps} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // Active filter count
  });

  it('shows active filters summary', () => {
    render(<FilterPanel {...mockProps} />);
    
    expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    expect(screen.getByText('Article Types: Case Study')).toBeInTheDocument();
    expect(screen.getByText('Publication Year: 2023')).toBeInTheDocument();
  });

  it('handles filter selection', () => {
    render(<FilterPanel {...mockProps} />);
    
    const checkbox = screen.getByLabelText(/Research Article/);
    fireEvent.click(checkbox);
    
    expect(mockProps.onFilterChange).toHaveBeenCalledWith(
      'types',
      'research_article',
      true
    );
  });

  it('handles group clearing', () => {
    render(<FilterPanel {...mockProps} />);
    
    // Find and click the clear button for Article Types group
    const clearButtons = screen.getAllByTitle('Clear filters');
    fireEvent.click(clearButtons[0]);
    
    expect(mockProps.onClearGroup).toHaveBeenCalledWith('types');
  });

  it('handles clear all filters', () => {
    render(<FilterPanel {...mockProps} />);
    
    const clearAllButton = screen.getByText('Clear all');
    fireEvent.click(clearAllButton);
    
    expect(mockProps.onClearAll).toHaveBeenCalled();
  });

  it('handles apply filters', () => {
    render(<FilterPanel {...mockProps} />);
    
    // First make a change to show the Apply button
    const checkbox = screen.getByLabelText(/Research Article/);
    fireEvent.click(checkbox);
    
    // Wait for the Apply button to appear
    waitFor(() => {
      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);
      expect(mockProps.onApplyFilters).toHaveBeenCalled();
    });
  });

  it('shows loading state', () => {
    render(<FilterPanel {...mockProps} loading={true} />);
    
    expect(screen.getByText('Updating filters...')).toBeInTheDocument();
  });

  it('shows empty state when no filters', () => {
    render(<FilterPanel {...mockProps} filters={[]} />);
    
    expect(screen.getByText('No filters available')).toBeInTheDocument();
  });

  it('handles group collapse/expand', () => {
    render(<FilterPanel {...mockProps} />);
    
    const groupHeader = screen.getByText('Article Types').closest('button');
    fireEvent.click(groupHeader!);
    
    // After collapse, the filter values should not be visible
    expect(screen.queryByText('Research Article')).not.toBeInTheDocument();
  });

  it('shows search input for large filter groups', () => {
    const largeFilterGroup = {
      ...mockFilters[0],
      values: Array.from({ length: 15 }, (_, i) => ({
        value: `type_${i}`,
        label: `Type ${i}`,
        count: 100 - i,
        selected: false
      }))
    };

    render(<FilterPanel {...mockProps} filters={[largeFilterGroup]} />);
    
    expect(screen.getByPlaceholderText('Search article types...')).toBeInTheDocument();
  });
});