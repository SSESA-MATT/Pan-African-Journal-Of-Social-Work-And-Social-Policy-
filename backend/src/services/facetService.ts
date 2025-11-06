import { Pool } from 'pg';

export interface FacetValue {
  value: string | number;
  label: string;
  count: number;
}

export interface FacetGroup {
  key: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range';
  multiSelect: boolean;
  values: FacetValue[];
}

export interface FacetFilters {
  searchQuery?: string;
  articleTypes?: string[];
  years?: number[];
  language?: string;
  volumes?: number[];
  issues?: number[];
  authors?: string[];
  keywords?: string[];
}

export class FacetService {
  constructor(private pool: Pool) {}

  async generateFacets(filters: FacetFilters): Promise<FacetGroup[]> {
    const facets: FacetGroup[] = [];

    // Build base query conditions
    const { conditions, queryParams } = this.buildBaseConditions(filters);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      // Generate all facets in parallel
      const [
        articleTypesFacet,
        yearsFacet,
        languagesFacet,
        volumesFacet,
        authorsFacet
      ] = await Promise.all([
        this.generateArticleTypesFacet(whereClause, queryParams, filters),
        this.generateYearsFacet(whereClause, queryParams, filters),
        this.generateLanguagesFacet(whereClause, queryParams, filters),
        this.generateVolumesFacet(whereClause, queryParams, filters),
        this.generateAuthorsFacet(whereClause, queryParams, filters)
      ]);

      facets.push(articleTypesFacet, yearsFacet, languagesFacet, volumesFacet, authorsFacet);

      return facets.filter(facet => facet.values.length > 0);
    } catch (error) {
      console.error('Error generating facets:', error);
      throw new Error('Failed to generate facets');
    }
  }

  private buildBaseConditions(filters: FacetFilters): { conditions: string[], queryParams: any[] } {
    const conditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Search query condition
    if (filters.searchQuery) {
      conditions.push(`(
        to_tsvector('english', title) @@ plainto_tsquery('english', $${paramIndex}) OR
        to_tsvector('english', abstract) @@ plainto_tsquery('english', $${paramIndex}) OR
        to_tsvector('english', keywords) @@ plainto_tsquery('english', $${paramIndex})
      )`);
      queryParams.push(filters.searchQuery);
      paramIndex++;
    }

    return { conditions, queryParams };
  }

  private async generateArticleTypesFacet(
    baseWhere: string, 
    baseParams: any[], 
    filters: FacetFilters
  ): Promise<FacetGroup> {
    // Exclude current article type filters from this facet
    const conditions = baseWhere.replace(/AND article_type = ANY\(\$\d+\)/g, '');
    
    const query = `
      SELECT 
        article_type as value,
        CASE 
          WHEN article_type = 'research_article' THEN 'Research Article'
          WHEN article_type = 'review_article' THEN 'Review Article'
          WHEN article_type = 'case_study' THEN 'Case Study'
          WHEN article_type = 'commentary' THEN 'Commentary'
          WHEN article_type = 'policy_brief' THEN 'Policy Brief'
          ELSE INITCAP(REPLACE(article_type, '_', ' '))
        END as label,
        COUNT(*) as count
      FROM articles 
      ${conditions}
      GROUP BY article_type
      ORDER BY count DESC
      LIMIT 20
    `;

    const result = await this.pool.query(query, baseParams);
    
    return {
      key: 'types',
      label: 'Article Types',
      type: 'checkbox',
      multiSelect: true,
      values: result.rows.map(row => ({
        value: row.value,
        label: row.label,
        count: parseInt(row.count)
      }))
    };
  }

  private async generateYearsFacet(
    baseWhere: string, 
    baseParams: any[], 
    filters: FacetFilters
  ): Promise<FacetGroup> {
    const query = `
      SELECT 
        EXTRACT(YEAR FROM publication_date) as value,
        EXTRACT(YEAR FROM publication_date)::text as label,
        COUNT(*) as count
      FROM articles 
      ${baseWhere}
      AND publication_date IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM publication_date)
      ORDER BY value DESC
      LIMIT 10
    `;

    const result = await this.pool.query(query, baseParams);
    
    return {
      key: 'years',
      label: 'Publication Year',
      type: 'checkbox',
      multiSelect: true,
      values: result.rows.map(row => ({
        value: parseInt(row.value),
        label: row.label,
        count: parseInt(row.count)
      }))
    };
  }

  private async generateLanguagesFacet(
    baseWhere: string, 
    baseParams: any[], 
    filters: FacetFilters
  ): Promise<FacetGroup> {
    const query = `
      SELECT 
        language as value,
        CASE 
          WHEN language = 'en' THEN 'English'
          WHEN language = 'fr' THEN 'French'
          WHEN language = 'ar' THEN 'Arabic'
          WHEN language = 'sw' THEN 'Swahili'
          WHEN language = 'pt' THEN 'Portuguese'
          WHEN language = 'es' THEN 'Spanish'
          ELSE UPPER(language)
        END as label,
        COUNT(*) as count
      FROM articles 
      ${baseWhere}
      AND language IS NOT NULL
      GROUP BY language
      ORDER BY count DESC
      LIMIT 15
    `;

    const result = await this.pool.query(query, baseParams);
    
    return {
      key: 'languages',
      label: 'Language',
      type: 'radio',
      multiSelect: false,
      values: result.rows.map(row => ({
        value: row.value,
        label: row.label,
        count: parseInt(row.count)
      }))
    };
  }

  private async generateVolumesFacet(
    baseWhere: string, 
    baseParams: any[], 
    filters: FacetFilters
  ): Promise<FacetGroup> {
    const query = `
      SELECT 
        volume as value,
        CONCAT('Volume ', volume, ' (', EXTRACT(YEAR FROM publication_date), ')') as label,
        COUNT(*) as count
      FROM articles 
      ${baseWhere}
      AND volume IS NOT NULL
      GROUP BY volume, EXTRACT(YEAR FROM publication_date)
      ORDER BY volume DESC
      LIMIT 20
    `;

    const result = await this.pool.query(query, baseParams);
    
    return {
      key: 'volumes',
      label: 'Volumes',
      type: 'checkbox',
      multiSelect: true,
      values: result.rows.map(row => ({
        value: parseInt(row.value),
        label: row.label,
        count: parseInt(row.count)
      }))
    };
  }

  private async generateAuthorsFacet(
    baseWhere: string, 
    baseParams: any[], 
    filters: FacetFilters
  ): Promise<FacetGroup> {
    const query = `
      SELECT 
        TRIM(author_name) as value,
        TRIM(author_name) as label,
        COUNT(*) as count
      FROM (
        SELECT UNNEST(string_to_array(authors, ',')) as author_name
        FROM articles 
        ${baseWhere}
        AND authors IS NOT NULL AND authors != ''
      ) author_list
      WHERE TRIM(author_name) != ''
      GROUP BY TRIM(author_name)
      ORDER BY count DESC
      LIMIT 50
    `;

    const result = await this.pool.query(query, baseParams);
    
    return {
      key: 'authors',
      label: 'Authors',
      type: 'checkbox',
      multiSelect: true,
      values: result.rows.map(row => ({
        value: row.value,
        label: row.label,
        count: parseInt(row.count)
      }))
    };
  }

  async generateKeywordsFacet(
    baseWhere: string, 
    baseParams: any[], 
    filters: FacetFilters
  ): Promise<FacetGroup> {
    const query = `
      SELECT 
        TRIM(LOWER(keyword)) as value,
        TRIM(INITCAP(keyword)) as label,
        COUNT(*) as count
      FROM (
        SELECT UNNEST(string_to_array(keywords, ',')) as keyword
        FROM articles 
        ${baseWhere}
        AND keywords IS NOT NULL AND keywords != ''
      ) keyword_list
      WHERE TRIM(keyword) != '' AND LENGTH(TRIM(keyword)) > 2
      GROUP BY TRIM(LOWER(keyword)), TRIM(INITCAP(keyword))
      ORDER BY count DESC
      LIMIT 30
    `;

    const result = await this.pool.query(query, baseParams);
    
    return {
      key: 'keywords',
      label: 'Keywords',
      type: 'checkbox',
      multiSelect: true,
      values: result.rows.map(row => ({
        value: row.value,
        label: row.label,
        count: parseInt(row.count)
      }))
    };
  }
}