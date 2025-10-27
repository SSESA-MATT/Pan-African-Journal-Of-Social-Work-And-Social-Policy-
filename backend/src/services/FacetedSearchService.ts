import { supabase } from '../config/supabase';
import { SearchFilters } from './SearchService';

export interface FacetValue {
  value: string | number;
  label: string;
  count: number;
  selected?: boolean;
}

export interface FacetGroup {
  name: string;
  label: string;
  type: 'single' | 'multiple' | 'range' | 'date';
  values: FacetValue[];
  collapsed?: boolean;
}

export interface FacetedSearchResult {
  facets: FacetGroup[];
  appliedFilters: Record<string, any>;
  totalResults: number;
}

export class FacetedSearchService {
  /**
   * Generate dynamic facets based on current search results
   */
  async generateFacets(
    baseFilters: SearchFilters = {},
    selectedFacets: Record<string, any> = {}
  ): Promise<FacetedSearchResult> {
    try {
      // Get facet data from the database function
      const { data: facetData, error } = await supabase.rpc('get_search_facets', {
        search_query: baseFilters.query || null,
        author_filter: baseFilters.authors?.join(' ') || null,
        keyword_filter: baseFilters.keywords || null,
        date_from: baseFilters.dateRange?.start ? new Date(baseFilters.dateRange.start).toISOString() : null,
        date_to: baseFilters.dateRange?.end ? new Date(baseFilters.dateRange.end).toISOString() : null
      });

      if (error) {
        throw new Error(`Failed to generate facets: ${error.message}`);
      }

      const facets: FacetGroup[] = [];

      // Volume facets
      if (facetData?.volumes && facetData.volumes.length > 0) {
        facets.push({
          name: 'volumes',
          label: 'Volumes',
          type: 'multiple',
          values: facetData.volumes.map((volume: any) => ({
            value: volume.volume_number,
            label: `Volume ${volume.volume_number} (${volume.year})`,
            count: volume.count,
            selected: selectedFacets.volumeNumbers?.includes(volume.volume_number) || false
          }))
        });
      }

      // Issue facets
      if (facetData?.issues && facetData.issues.length > 0) {
        facets.push({
          name: 'issues',
          label: 'Issues',
          type: 'multiple',
          values: facetData.issues.map((issue: any) => ({
            value: issue.issue_number,
            label: `Issue ${issue.issue_number}`,
            count: issue.count,
            selected: selectedFacets.issueNumbers?.includes(issue.issue_number) || false
          }))
        });
      }

      // Year facets
      if (facetData?.years && facetData.years.length > 0) {
        facets.push({
          name: 'years',
          label: 'Publication Year',
          type: 'multiple',
          values: facetData.years.map((year: any) => ({
            value: year.year,
            label: year.year.toString(),
            count: year.count,
            selected: this.isYearSelected(year.year, baseFilters.dateRange) || false
          }))
        });
      }

      // Article type facets
      if (facetData?.types && facetData.types.length > 0) {
        facets.push({
          name: 'articleTypes',
          label: 'Article Type',
          type: 'multiple',
          values: facetData.types.map((type: any) => ({
            value: type.article_type,
            label: this.formatArticleTypeLabel(type.article_type),
            count: type.count,
            selected: selectedFacets.articleTypes?.includes(type.article_type) || false
          }))
        });
      }

      // Author facets (top authors)
      const authorFacets = await this.generateAuthorFacets(baseFilters, selectedFacets);
      if (authorFacets.values.length > 0) {
        facets.push(authorFacets);
      }

      // Keyword facets (top keywords)
      const keywordFacets = await this.generateKeywordFacets(baseFilters, selectedFacets);
      if (keywordFacets.values.length > 0) {
        facets.push(keywordFacets);
      }

      // Language facets
      const languageFacets = await this.generateLanguageFacets(baseFilters, selectedFacets);
      if (languageFacets.values.length > 0) {
        facets.push(languageFacets);
      }

      // Get total results count
      const totalResults = await this.getTotalResultsCount(baseFilters);

      return {
        facets,
        appliedFilters: selectedFacets,
        totalResults
      };

    } catch (error) {
      console.error('Error generating facets:', error);
      return {
        facets: [],
        appliedFilters: selectedFacets,
        totalResults: 0
      };
    }
  }

