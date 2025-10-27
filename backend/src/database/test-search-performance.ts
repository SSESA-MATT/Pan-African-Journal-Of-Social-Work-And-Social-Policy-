import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SearchTestResult {
  query: string;
  executionTime: number;
  resultCount: number;
  indexUsed: boolean;
}

class SearchPerformanceTester {
  async testBasicTextSearch(): Promise<SearchTestResult[]> {
    console.log('🔍 Testing basic text search performance...');
    
    const testQueries = [
      'social work',
      'community development',
      'mental health',
      'policy analysis',
      'rural Africa'
    ];

    const results: SearchTestResult[] = [];

    for (const query of testQueries) {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, abstract')
        .or(`title.ilike.%${query}%,abstract.ilike.%${query}%`);

      const executionTime = Date.now() - startTime;

      if (error) {
        console.error(`Error testing query "${query}":`, error);
        continue;
      }

      results.push({
        query,
        executionTime,
        resultCount: data?.length || 0,
        indexUsed: false // We'll determine this from EXPLAIN output
      });

      console.log(`  "${query}": ${executionTime}ms, ${data?.length || 0} results`);
    }

    return results;
  }

  async testFullTextSearch(): Promise<SearchTestResult[]> {
    console.log('🔍 Testing full-text search performance...');
    
    const testQueries = [
      'social work',
      'community development',
      'mental health',
      'policy analysis',
      'rural Africa'
    ];

    const results: SearchTestResult[] = [];

    for (const query of testQueries) {
      const startTime = Date.now();
      
      // Using PostgreSQL full-text search with GIN indexes
      const { data, error } = await supabase.rpc('search_articles_fulltext', {
        search_query: query
      });

      const executionTime = Date.now() - startTime;

      if (error) {
        console.error(`Error testing full-text query "${query}":`, error);
        continue;
      }

      results.push({
        query,
        executionTime,
        resultCount: data?.length || 0,
        indexUsed: true
      });

      console.log(`  "${query}": ${executionTime}ms, ${data?.length || 0} results`);
    }

    return results;
  }

