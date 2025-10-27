# Search Components

This directory contains the comprehensive search system components for the Africa Journal Platform.

## Components

### 1. AdvancedSearchInterface
The main search interface with advanced filtering capabilities.

**Features:**
- Multi-field search (title, authors, keywords, date range)
- Real-time search suggestions and autocomplete
- Advanced filters panel with collapsible sections
- Active filter display with easy removal
- Responsive design for mobile and desktop

**Usage:**
```tsx
<AdvancedSearchInterface
  onSearchResults={(results) => setSearchResults(results)}
  onSearchError={(error) => setError(error)}
  onSearchStart={() => setLoading(true)}
  initialQuery="education"
/>
```

### 2. SearchResultsDisplay
Displays paginated search results with rich article preview cards.

**Features:**
- Paginated search results with article preview cards
- Search term highlighting in titles and abstracts
- Sorting options (relevance, date, title, citations, views)
- Loading states and error handling
- Article metrics display (views, downloads, citations)
- Bookmark and share functionality
- Expandable abstracts
- Keyword highlighting
- Citation export options

**Usage:**
```tsx
<SearchResultsDisplay
  searchResponse={searchResponse}
  loading={loading}
  error={error}
  onPageChange={(page) => handlePageChange(page)}
  onSortChange={(sortBy, sortOrder) => handleSortChange(sortBy, sortOrder)}
  onResultClick={(result) => router.push(`/articles/${result.id}`)}
  currentSort={{ sortBy: 'relevance', sortOrder: 'desc' }}
/>
```

### 3. SearchFacets
Collapsible sidebar with dynamic facet categories for filtering.

**Features:**
- Dynamic facet generation based on search results
- Interactive facet filters with count displays
- Facet selection state management
- Clear filters and reset functionality
- Collapsible facet groups

**Usage:**
```tsx
<SearchFacets
  facets={facets}
  onFacetChange={(facetKey, value, selected) => handleFacetChange(facetKey, value, selected)}
  onClearFacet={(facetKey) => handleClearFacet(facetKey)}
  onClearAll={() => handleClearAllFacets()}
/>
```

## Types

### SearchResult
```typescript
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
```

### SearchResponse
```typescript
interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
  query: string;
}
```

## Features

### Search Term Highlighting
The SearchResultsDisplay component automatically highlights search terms in:
- Article titles
- Article abstracts
- Keywords

### Responsive Design
All components are fully responsive and work on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management

### Performance
- Debounced search (300ms delay)
- Efficient pagination
- Lazy loading for large result sets
- Optimized re-renders with React.memo

### Loading States
- Skeleton loading for search results
- Loading spinners for actions
- Progressive loading for large datasets

### Error Handling
- Network error handling
- Search timeout handling
- Graceful degradation
- User-friendly error messages

## Integration

### With Search API
The components integrate with the search API endpoints:
- `GET /api/search/articles` - Main search
- `GET /api/search/autocomplete` - Suggestions
- `GET /api/search/facets` - Dynamic facets

### With URL State
Search state is synchronized with URL parameters:
- `q` - Search query
- `page` - Current page
- `sort` - Sort option
- `order` - Sort order

### With Analytics
Search interactions are tracked for:
- Search queries
- Result clicks
- Filter usage
- Performance metrics

## Customization

### Styling
Components use Tailwind CSS classes and can be customized via:
- CSS custom properties
- Tailwind configuration
- Component props

### Behavior
Customize behavior through props:
- Custom sort options
- Custom result actions
- Custom facet types
- Custom loading states

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern=search
```

### Integration Tests
```bash
npm run test:integration -- search
```

### E2E Tests
```bash
npm run test:e2e -- search
```

## Performance Considerations

### Optimization Tips
1. Use pagination to limit result sets
2. Implement result caching for popular queries
3. Debounce search input to reduce API calls
4. Use virtual scrolling for very large result sets
5. Optimize images and assets

### Monitoring
- Track search response times
- Monitor error rates
- Analyze user search patterns
- Performance metrics collection

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 18+
- Next.js 14+
- Tailwind CSS 3+
- Lucide React (icons)
- Lodash (utilities)

## Contributing

When adding new search features:
1. Follow the existing component patterns
2. Add proper TypeScript types
3. Include comprehensive tests
4. Update documentation
5. Consider accessibility
6. Test on multiple devices