  /**
   * Generate author facets
   */
  private async generateAuthorFacets(
    baseFilters: SearchFilters,
    selectedFacets: Record<string, any>
  ): Promise<FacetGroup> {
    try {
      // Get top authors from current search context
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          WITH filtered_articles AS (
            SELECT DISTINCT unnest(authors) as author
            FROM articles a
            WHERE 
              a.published_at IS NOT NULL
              ${baseFilters.query ? `AND to_tsvector('english', a.title || ' ' || a.abstract) @@ plainto_tsquery('english', '${baseFilters.query}')` : ''}
              ${baseFilters.keywords ? `AND a.keywords && ARRAY[${baseFilters.keywords.map(k => `'${k}'`).join(',')}]` : ''}
              ${baseFilters.dateRange?.start ? `AND a.published_at >= '${baseFilters.dateRange.start}'` : ''}
              ${baseFilters.dateRange?.end ? `AND a.published_at <= '${baseFilters.dateRange.end}'` : ''}
          )
          SELECT 
            author,
            COUNT(*) as count
          FROM filtered_articles
          WHERE author IS NOT NULL AND author != ''
          GROUP BY author
          ORDER BY count DESC, author
          LIMIT 20
        `
      });

      if (error || !data) {
        return { name: 'authors', label: 'Authors', type: 'multiple', values: [] };
      }

      return {
        name: 'authors',
        label: 'Authors',
        type: 'multiple',
        values: data.map((author: any) => ({
          value: author.author,
          label: author.author,
          count: author.count,
          selected: selectedFacets.authors?.includes(author.author) || false
        }))
      };

    } catch (error) {
      console.error('Error generating author facets:', error);
      return { name: 'authors', label: 'Authors', type: 'multiple', values: [] };
    }
  }

  /**
   * Generate keyword facets
   */
  private async generateKeywordFacets(
    baseFilters: SearchFilters,
    selectedFacets: Record<string, any>
  ): Promise<FacetGroup> {
    try {
      // Get top keywords from current search context
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          WITH filtered_articles AS (
            SELECT DISTINCT unnest(keywords) as keyword
            FROM articles a
            WHERE 
              a.published_at IS NOT NULL
              ${baseFilters.query ? `AND to_tsvector('english', a.title || ' ' || a.abstract) @@ plainto_tsquery('english', '${baseFilters.query}')` : ''}
              ${baseFilters.authors ? `AND EXISTS (SELECT 1 FROM unnest(a.authors) AS author WHERE author ILIKE '%${baseFilters.authors.join('%')}%')` : ''}
              ${baseFilters.dateRange?.start ? `AND a.published_at >= '${baseFilters.dateRange.start}'` : ''}
              ${baseFilters.dateRange?.end ? `AND a.published_at <= '${baseFilters.dateRange.end}'` : ''}
          )
          SELECT 
            keyword,
            COUNT(*) as count
          FROM filtered_articles
          WHERE keyword IS NOT NULL AND keyword != ''
          GROUP BY keyword
          ORDER BY count DESC, keyword
          LIMIT 30
        `
      });

      if (error || !data) {
        return { name: 'keywords', label: 'Keywords', type: 'multiple', values: [] };
      }

