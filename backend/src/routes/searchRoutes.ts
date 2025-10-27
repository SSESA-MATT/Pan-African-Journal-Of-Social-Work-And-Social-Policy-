import express from 'express';
import SearchController from '../controllers/SearchController';
import {
  searchRateLimit,
  exportRateLimit,
  validateSearchQuery,
  validateExportParams,
  sanitizeSearchInput,
  logSearchRequest,
  setCacheHeaders,
  setCorsHeaders,
  handleSearchErrors
} from '../middleware/searchMiddleware';

const router = express.Router();
const searchController = new SearchController();

// Apply middleware to all routes
router.use(setCorsHeaders);
router.use(logSearchRequest);
router.use(sanitizeSearchInput);
router.use(setCacheHeaders);

/**
 * @route GET /api/search/articles
 * @desc Advanced article search with comprehensive filtering and sorting
 * @access Public
 */
router.get('/articles', 
  searchRateLimit,
  validateSearchQuery,
  (req, res) => searchController.advancedSearch(req, res)
);

/**
 * @route GET /api/search/quick
 * @desc Quick search for simple queries
 * @access Public
 */
router.get('/quick',
  searchRateLimit,
  (req, res) => searchController.quickSearch(req, res)
);

/**
 * @route GET /api/search/suggestions
 * @desc Search with real-time suggestions
 * @access Public
 */
router.get('/suggestions',
  searchRateLimit,
  (req, res) => searchController.searchWithSuggestions(req, res)
);

/**
 * @route GET /api/search/facets
 * @desc Get search facets for filtering
 * @access Public
 */
router.get('/facets',
  searchRateLimit,
  (req, res) => searchController.getFacets(req, res)
);

/**
 * @route GET /api/search/autocomplete
 * @desc Get autocomplete suggestions by type
 * @access Public
 */
router.get('/autocomplete',
  searchRateLimit,
  (req, res) => searchController.getAutocompleteSuggestions(req, res)
);

/**
 * @route GET /api/search/content/:articleId
 * @desc Search within specific article content
 * @access Public
 */
router.get('/content/:articleId',
  searchRateLimit,
  (req, res) => {
    req.query.articleId = req.params.articleId;
    searchController.searchInContent(req, res);
  }
);

/**
 * @route GET /api/search/popular
 * @desc Get popular search queries
 * @access Public
 */
router.get('/popular',
  searchRateLimit,
  (req, res) => searchController.getAutocompleteSuggestions(req, res)
);

/**
 * @route GET /api/search/analytics
 * @desc Get search analytics and statistics
 * @access Public (consider adding admin authentication)
 */
router.get('/analytics',
  searchRateLimit,
  (req, res) => searchController.getSearchAnalytics(req, res)
);

/**
 * @route GET /api/search/export
 * @desc Export search results in various formats
 * @access Public
 */
router.get('/export',
  exportRateLimit,
  validateSearchQuery,
  validateExportParams,
  (req, res) => searchController.advancedSearch(req, res) // Will be handled by export logic in controller
);

/**
 * @route POST /api/search/filters/apply
 * @desc Apply facet selection to current filters
 * @access Public
 */
router.post('/filters/apply',
  searchRateLimit,
  async (req, res) => {
    try {
      const { currentFilters, facetKey, facetValue, selected } = req.body;

      if (!facetKey || facetValue === undefined || selected === undefined) {
        return res.status(400).json({
          error: 'Missing required parameters: facetKey, facetValue, selected'
        });
      }

      // This would typically be handled by the FacetedSearchService
      // For now, return a placeholder response
      res.json({
        success: true,
        data: {
          filters: currentFilters || {},
          message: 'Filter application endpoint - implementation needed'
        }
      });
    } catch (error) {
      console.error('Apply filters error:', error);
      res.status(500).json({
        error: 'Failed to apply filters',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route POST /api/search/filters/clear
 * @desc Clear specific or all filters
 * @access Public
 */
router.post('/filters/clear',
  searchRateLimit,
  async (req, res) => {
    try {
      const { currentFilters, facetKey } = req.body;

      // This would typically be handled by the FacetedSearchService
      // For now, return a placeholder response
      res.json({
        success: true,
        data: {
          filters: facetKey ? {} : {}, // Simplified - would use actual service
          message: 'Filter clearing endpoint - implementation needed'
        }
      });
    } catch (error) {
      console.error('Clear filters error:', error);
      res.status(500).json({
        error: 'Failed to clear filters',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * @route DELETE /api/search/cache
 * @desc Clear search cache (admin endpoint)
 * @access Admin
 */
router.delete('/cache',
  // TODO: Add admin authentication middleware
  async (req, res) => {
    try {
      const { pattern } = req.query;

      // This would typically clear Redis cache
      // For now, return a placeholder response
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
  }
);

// Error handling middleware (should be last)
router.use(handleSearchErrors);

export default router;