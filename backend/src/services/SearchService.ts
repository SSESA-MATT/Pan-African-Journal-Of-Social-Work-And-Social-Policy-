import { supabase } from '../config/supabase';
import Redis from 'redis';

// Types for search functionality
export interface SearchFilters {
  query?: string;
  title?: string;
  authors?: string[];
  keywords?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  volumeNumbers?: number[];
  issueNumbers?: number[];
  articleTypes?: string[];
  language?: string;
}

export interface SearchFacets {
  volumes: Array<{
    volume_number: number;
    year: number;
    count: number;
  }>;
  issues: Array<{
    issue_number: number;
    count: number;
  }>;
  years: Array<{
    year: number;
    count: number;
  }>;
  articleTypes: Array<{
    article_type: string;
    count: number;
  }>;
}

export interface SearchResult {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  published_at: string;
  volume_id: string;
  issue_id: string;
  article_type: string;
  rank: number;
  volume_number?: number;
  issue_number?: number;
  volume_year?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  facets: SearchFacets;
  total: number;
  page: number;
  totalPages: number;
  searchTime: number;
  query: string;
}

export interface SearchAnalytics {
  query: string;
  filters: SearchFilters;
  resultsCount: number;
  responseTime: number;
  userSession?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class SearchService {
  private redis: Redis.RedisClientType | null = null;
  private cacheEnabled: boolean = false;
  private cacheTTL: number = 300; // 5 minutes

  constructor() {
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    try {
      if (process.env.REDIS_URL) {
        this.redis = Redis.createClient({
          url: process.env.REDIS_URL
        });
        await this.redis.connect();
        this.cacheEnabled = true;
        console.log('✅ Redis cache initialized for search service');
      }
    } catch (error) {
      console.warn('⚠️ Redis cache not available, search will work without caching:', error);
      this.cacheEnabled = false;
    }
  }

  /**
   * Parse and validate search query
   */
  private parseSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    // Remove special characters that could break the search
    const cleanQuery = query
      .replace(/[^\w\s\-'"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit query length
    return cleanQuery.substring(0, 200);
  }

  /**
   * Generate cache key for search results
   */
  private generateCacheKey(filters: SearchFilters, page: number, limit: number, sortBy: string, sortOrder: string): string {
    const keyData = {
      filters,
      page,
      limit,
      sortBy,
      sortOrder
    };
    return `search:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  /**
   * Get cached search results
   */
  private async getCachedResults(cacheKey: string): Promise<SearchResponse | null> {
    if (!this.cacheEnabled || !this.redis) {
      return null;
    }

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Error getting cached search results:', error);
    }

    return null;
  }

  /**
   * Cache search results
   */
  private async cacheResults(cacheKey: string, results: SearchResponse): Promise<void> {
    if (!this.cacheEnabled || !this.redis) {
      return;
    }

    try {
      await this.redis.setEx(cacheKey, this.cacheTTL, JSON.stringify(results));
    } catch (error) {
      console.warn('Error caching search results:', error);
    }
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(
    result: any,
    query: string,
    filters: SearchFilters
  ): number {
    let score = result.rank || 0;

    // Boost score for exact title matches
    if (result.title.toLowerCase().includes(query.toLowerCase())) {
      score += 0.5;
    }

    // Boost score for recent articles
    const publishedDate = new Date(result.published_at);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 1 - (daysSincePublished / 365)); // Boost decreases over a year
    score += recencyBoost * 0.2;

    // Boost score for keyword matches
    if (filters.keywords && filters.keywords.length > 0) {
      const keywordMatches = filters.keywords.filter(keyword =>
        result.keywords.some((k: string) => k.toLowerCase().includes(keyword.toLowerCase()))
      ).length;
      score += (keywordMatches / filters.keywords.length) * 0.3;
    }

    return score;
  }

  /**
   * Perform advanced search with multiple filters
   */
  async search(
    filters: SearchFilters,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'relevance',
    sortOrder: string = 'desc'
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const cleanQuery = filters.query ? this.parseSearchQuery(filters.query) : '';
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(filters, page, limit, sortBy, sortOrder);
    
    // Try to get cached results
    const cachedResults = await this.getCachedResults(cacheKey);
    if (cachedResults) {
      cachedResults.searchTime = Date.now() - startTime;
      return cachedResults;
    }

    try {
      // Prepare search parameters
      const offset = (page - 1) * limit;
      const searchParams = {
        search_query: cleanQuery || null,
        author_filter: filters.authors && filters.authors.length > 0 ? filters.authors.join(' ') : null,
        keyword_filter: filters.keywords && filters.keywords.length > 0 ? filters.keywords : null,
        volume_filter: filters.volumeNumbers && filters.volumeNumbers.length > 0 ? filters.volumeNumbers : null,
        issue_filter: filters.issueNumbers && filters.issueNumbers.length > 0 ? filters.issueNumbers : null,
        date_from: filters.dateRange?.start ? new Date(filters.dateRange.start).toISOString() : null,
        date_to: filters.dateRange?.end ? new Date(filters.dateRange.end).toISOString() : null,
        article_type_filter: filters.articleTypes && filters.articleTypes.length > 0 ? filters.articleTypes : null,
        limit_count: limit,
        offset_count: offset
      };

      // Execute search
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_articles_advanced', searchParams);

      if (searchError) {
        throw new Error(`Search query failed: ${searchError.message}`);
      }

      // Get facets
      const { data: facetsData, error: facetsError } = await supabase
        .rpc('get_search_facets', {
          search_query: cleanQuery || null,
          author_filter: searchParams.author_filter,
          keyword_filter: searchParams.keyword_filter,
          date_from: searchParams.date_from,
          date_to: searchParams.date_to
        });

      if (facetsError) {
        console.warn('Error getting search facets:', facetsError);
      }

      // Process results
      const results: SearchResult[] = (searchResults || []).map((result: any) => ({
        id: result.id,
        title: result.title,
        abstract: result.abstract,
        authors: result.authors || [],
        keywords: result.keywords || [],
        published_at: result.published_at,
        volume_id: result.volume_id,
        issue_id: result.issue_id,
        article_type: result.article_type,
        rank: this.calculateRelevanceScore(result, cleanQuery, filters),
        volume_number: result.volume_number,
        issue_number: result.issue_number,
        volume_year: result.volume_year
      }));

      // Sort results if needed
      if (sortBy === 'relevance') {
        results.sort((a, b) => sortOrder === 'desc' ? b.rank - a.rank : a.rank - b.rank);
      } else if (sortBy === 'date') {
        results.sort((a, b) => {
          const dateA = new Date(a.published_at).getTime();
          const dateB = new Date(b.published_at).getTime();
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
      } else if (sortBy === 'title') {
        results.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title);
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      const total = searchResults && searchResults.length > 0 ? searchResults[0].total_count : 0;
      const totalPages = Math.ceil(total / limit);
      const searchTime = Date.now() - startTime;

      const response: SearchResponse = {
        results,
        facets: facetsData || { volumes: [], issues: [], years: [], articleTypes: [] },
        total,
        page,
        totalPages,
        searchTime,
        query: cleanQuery
      };

      // Cache the results
      await this.cacheResults(cacheKey, response);

      // Log search analytics
      await this.logSearchAnalytics({
        query: cleanQuery,
        filters,
        resultsCount: total,
        responseTime: searchTime
      });

      return response;

    } catch (error) {
      console.error('Search service error:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(partialQuery: string, limit: number = 10): Promise<string[]> {
    if (!partialQuery || partialQuery.length < 2) {
      return [];
    }

    const cleanQuery = this.parseSearchQuery(partialQuery);
    
    try {
      // Get suggestions from article titles and keywords
      const { data: titleSuggestions, error: titleError } = await supabase
        .from('articles')
        .select('title')
        .ilike('title', `%${cleanQuery}%`)
        .limit(limit);

      if (titleError) {
        console.warn('Error getting title suggestions:', titleError);
      }

      const { data: keywordSuggestions, error: keywordError } = await supabase
        .from('articles')
        .select('keywords')
        .not('keywords', 'is', null)
        .limit(limit * 2);

      if (keywordError) {
        console.warn('Error getting keyword suggestions:', keywordError);
      }

      // Combine and filter suggestions
      const suggestions = new Set<string>();

      // Add title suggestions
      if (titleSuggestions) {
        titleSuggestions.forEach(article => {
          if (article.title.toLowerCase().includes(cleanQuery.toLowerCase())) {
            suggestions.add(article.title);
          }
        });
      }

      // Add keyword suggestions
      if (keywordSuggestions) {
        keywordSuggestions.forEach(article => {
          if (article.keywords) {
            article.keywords.forEach((keyword: string) => {
              if (keyword.toLowerCase().includes(cleanQuery.toLowerCase())) {
                suggestions.add(keyword);
              }
            });
          }
        });
      }

      return Array.from(suggestions).slice(0, limit);

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular search queries
   */
  async getPopularQueries(limit: number = 10): Promise<Array<{query: string, count: number}>> {
    try {
      const { data, error } = await supabase
        .from('search_analytics')
        .select('search_query')
        .not('search_query', 'is', null)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .limit(1000);

      if (error) {
        console.warn('Error getting popular queries:', error);
        return [];
      }

      // Count query frequencies
      const queryCount = new Map<string, number>();
      data?.forEach(record => {
        const query = record.search_query.toLowerCase().trim();
        if (query.length > 2) {
          queryCount.set(query, (queryCount.get(query) || 0) + 1);
        }
      });

      // Sort by frequency and return top results
      return Array.from(queryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([query, count]) => ({ query, count }));

    } catch (error) {
      console.error('Error getting popular queries:', error);
      return [];
    }
  }

  /**
   * Log search analytics
   */
  private async logSearchAnalytics(analytics: SearchAnalytics): Promise<void> {
    try {
      await supabase
        .from('search_analytics')
        .insert({
          search_query: analytics.query,
          filters_applied: analytics.filters,
          results_count: analytics.resultsCount,
          response_time_ms: analytics.responseTime,
          user_session: analytics.userSession,
          ip_address: analytics.ipAddress,
          user_agent: analytics.userAgent,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.warn('Error logging search analytics:', error);
    }
  }

  /**
   * Clear search cache
   */
  async clearCache(): Promise<void> {
    if (!this.cacheEnabled || !this.redis) {
      return;
    }

    try {
      const keys = await this.redis.keys('search:*');
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      console.log(`✅ Cleared ${keys.length} search cache entries`);
    } catch (error) {
      console.warn('Error clearing search cache:', error);
    }
  }

  /**
   * Get search analytics summary
   */
  async getSearchAnalytics(days: number = 30): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    averageResponseTime: number;
    topQueries: Array<{query: string, count: number}>;
    searchTrends: Array<{date: string, count: number}>;
  }> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('search_analytics')
        .select('search_query, response_time_ms, timestamp')
        .gte('timestamp', startDate.toISOString());

      if (error) {
        throw error;
      }

      const totalSearches = data?.length || 0;
      const uniqueQueries = new Set(data?.map(d => d.search_query.toLowerCase())).size;
      const averageResponseTime = data?.length > 0 
        ? data.reduce((sum, d) => sum + (d.response_time_ms || 0), 0) / data.length 
        : 0;

      // Calculate top queries
      const queryCount = new Map<string, number>();
      data?.forEach(record => {
        const query = record.search_query.toLowerCase().trim();
        queryCount.set(query, (queryCount.get(query) || 0) + 1);
      });

      const topQueries = Array.from(queryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      // Calculate daily trends
      const dailyCount = new Map<string, number>();
      data?.forEach(record => {
        const date = new Date(record.timestamp).toISOString().split('T')[0];
        dailyCount.set(date, (dailyCount.get(date) || 0) + 1);
      });

      const searchTrends = Array.from(dailyCount.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }));

      return {
        totalSearches,
        uniqueQueries,
        averageResponseTime: Math.round(averageResponseTime),
        topQueries,
        searchTrends
      };

    } catch (error) {
      console.error('Error getting search analytics:', error);
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        averageResponseTime: 0,
        topQueries: [],
        searchTrends: []
      };
    }
  }

  /**
   * Cleanup method
   */
  async cleanup(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();