  async createSearchFunction(): Promise<void> {
    console.log('📝 Creating full-text search function...');

    const searchFunction = `
      CREATE OR REPLACE FUNCTION search_articles_fulltext(search_query TEXT)
      RETURNS TABLE (
        id UUID,
        title TEXT,
        abstract TEXT,
        authors TEXT[],
        keywords TEXT[],
        published_at TIMESTAMP WITH TIME ZONE,
        volume_id UUID,
        issue_id UUID,
        rank REAL
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          a.id,
          a.title,
          a.abstract,
          a.authors,
          a.keywords,
          a.published_at,
          a.volume_id,
          a.issue_id,
          ts_rank(
            to_tsvector('english', a.title || ' ' || a.abstract),
            plainto_tsquery('english', search_query)
          ) as rank
        FROM articles a
        WHERE 
          to_tsvector('english', a.title || ' ' || a.abstract) @@ plainto_tsquery('english', search_query)
          AND a.published_at IS NOT NULL
        ORDER BY rank DESC, a.published_at DESC;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: searchFunction });

    if (error) {
      console.error('Error creating search function:', error);
      throw error;
    }

    console.log('✅ Full-text search function created successfully');
  }

  async createAdvancedSearchFunction(): Promise<void> {
    console.log('📝 Creating advanced search function...');

    const advancedSearchFunction = `
      CREATE OR REPLACE FUNCTION search_articles_advanced(
        search_query TEXT DEFAULT NULL,
        author_filter TEXT DEFAULT NULL,
        keyword_filter TEXT[] DEFAULT NULL,
        volume_filter INTEGER[] DEFAULT NULL,
        issue_filter INTEGER[] DEFAULT NULL,
        date_from TIMESTAMP DEFAULT NULL,
        date_to TIMESTAMP DEFAULT NULL,
        article_type_filter TEXT[] DEFAULT NULL,
        limit_count INTEGER DEFAULT 20,
        offset_count INTEGER DEFAULT 0
      )
      RETURNS TABLE (
        id UUID,
        title TEXT,
        abstract TEXT,
        authors TEXT[],
        keywords TEXT[],
        published_at TIMESTAMP WITH TIME ZONE,
        volume_id UUID,
        issue_id UUID,
        article_type TEXT,
        rank REAL,
        total_count BIGINT
      ) AS $$
      DECLARE
        total_results BIGINT;
      BEGIN
        -- Get total count for pagination
        SELECT COUNT(*) INTO total_results
        FROM articles a
        LEFT JOIN volumes v ON a.volume_id = v.id
        LEFT JOIN issues i ON a.issue_id = i.id
        WHERE 
          a.published_at IS NOT NULL
          AND (search_query IS NULL OR to_tsvector('english', a.title || ' ' || a.abstract) @@ plainto_tsquery('english', search_query))
          AND (author_filter IS NULL OR EXISTS (SELECT 1 FROM unnest(a.authors) AS author WHERE author ILIKE '%' || author_filter || '%'))
          AND (keyword_filter IS NULL OR a.keywords && keyword_filter)
          AND (volume_filter IS NULL OR v.volume_number = ANY(volume_filter))
          AND (issue_filter IS NULL OR i.issue_number = ANY(issue_filter))
          AND (date_from IS NULL OR a.published_at >= date_from)
          AND (date_to IS NULL OR a.published_at <= date_to)
          AND (article_type_filter IS NULL OR a.article_type = ANY(article_type_filter));

        -- Return paginated results
        RETURN QUERY
        SELECT 
          a.id,
          a.title,
          a.abstract,
          a.authors,
          a.keywords,
          a.published_at,
          a.volume_id,
          a.issue_id,
          a.article_type,
          CASE 
            WHEN search_query IS NOT NULL THEN 
              ts_rank(to_tsvector('english', a.title || ' ' || a.abstract), plainto_tsquery('english', search_query))
            ELSE 0.0
          END as rank,
          total_results as total_count
        FROM articles a
        LEFT JOIN volumes v ON a.volume_id = v.id
        LEFT JOIN issues i ON a.issue_id = i.id
        WHERE 
          a.published_at IS NOT NULL
          AND (search_query IS NULL OR to_tsvector('english', a.title || ' ' || a.abstract) @@ plainto_tsquery('english', search_query))
          AND (author_filter IS NULL OR EXISTS (SELECT 1 FROM unnest(a.authors) AS author WHERE author ILIKE '%' || author_filter || '%'))
          AND (keyword_filter IS NULL OR a.keywords && keyword_filter)
          AND (volume_filter IS NULL OR v.volume_number = ANY(volume_filter))
          AND (issue_filter IS NULL OR i.issue_number = ANY(issue_filter))
          AND (date_from IS NULL OR a.published_at >= date_from)
          AND (date_to IS NULL OR a.published_at <= date_to)
          AND (article_type_filter IS NULL OR a.article_type = ANY(article_type_filter))
        ORDER BY 
          CASE WHEN search_query IS NOT NULL THEN rank ELSE 0 END DESC,
          a.published_at DESC
        LIMIT limit_count
        OFFSET offset_count;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: advancedSearchFunction });

    if (error) {
      console.error('Error creating advanced search function:', error);
      throw error;
    }

    console.log('✅ Advanced search function created successfully');
  }

  async createSearchFacetsFunction(): Promise<void> {
    console.log('📝 Creating search facets function...');

    const facetsFunction = `
      CREATE OR REPLACE FUNCTION get_search_facets(
        search_query TEXT DEFAULT NULL,
        author_filter TEXT DEFAULT NULL,
        keyword_filter TEXT[] DEFAULT NULL,
        date_from TIMESTAMP DEFAULT NULL,
        date_to TIMESTAMP DEFAULT NULL
      )
      RETURNS JSON AS $$
      DECLARE
        result JSON;
      BEGIN
        WITH filtered_articles AS (
          SELECT a.*
          FROM articles a
          WHERE 
            a.published_at IS NOT NULL
            AND (search_query IS NULL OR to_tsvector('english', a.title || ' ' || a.abstract) @@ plainto_tsquery('english', search_query))
            AND (author_filter IS NULL OR EXISTS (SELECT 1 FROM unnest(a.authors) AS author WHERE author ILIKE '%' || author_filter || '%'))
            AND (keyword_filter IS NULL OR a.keywords && keyword_filter)
            AND (date_from IS NULL OR a.published_at >= date_from)
            AND (date_to IS NULL OR a.published_at <= date_to)
        ),
        volume_facets AS (
          SELECT 
            v.volume_number,
            v.year,
            COUNT(*) as count
          FROM filtered_articles fa
          JOIN volumes v ON fa.volume_id = v.id
          GROUP BY v.volume_number, v.year
          ORDER BY v.volume_number DESC
        ),
        issue_facets AS (
          SELECT 
            i.issue_number,
            COUNT(*) as count
          FROM filtered_articles fa
          JOIN issues i ON fa.issue_id = i.id
          GROUP BY i.issue_number
          ORDER BY i.issue_number
        ),
        type_facets AS (
          SELECT 
            fa.article_type,
            COUNT(*) as count
          FROM filtered_articles fa
          WHERE fa.article_type IS NOT NULL
          GROUP BY fa.article_type
          ORDER BY count DESC
        ),
        year_facets AS (
          SELECT 
            EXTRACT(YEAR FROM fa.published_at)::INTEGER as year,
            COUNT(*) as count
          FROM filtered_articles fa
          GROUP BY EXTRACT(YEAR FROM fa.published_at)
          ORDER BY year DESC
        )
        SELECT json_build_object(
          'volumes', COALESCE((SELECT json_agg(row_to_json(volume_facets)) FROM volume_facets), '[]'::json),
          'issues', COALESCE((SELECT json_agg(row_to_json(issue_facets)) FROM issue_facets), '[]'::json),
          'types', COALESCE((SELECT json_agg(row_to_json(type_facets)) FROM type_facets), '[]'::json),
          'years', COALESCE((SELECT json_agg(row_to_json(year_facets)) FROM year_facets), '[]'::json)
        ) INTO result;
        
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: facetsFunction });

    if (error) {
      console.error('Error creating facets function:', error);
      throw error;
    }

    console.log('✅ Search facets function created successfully');
  }

  async testAdvancedSearch(): Promise<void> {
    console.log('🔍 Testing advanced search function...');

    const testCases = [
      {
        name: 'Basic text search',
        params: { search_query: 'social work' }
      },
      {
        name: 'Author filter',
        params: { author_filter: 'Dr.' }
      },
      {
        name: 'Keyword filter',
        params: { keyword_filter: ['community', 'development'] }
      },
      {
        name: 'Combined search',
        params: { 
          search_query: 'mental health',
          article_type_filter: ['research_article']
        }
      }
    ];

    for (const testCase of testCases) {
      const startTime = Date.now();
      
      const { data, error } = await supabase.rpc('search_articles_advanced', testCase.params);
      
      const executionTime = Date.now() - startTime;

      if (error) {
        console.error(`Error in test case "${testCase.name}":`, error);
        continue;
      }

      const totalCount = data && data.length > 0 ? data[0].total_count : 0;
      console.log(`  ${testCase.name}: ${executionTime}ms, ${data?.length || 0} results (${totalCount} total)`);
    }
  }

  async testSearchFacets(): Promise<void> {
    console.log('🔍 Testing search facets function...');

    const startTime = Date.now();
    
    const { data, error } = await supabase.rpc('get_search_facets', {
      search_query: 'social work'
    });
    
    const executionTime = Date.now() - startTime;

    if (error) {
      console.error('Error testing facets:', error);
      return;
    }

    console.log(`  Facets generation: ${executionTime}ms`);
    console.log('  Facets data:', JSON.stringify(data, null, 2));
  }

  async runAllTests(): Promise<void> {
    try {
      console.log('🚀 Starting search performance tests...\n');

      // Create search functions
      await this.createSearchFunction();
      await this.createAdvancedSearchFunction();
      await this.createSearchFacetsFunction();

      console.log('\n📊 Performance Test Results:');
      console.log('================================\n');

      // Test basic search
      await this.testBasicTextSearch();
      console.log('');

      // Test full-text search
      await this.testFullTextSearch();
      console.log('');

      // Test advanced search
      await this.testAdvancedSearch();
      console.log('');

      // Test facets
      await this.testSearchFacets();

      console.log('\n✅ All search performance tests completed!');
    } catch (error) {
      console.error('❌ Search performance test failed:', error);
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new SearchPerformanceTester();
  tester.runAllTests().catch(console.error);
}

export { SearchPerformanceTester };