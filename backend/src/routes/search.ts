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
        filters.dateRange = {
          start: dateFrom as string || '',
          end: dateTo as string || ''
        };
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
        baseFilters.dateRange = {
          start: dateFrom as string || '',
          end: dateTo as string || ''
        };
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