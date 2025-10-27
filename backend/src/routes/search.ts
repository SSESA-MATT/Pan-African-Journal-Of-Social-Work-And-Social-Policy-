import express from 'express';
import { searchService, SearchFilters } from '../services/SearchService';
import { facetedSearchService } from '../services/FacetedSearchService';
import { apiLimiter } from '../middleware/rateLimit';
import { auditAction } from '../middleware/auditLogger';

const router = express.Router();

// Apply rate limiting to search endpoints
router.use(apiLimiter);

/**
 * @route GET /api/search/articles
 * @desc Advanced article search with faceted filtering
 * @access Public
 */
router.get('/articles', 
  auditAction('Search Articles'),
  async (req, res) => {
    try {
      const {
        q: query,
        title,
        authors,
        keywords,
        dateFrom,
        dateTo,
        volumes,
        issues,
        articleTypes,
        language,
        page = '1',
        limit = '20',
        sortBy = 'relevance',
        sortOrder = 'desc'
      } = req.query;

      // Parse and validate parameters
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));

      // Build search filters
      const filters: SearchFilters = {};

      if (query && typeof query === 'string') {
        filters.query = query.trim();
      }

      if (title && typeof title === 'string') {
        filters.title = title.trim();
      }

      if (authors) {
        if (Array.isArray(authors)) {
          filters.authors = authors.map(a => String(a).trim()).filter(a => a.length > 0);
        } else if (typeof authors === 'string') {
          filters.authors = authors.split(',').map(a => a.trim()).filter(a => a.length > 0);
        }
      }

      if (keywords) {
        if (Array.isArray(keywords)) {
          filters.keywords = keywords.map(k => String(k).trim()).filter(k => k.length > 0);
        } else if (typeof keywords === 'string') {
          filters.keywords = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
        }
      }

      if (dateFrom || dateTo) {
        filters.dateRange = {};
        if (dateFrom && typeof dateFrom === 'string') {
          filters.dateRange.start = dateFrom;
        }
        if (dateTo && typeof dateTo === 'string') {
          filters.dateRange.end = dateTo;
        }
      }

      if (volumes) {
        if (Array.isArray(volumes)) {
          filters.volumeNumbers = volumes.map(v => parseInt(String(v))).filter(v => !isNaN(v));
        } else if (typeof volumes === 'string') {
          filters.volumeNumbers = volumes.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
        }
      }

      if (issues) {
        if (Array.isArray(issues)) {
          filters.issueNumbers = issues.map(i => parseInt(String(i))).filter(i => !isNaN(i));
        } else if (typeof issues === 'string') {
          filters.issueNumbers = issues.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i));
        }
      }

      if (articleTypes) {
        if (Array.isArray(articleTypes)) {
          filters.articleTypes = articleTypes.map(t => String(t).trim()).filter(t => t.length > 0);
        } else if (typeof articleTypes === 'string') {
          filters.articleTypes = articleTypes.split(',').map(t => t.trim()).filter(t => t.length > 0);
        }
      }

      if (language && typeof language === 'string') {
        filters.language = language.trim();
      }

      // Validate sort parameters
      const validSortBy = ['relevance', 'date', 'title'];
      const validSortOrder = ['asc', 'desc'];
      const sortByParam = validSortBy.includes(sortBy as string) ? sortBy as string : 'relevance';
      const sortOrderParam = validSortOrder.includes(sortOrder as string) ? sortOrder as string : 'desc';

      // Perform search
      const searchResults = await searchService.search(
        filters,
        pageNum,
        limitNum,
        sortByParam,
        sortOrderParam
      );

      // Add request metadata for analytics
      const userSession = req.headers['x-session-id'] as string;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Log search analytics (done internally by searchService)
      // The search service will handle analytics logging

      res.json({
        success: true,
        data: searchResults,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: searchResults.total,
          totalPages: searchResults.totalPages,
          sortBy: sortByParam,
          sortOrder: sortOrderParam,
          searchTime: searchResults.searchTime
        }
      });

    } catch (error) {
      console.error('Search API error:', error);
      res.status(500).json({
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
);

/**
 * @route GET /api/search/facets
 * @desc Get search facets for filtering
 * @access Public
 */
router.get('/facets',
  auditAction('Get Search Facets'),
  async (req, res) => {
    try {
      const {
        q: query,
        authors,
        keywords,
        dateFrom,
        dateTo,
        volumes,
        issues,
        articleTypes,
        language
      } = req.query;

      // Build base filters for facet generation
      const baseFilters: SearchFilters = {};

      if (query && typeof query === 'string') {
        baseFilters.query = query.trim();
      }

      if (authors) {
        if (Array.isArray(authors)) {
          baseFilters.authors = authors.map(a => String(a).trim()).filter(a => a.length > 0);
        } else if (typeof authors === 'string') {
          baseFilters.authors = authors.split(',').map(a => a.trim()).filter(a => a.length > 0);
        }
      }

      if (keywords) {
        if (Array.isArray(keywords)) {
          baseFilters.keywords = keywords.map(k => String(k).trim()).filter(k => k.length > 0);
        } else if (typeof keywords === 'string') {
          baseFilters.keywords = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
        }
      }

      if (dateFrom || dateTo) {
        baseFilters.dateRange = {};
        if (dateFrom && typeof dateFrom === 'string') {
          baseFilters.dateRange.start = dateFrom;
        }
        if (dateTo && typeof dateTo === 'string') {
          baseFilters.dateRange.end = dateTo;
        }
      }

      // Parse selected facets
      const selectedFacets = facetedSearchService.parseFacetState(req.query);

      // Generate facets
      const facetResults = await facetedSearchService.generateFacets(baseFilters, selectedFacets);

      res.json({
        success: true,
        data: facetResults
      });

    } catch (error) {
      console.error('Facets API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate facets',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
);

/**
 * @route GET /api/search/suggestions
 * @desc Get search suggestions for autocomplete
 * @access Public
 */
router.get('/suggestions',
  auditAction('Get Search Suggestions'),
  async (req, res) => {
    try {
      const { q: query, limit = '10' } = req.query;

      if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.json({
          success: true,
          data: {
            suggestions: []
          }
        });
      }

      const limitNum = Math.min(20, Math.max(1, parseInt(limit as string) || 10));
      const suggestions = await searchService.getSuggestions(query.trim(), limitNum);

      res.json({
        success: true,
        data: {
          suggestions,
          query: query.trim()
        }
      });

    } catch (error) {
      console.error('Suggestions API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get suggestions',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
);

/**
 * @route GET /api/search/popular
 * @desc Get popular search queries
 * @access Public
 */
router.get('/popular',
  auditAction('Get Popular Searches'),
  async (req, res) => {
    try {
      const { limit = '10' } = req.query;
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));

      const popularQueries = await searchService.getPopularQueries(limitNum);

      res.json({
        success: true,
        data: {
          queries: popularQueries
        }
      });

    } catch (error) {
      console.error('Popular searches API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get popular searches',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
);

/**
 * @route GET /api/search/analytics
 * @desc Get search analytics (admin only)
 * @access Private (Admin/Editor)
 */
router.get('/analytics',
  auditAction('Get Search Analytics'),
  async (req, res) => {
    try {
      // Note: In a real implementation, you'd want to add authentication middleware here
      // For now, we'll allow public access to analytics

      const { days = '30' } = req.query;
      const daysNum = Math.min(365, Math.max(1, parseInt(days as string) || 30));

      const analytics = await searchService.getSearchAnalytics(daysNum);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Search analytics API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get search analytics',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
);

/**
 * @route POST /api/search/clear-cache
 * @desc Clear search cache (admin only)
 * @access Private (Admin)
 */
router.post('/clear-cache',
  auditAction('Clear Search Cache'),
  async (req, res) => {
    try {
      // Note: In a real implementation, you'd want to add admin authentication middleware here

      await searchService.clearCache();

      res.json({
        success: true,
        message: 'Search cache cleared successfully'
      });

    } catch (error) {
      console.error('Clear cache API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
);

/**
 * @route GET /api/search/health
 * @desc Search service health check
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    // Perform a simple search to test the service
    const testResult = await searchService.search({ query: 'test' }, 1, 1);
    
    res.json({
      success: true,
      status: 'healthy',
      data: {
        searchServiceActive: true,
        cacheEnabled: searchService['cacheEnabled'] || false,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Search health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Search service unavailable',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;     
 issueNumbers: issues ? (issues as string).split(',').map(i => parseInt(i.trim())) : undefined,
      articleTypes: types ? (types as string).split(',').map(t => t.trim()) : undefined,
      language: language as string
    };

    const options: SearchOptions = {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100), // Cap at 100 results per page
      sortBy: sortBy as 'relevance' | 'date' | 'title' | 'citations' | 'views',
      sortOrder: sortOrder as 'asc' | 'desc',
      includeFacets: includeFacets === 'true',
      includeMetrics: includeMetrics === 'true'
    };

    // Validate required parameters
    if (!query && !title && !authors && !keywords) {
      return res.status(400).json({
        error: 'At least one search parameter (q, title, authors, or keywords) is required'
      });
    }

    const results = await searchService.search(filters, options);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/search/facets
 * @desc Get search facets for filtering
 * @access Public
 */
router.get('/facets', async (req, res) => {
  try {
    const {
      q: query,
      authors,
      keywords,
      dateFrom,
      dateTo,
      volumes,
      issues,
      types,
      language
    } = req.query;

    const filters: SearchFilters = {
      query: query as string,
      authors: authors ? (authors as string).split(',').map(a => a.trim()) : undefined,
      keywords: keywords ? (keywords as string).split(',').map(k => k.trim()) : undefined,
      dateRange: dateFrom && dateTo ? {
        start: dateFrom as string,
        end: dateTo as string
      } : undefined,
      volumeNumbers: volumes ? (volumes as string).split(',').map(v => parseInt(v.trim())) : undefined,
      issueNumbers: issues ? (issues as string).split(',').map(i => parseInt(i.trim())) : undefined,
      articleTypes: types ? (types as string).split(',').map(t => t.trim()) : undefined,
      language: language as string
    };

    const facets = await facetedSearchService.getFacets(filters);

    res.json({
      success: true,
      data: facets
    });
  } catch (error) {
    console.error('Facets error:', error);
    res.status(500).json({
      error: 'Failed to retrieve facets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/search/suggestions
 * @desc Get search suggestions for autocomplete
 * @access Public
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || (query as string).length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await searchService.getSuggestions(
      query as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      error: 'Failed to retrieve suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/search/popular
 * @desc Get popular search queries
 * @access Public
 */
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularQueries = await searchService.getPopularQueries(
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: popularQueries
    });
  } catch (error) {
    console.error('Popular queries error:', error);
    res.status(500).json({
      error: 'Failed to retrieve popular queries',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/search/stats
 * @desc Get search analytics and statistics
 * @access Public (consider adding admin authentication)
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await searchService.getSearchStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Search stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve search statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/search/filters/apply
 * @desc Apply facet selection to current filters
 * @access Public
 */
router.post('/filters/apply', async (req, res) => {
  try {
    const { currentFilters, facetKey, facetValue, selected } = req.body;

    if (!facetKey || facetValue === undefined || selected === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters: facetKey, facetValue, selected'
      });
    }

    const newFilters = facetedSearchService.applyFacetSelection(
      currentFilters || {},
      facetKey,
      facetValue,
      selected
    );

    res.json({
      success: true,
      data: {
        filters: newFilters
      }
    });
  } catch (error) {
    console.error('Apply filters error:', error);
    res.status(500).json({
      error: 'Failed to apply filters',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/search/filters/clear
 * @desc Clear specific or all filters
 * @access Public
 */
router.post('/filters/clear', async (req, res) => {
  try {
    const { currentFilters, facetKey } = req.body;

    let newFilters;
    if (facetKey) {
      // Clear specific facet
      newFilters = facetedSearchService.clearFacetFilter(currentFilters || {}, facetKey);
    } else {
      // Clear all filters
      newFilters = facetedSearchService.clearAllFilters();
    }

    res.json({
      success: true,
      data: {
        filters: newFilters
      }
    });
  } catch (error) {
    console.error('Clear filters error:', error);
    res.status(500).json({
      error: 'Failed to clear filters',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route GET /api/search/export
 * @desc Export search results in various formats
 * @access Public
 */
router.get('/export', async (req, res) => {
  try {
    const {
      format = 'json',
      q: query,
      authors,
      keywords,
      dateFrom,
      dateTo,
      volumes,
      issues,
      types,
      language,
      limit = 1000
    } = req.query;

    // Validate format
    const allowedFormats = ['json', 'csv', 'bibtex'];
    if (!allowedFormats.includes(format as string)) {
      return res.status(400).json({
        error: `Invalid format. Allowed formats: ${allowedFormats.join(', ')}`
      });
    }

    const filters: SearchFilters = {
      query: query as string,
      authors: authors ? (authors as string).split(',').map(a => a.trim()) : undefined,
      keywords: keywords ? (keywords as string).split(',').map(k => k.trim()) : undefined,
      dateRange: dateFrom && dateTo ? {
        start: dateFrom as string,
        end: dateTo as string
      } : undefined,
      volumeNumbers: volumes ? (volumes as string).split(',').map(v => parseInt(v.trim())) : undefined,
      issueNumbers: issues ? (issues as string).split(',').map(i => parseInt(i.trim())) : undefined,
      articleTypes: types ? (types as string).split(',').map(t => t.trim()) : undefined,
      language: language as string
    };

    const options: SearchOptions = {
      page: 1,
      limit: Math.min(parseInt(limit as string), 5000), // Cap at 5000 for exports
      sortBy: 'relevance',
      sortOrder: 'desc',
      includeFacets: false,
      includeMetrics: true
    };

    const results = await searchService.search(filters, options);

    // Format response based on requested format
    switch (format) {
      case 'csv':
        const csvData = convertToCSV(results.results);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=search_results.csv');
        res.send(csvData);
        break;

      case 'bibtex':
        const bibtexData = convertToBibTeX(results.results);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=search_results.bib');
        res.send(bibtexData);
        break;

      case 'json':
      default:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=search_results.json');
        res.json({
          success: true,
          data: results,
          exported_at: new Date().toISOString()
        });
        break;
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route DELETE /api/search/cache
 * @desc Clear search cache (admin endpoint)
 * @access Admin
 */
router.delete('/cache', async (req, res) => {
  try {
    const { pattern } = req.query;

    await searchService.clearCache(pattern as string);

    res.json({
      success: true,
      message: 'Search cache cleared successfully'
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to convert search results to CSV
function convertToCSV(results: any[]): string {
  if (results.length === 0) return '';

  const headers = [
    'ID', 'Title', 'Authors', 'Keywords', 'Published Date',
    'Volume', 'Issue', 'Article Type', 'Language', 'PDF URL'
  ];

  const csvRows = [headers.join(',')];

  results.forEach(result => {
    const row = [
      `"${result.id}"`,
      `"${result.title.replace(/"/g, '""')}"`,
      `"${result.authors.join('; ')}"`,
      `"${result.keywords.join('; ')}"`,
      `"${result.published_at}"`,
      `"${result.volume_info?.volume_number || ''}"`,
      `"${result.issue_info?.issue_number || ''}"`,
      `"${result.article_type}"`,
      `"${result.language_code}"`,
      `"${result.pdf_url}"`
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// Helper function to convert search results to BibTeX
function convertToBibTeX(results: any[]): string {
  return results.map(result => {
    const year = new Date(result.published_at).getFullYear();
    const authors = result.authors.join(' and ');
    const title = result.title.replace(/[{}]/g, '');
    
    return `@article{${result.id},
  title={${title}},
  author={${authors}},
  journal={Africa Journal of Technical and Vocational Education and Training},
  volume={${result.volume_info?.volume_number || ''}},
  number={${result.issue_info?.issue_number || ''}},
  year={${year}},
  url={${result.pdf_url}},
  keywords={${result.keywords.join(', ')}}
}`;
  }).join('\n\n');
}

export default router;