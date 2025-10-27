import { Request, Response } from 'express';
import SearchService, { SearchFilters, SearchOptions, SearchResult } from '../services/SearchService';
import FacetedSearchService from '../services/FacetedSearchService';
import { supabase } from '../config/supabase';

export class SearchController {
  private searchService: SearchService;
  private facetedSearchService: FacetedSearchService;

  constructor() {
    this.searchService = new SearchService();
    this.facetedSearchService = new FacetedSearchService();
  }

  /**
   * Advanced search with comprehensive filtering and sorting
   */
  async advancedSearch(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.parseSearchFilters(req.query);
      const options = this.parseSearchOptions(req.query);

      // Validate search parameters
      const validation = this.validateSearchRequest(filters, options);
      if (!validation.valid) {
        res.status(400).json({
          error: 'Invalid search parameters',
          details: validation.errors
        });
        return;
      }

      const results = await this.searchService.search(filters, options);

      // Add additional metadata
      const enrichedResults = {
        ...results,
        metadata: {
          searchId: this.generateSearchId(),
          timestamp: new Date().toISOString(),
          filters: filters,
          options: options
        }
      };

      res.json({
        success: true,
        data: enrichedResults
      });
    } catch (error) {
      this.handleError(res, error, 'Advanced search failed');
    }
  }

  /**
   * Quick search for simple queries
   */
  async quickSearch(req: Request, res: Response): Promise<void> {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query || typeof query !== 'string' || query.trim().length < 2) {
        res.status(400).json({
          error: 'Query parameter "q" is required and must be at least 2 characters'
        });
        return;
      }

      const filters: SearchFilters = { query: query.trim() };
      const options: SearchOptions = {
        page: 1,
        limit: Math.min(parseInt(limit as string) || 10, 50),
        sortBy: 'relevance',
        sortOrder: 'desc',
        includeFacets: false,
        includeMetrics: false
      };

      const results = await this.searchService.search(filters, options);

      res.json({
        success: true,
        data: {
          results: results.results,
          total: results.total,
          query: query,
          searchTime: results.searchTime
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Quick search failed');
    }
  }

  /**
   * Search with real-time suggestions
   */
  async searchWithSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q: query, includeSuggestions = 'true' } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          error: 'Query parameter "q" is required'
        });
        return;
      }

      const filters: SearchFilters = { query: query.trim() };
      const options: SearchOptions = {
        page: 1,
        limit: 20,
        sortBy: 'relevance',
        sortOrder: 'desc',
        includeFacets: true,
        includeMetrics: true
      };

      // Execute search and get suggestions in parallel
      const [searchResults, suggestions] = await Promise.all([
        this.searchService.search(filters, options),
        includeSuggestions === 'true' 
          ? this.searchService.getSuggestions(query.trim(), 5)
          : Promise.resolve([])
      ]);

      res.json({
        success: true,
        data: {
          ...searchResults,
          suggestions: suggestions
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Search with suggestions failed');
    }
  }

  /**
   * Get comprehensive facets for advanced filtering
   */
  async getFacets(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.parseSearchFilters(req.query);
      const facets = await this.facetedSearchService.getFacets(filters);

      res.json({
        success: true,
        data: facets
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve facets');
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q: query, type, limit = 10 } = req.query;

      if (!query || typeof query !== 'string' || query.length < 2) {
        res.json({
          success: true,
          data: []
        });
        return;
      }

      let suggestions;
      const limitNum = Math.min(parseInt(limit as string) || 10, 20);

      switch (type) {
        case 'authors':
          suggestions = await this.getAuthorSuggestions(query, limitNum);
          break;
        case 'keywords':
          suggestions = await this.getKeywordSuggestions(query, limitNum);
          break;
        case 'titles':
          suggestions = await this.getTitleSuggestions(query, limitNum);
          break;
        default:
          suggestions = await this.searchService.getSuggestions(query, limitNum);
      }

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve suggestions');
    }
  }

  /**
   * Search within specific article content
   */
  async searchInContent(req: Request, res: Response): Promise<void> {
    try {
      const { articleId, query, context = 50 } = req.query;

      if (!articleId || !query) {
        res.status(400).json({
          error: 'Both articleId and query parameters are required'
        });
        return;
      }

      // Get article content and search within it
      const { data: article, error } = await supabase
        .from('articles')
        .select('id, title, content, abstract')
        .eq('id', articleId)
        .single();

      if (error || !article) {
        res.status(404).json({
          error: 'Article not found'
        });
        return;
      }

      const searchText = `${article.title} ${article.abstract} ${article.content || ''}`;
      const matches = this.findTextMatches(searchText, query as string, parseInt(context as string));

      res.json({
        success: true,
        data: {
          articleId: article.id,
          articleTitle: article.title,
          query: query,
          matches: matches,
          totalMatches: matches.length
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Content search failed');
    }
  }

  /**
   * Get search analytics and insights
   */
  async getSearchAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = '30', detailed = 'false' } = req.query;
      
      const stats = await this.searchService.getSearchStats();
      
      let detailedAnalytics = {};
      if (detailed === 'true') {
        detailedAnalytics = await this.getDetailedAnalytics(parseInt(period as string));
      }

      res.json({
        success: true,
        data: {
          ...stats,
          ...detailedAnalytics,
          period: `${period} days`
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve search analytics');
    }
  }

  /**
   * Parse search filters from query parameters
   */
  private parseSearchFilters(query: any): SearchFilters {
    return {
      query: query.q as string,
      title: query.title as string,
      authors: query.authors ? (query.authors as string).split(',').map(a => a.trim()) : undefined,
      keywords: query.keywords ? (query.keywords as string).split(',').map(k => k.trim()) : undefined,
      dateRange: query.dateFrom && query.dateTo ? {
        start: query.dateFrom as string,
        end: query.dateTo as string
      } : undefined,
      volumeNumbers: query.volumes ? (query.volumes as string).split(',').map(v => parseInt(v.trim())) : undefined,
      issueNumbers: query.issues ? (query.issues as string).split(',').map(i => parseInt(i.trim())) : undefined,
      articleTypes: query.types ? (query.types as string).split(',').map(t => t.trim()) : undefined,
      language: query.language as string
    };
  }

  /**
   * Parse search options from query parameters
   */
  private parseSearchOptions(query: any): SearchOptions {
    return {
      page: parseInt(query.page as string) || 1,
      limit: Math.min(parseInt(query.limit as string) || 20, 100),
      sortBy: (query.sortBy as 'relevance' | 'date' | 'title' | 'citations' | 'views') || 'relevance',
      sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
      includeFacets: query.includeFacets === 'true',
      includeMetrics: query.includeMetrics === 'true'
    };
  }

  /**
   * Validate search request parameters
   */
  private validateSearchRequest(filters: SearchFilters, options: SearchOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if at least one search parameter is provided
    if (!filters.query && !filters.title && !filters.authors && !filters.keywords) {
      errors.push('At least one search parameter (q, title, authors, or keywords) is required');
    }

    // Validate page and limit
    if (options.page < 1) {
      errors.push('Page must be greater than 0');
    }

    if (options.limit < 1 || options.limit > 100) {
      errors.push('Limit must be between 1 and 100');
    }

    // Validate date range
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        errors.push('Invalid date format in date range');
      } else if (startDate > endDate) {
        errors.push('Start date must be before end date');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate unique search ID for tracking
   */
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get author suggestions
   */
  private async getAuthorSuggestions(query: string, limit: number) {
    const { data, error } = await supabase
      .rpc('get_author_suggestions', { 
        query_text: query, 
        limit_count: limit 
      });

    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      text: item.author,
      type: 'author',
      count: item.count
    }));
  }

  /**
   * Get keyword suggestions
   */
  private async getKeywordSuggestions(query: string, limit: number) {
    const { data, error } = await supabase
      .rpc('get_keyword_suggestions', { 
        query_text: query, 
        limit_count: limit 
      });

    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      text: item.keyword,
      type: 'keyword',
      count: item.count
    }));
  }

  /**
   * Get title suggestions
   */
  private async getTitleSuggestions(query: string, limit: number) {
    const { data, error } = await supabase
      .from('articles')
      .select('title')
      .ilike('title', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    
    return (data || []).map(item => ({
      text: item.title,
      type: 'title',
      count: 1
    }));
  }

  /**
   * Find text matches with context
   */
  private findTextMatches(text: string, query: string, contextLength: number) {
    const matches = [];
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
      const start = Math.max(0, match.index - contextLength);
      const end = Math.min(text.length, match.index + match[0].length + contextLength);
      
      matches.push({
        text: text.substring(start, end),
        position: match.index,
        matchedText: match[0],
        context: {
          before: text.substring(start, match.index),
          after: text.substring(match.index + match[0].length, end)
        }
      });
    }

    return matches;
  }

  /**
   * Get detailed analytics
   */
  private async getDetailedAnalytics(days: number) {
    const { data, error } = await supabase
      .rpc('get_search_analytics_summary', { days_back: days });

    if (error) {
      console.warn('Detailed analytics error:', error);
      return {};
    }

    return data || {};
  }

  /**
   * Handle errors consistently
   */
  private handleError(res: Response, error: any, message: string): void {
    console.error(`${message}:`, error);
    res.status(500).json({
      error: message,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default SearchController;