      return {
        name: 'keywords',
        label: 'Keywords',
        type: 'multiple',
        collapsed: true, // Keywords can be collapsed by default
        values: data.map((keyword: any) => ({
          value: keyword.keyword,
          label: keyword.keyword,
          count: keyword.count,
          selected: selectedFacets.keywords?.includes(keyword.keyword) || false
        }))
      };

    } catch (error) {
      console.error('Error generating keyword facets:', error);
      return { name: 'keywords', label: 'Keywords', type: 'multiple', values: [] };
    }
  }

  /**
   * Generate language facets
   */
  private async generateLanguageFacets(
    baseFilters: SearchFilters,
    selectedFacets: Record<string, any>
  ): Promise<FacetGroup> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('language_code')
        .not('language_code', 'is', null)
        .not('published_at', 'is', null);

      if (error || !data) {
        return { name: 'languages', label: 'Languages', type: 'multiple', values: [] };
      }

      // Count languages
      const languageCount = new Map<string, number>();
      data.forEach(article => {
        const lang = article.language_code;
        languageCount.set(lang, (languageCount.get(lang) || 0) + 1);
      });

      const languageLabels: Record<string, string> = {
        'en': 'English',
        'fr': 'French',
        'ar': 'Arabic',
        'sw': 'Swahili',
        'pt': 'Portuguese',
        'es': 'Spanish'
      };

      return {
        name: 'languages',
        label: 'Languages',
        type: 'multiple',
        values: Array.from(languageCount.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([code, count]) => ({
            value: code,
            label: languageLabels[code] || code.toUpperCase(),
            count,
            selected: selectedFacets.language === code || false
          }))
      };

    } catch (error) {
      console.error('Error generating language facets:', error);
      return { name: 'languages', label: 'Languages', type: 'multiple', values: [] };
    }
  }

  /**
   * Apply facet filters to search filters
   */
  applyFacetFilters(
    baseFilters: SearchFilters,
    facetSelections: Record<string, any>
  ): SearchFilters {
    const updatedFilters: SearchFilters = { ...baseFilters };

    // Apply volume filters
    if (facetSelections.volumes && facetSelections.volumes.length > 0) {
      updatedFilters.volumeNumbers = facetSelections.volumes;
    }

    // Apply issue filters
    if (facetSelections.issues && facetSelections.issues.length > 0) {
      updatedFilters.issueNumbers = facetSelections.issues;
    }

    // Apply article type filters
    if (facetSelections.articleTypes && facetSelections.articleTypes.length > 0) {
      updatedFilters.articleTypes = facetSelections.articleTypes;
    }

    // Apply author filters
    if (facetSelections.authors && facetSelections.authors.length > 0) {
      updatedFilters.authors = facetSelections.authors;
    }

    // Apply keyword filters
    if (facetSelections.keywords && facetSelections.keywords.length > 0) {
      updatedFilters.keywords = facetSelections.keywords;
    }

    // Apply language filter
    if (facetSelections.language) {
      updatedFilters.language = facetSelections.language;
    }

    // Apply year filters (convert to date range)
    if (facetSelections.years && facetSelections.years.length > 0) {
      const years = facetSelections.years.sort((a: number, b: number) => a - b);
      const startYear = years[0];
      const endYear = years[years.length - 1];
      
      updatedFilters.dateRange = {
        start: `${startYear}-01-01`,
        end: `${endYear}-12-31`
      };
    }

    return updatedFilters;
  }

  /**
   * Get facet state from URL parameters or form data
   */
  parseFacetState(params: Record<string, any>): Record<string, any> {
    const facetState: Record<string, any> = {};

    // Parse array parameters
    const arrayParams = ['volumes', 'issues', 'articleTypes', 'authors', 'keywords', 'years'];
    arrayParams.forEach(param => {
      if (params[param]) {
        if (Array.isArray(params[param])) {
          facetState[param] = params[param];
        } else if (typeof params[param] === 'string') {
          facetState[param] = params[param].split(',').map((v: string) => v.trim());
        }
      }
    });

    // Parse single value parameters
    if (params.language) {
      facetState.language = params.language;
    }

    return facetState;
  }

  /**
   * Convert facet state to URL parameters
   */
  facetStateToParams(facetState: Record<string, any>): Record<string, string> {
    const params: Record<string, string> = {};

    Object.entries(facetState).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params[key] = value.join(',');
      } else if (value && typeof value === 'string') {
        params[key] = value;
      }
    });

    return params;
  }

  /**
   * Helper methods
   */
  private isYearSelected(year: number, dateRange?: { start: string; end: string }): boolean {
    if (!dateRange) return false;
    
    const startYear = new Date(dateRange.start).getFullYear();
    const endYear = new Date(dateRange.end).getFullYear();
    
    return year >= startYear && year <= endYear;
  }

  private formatArticleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'research_article': 'Research Article',
      'review_article': 'Review Article',
      'case_study': 'Case Study',
      'brief_communication': 'Brief Communication',
      'commentary': 'Commentary',
      'policy_brief': 'Policy Brief',
      'practice_note': 'Practice Note',
      'student_voice': 'Student Voice'
    };

    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private async getTotalResultsCount(filters: SearchFilters): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('search_articles_advanced', {
        search_query: filters.query || null,
        author_filter: filters.authors?.join(' ') || null,
        keyword_filter: filters.keywords || null,
        volume_filter: filters.volumeNumbers || null,
        issue_filter: filters.issueNumbers || null,
        date_from: filters.dateRange?.start ? new Date(filters.dateRange.start).toISOString() : null,
        date_to: filters.dateRange?.end ? new Date(filters.dateRange.end).toISOString() : null,
        article_type_filter: filters.articleTypes || null,
        limit_count: 1,
        offset_count: 0
      });

      if (error || !data || data.length === 0) {
        return 0;
      }

      return data[0].total_count || 0;

    } catch (error) {
      console.error('Error getting total results count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const facetedSearchService = new FacetedSearchService();