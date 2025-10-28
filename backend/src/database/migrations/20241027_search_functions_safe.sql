-- Safe Search Functions Migration
-- This version checks for existing schema and adapts accordingly

-- First, let's create a simple function to check if columns exist
CREATE OR REPLACE FUNCTION column_exists(p_table_name text, p_column_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = p_table_name 
        AND column_name = p_column_name
    );
END;
$$ LANGUAGE plpgsql;

-- Basic author suggestions function (works with any schema)
CREATE OR REPLACE FUNCTION get_author_suggestions(
    query_text TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    author TEXT,
    count BIGINT
) AS $$
BEGIN
    -- Check if articles table has authors column
    IF column_exists('articles', 'authors') THEN
        RETURN QUERY
        SELECT 
            unnest_author as author,
            COUNT(*) as count
        FROM (
            SELECT unnest(authors) as unnest_author
            FROM articles
            WHERE published_at IS NOT NULL
            AND authors IS NOT NULL
        ) author_list
        WHERE unnest_author ILIKE '%' || query_text || '%'
        GROUP BY unnest_author
        ORDER BY count DESC, unnest_author
        LIMIT limit_count;
    ELSE
        -- Return empty result if authors column doesn't exist
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Basic keyword suggestions function
CREATE OR REPLACE FUNCTION get_keyword_suggestions(
    query_text TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    keyword TEXT,
    count BIGINT
) AS $$
BEGIN
    -- Check if articles table has keywords column
    IF column_exists('articles', 'keywords') THEN
        RETURN QUERY
        SELECT 
            unnest_keyword as keyword,
            COUNT(*) as count
        FROM (
            SELECT unnest(keywords) as unnest_keyword
            FROM articles
            WHERE published_at IS NOT NULL
            AND keywords IS NOT NULL
        ) keyword_list
        WHERE unnest_keyword ILIKE '%' || query_text || '%'
        GROUP BY unnest_keyword
        ORDER BY count DESC, unnest_keyword
        LIMIT limit_count;
    ELSE
        -- Return empty result if keywords column doesn't exist
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Simplified search facets function
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
    has_volumes BOOLEAN;
    has_issues BOOLEAN;
    has_article_type BOOLEAN;
    has_language_code BOOLEAN;
BEGIN
    -- Check if we have volumes and issues tables
    has_volumes := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'volumes');
    has_issues := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'issues');
    has_article_type := column_exists('articles', 'article_type');
    has_language_code := column_exists('articles', 'language_code');
    
    -- Build basic facets based on available schema
    WITH filtered_articles AS (
        SELECT 
            a.*,
            CASE WHEN has_volumes THEN v.volume_number ELSE NULL END as volume_number,
            CASE WHEN has_volumes THEN v.year ELSE EXTRACT(YEAR FROM a.published_at) END as volume_year,
            CASE WHEN has_issues THEN i.issue_number ELSE NULL END as issue_number
        FROM articles a
        LEFT JOIN volumes v ON (has_volumes AND a.volume_id = v.id)
        LEFT JOIN issues i ON (has_issues AND column_exists('articles', 'issue_id') AND a.issue_id = i.id)
        WHERE 
            a.published_at IS NOT NULL
            AND (search_query IS NULL OR (
                (column_exists('articles', 'title') AND a.title ILIKE '%' || search_query || '%') OR
                (column_exists('articles', 'abstract') AND a.abstract ILIKE '%' || search_query || '%')
            ))
            AND (author_filter IS NULL OR (
                column_exists('articles', 'authors') AND 
                EXISTS (SELECT 1 FROM unnest(COALESCE(a.authors, ARRAY[]::TEXT[])) AS author WHERE author ILIKE '%' || author_filter || '%')
            ))
            AND (keyword_filter IS NULL OR (
                column_exists('articles', 'keywords') AND COALESCE(a.keywords, ARRAY[]::TEXT[]) && keyword_filter
            ))
            AND (date_from IS NULL OR a.published_at >= date_from)
            AND (date_to IS NULL OR a.published_at <= date_to)
    ),
    type_facets AS (
        SELECT 
            CASE WHEN has_article_type THEN COALESCE(fa.article_type, 'research_article') ELSE 'research_article' END as article_type,
            COUNT(*) as count
        FROM filtered_articles fa
        GROUP BY CASE WHEN has_article_type THEN COALESCE(fa.article_type, 'research_article') ELSE 'research_article' END
        ORDER BY count DESC
    ),
    year_facets AS (
        SELECT 
            EXTRACT(YEAR FROM fa.published_at)::INTEGER as year,
            COUNT(*) as count
        FROM filtered_articles fa
        GROUP BY EXTRACT(YEAR FROM fa.published_at)
        ORDER BY year DESC
    ),
    language_facets AS (
        SELECT 
            CASE WHEN has_language_code THEN COALESCE(fa.language_code, 'en') ELSE 'en' END as language_code,
            COUNT(*) as count
        FROM filtered_articles fa
        GROUP BY CASE WHEN has_language_code THEN COALESCE(fa.language_code, 'en') ELSE 'en' END
        ORDER BY count DESC
    )
    SELECT json_build_object(
        'volumes', CASE WHEN has_volumes THEN 
            COALESCE((SELECT json_agg(json_build_object('volume_number', volume_number, 'year', volume_year, 'count', count))
                FROM (SELECT volume_number, volume_year, COUNT(*) as count FROM filtered_articles WHERE volume_number IS NOT NULL GROUP BY volume_number, volume_year ORDER BY volume_number DESC) vol_counts), '[]'::json)
            ELSE '[]'::json END,
        'issues', CASE WHEN has_issues THEN
            COALESCE((SELECT json_agg(json_build_object('issue_number', issue_number, 'count', count))
                FROM (SELECT issue_number, COUNT(*) as count FROM filtered_articles WHERE issue_number IS NOT NULL GROUP BY issue_number ORDER BY issue_number) issue_counts), '[]'::json)
            ELSE '[]'::json END,
        'types', COALESCE((SELECT json_agg(row_to_json(type_facets)) FROM type_facets), '[]'::json),
        'years', COALESCE((SELECT json_agg(row_to_json(year_facets)) FROM year_facets), '[]'::json),
        'languages', COALESCE((SELECT json_agg(row_to_json(language_facets)) FROM language_facets), '[]'::json)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Basic search function
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
    id INTEGER,
    title TEXT,
    abstract TEXT,
    authors TEXT[],
    keywords TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    volume_id INTEGER,
    issue_id INTEGER,
    article_type TEXT,
    language_code TEXT,
    pdf_url TEXT,
    rank REAL,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        SELECT 
            a.id,
            COALESCE(a.title, '') as title,
            COALESCE(a.abstract, '') as abstract,
            CASE WHEN column_exists('articles', 'authors') THEN COALESCE(a.authors, ARRAY[]::TEXT[]) ELSE ARRAY[]::TEXT[] END as authors,
            CASE WHEN column_exists('articles', 'keywords') THEN COALESCE(a.keywords, ARRAY[]::TEXT[]) ELSE ARRAY[]::TEXT[] END as keywords,
            a.published_at,
            a.volume_id,
            CASE WHEN column_exists('articles', 'issue_id') THEN a.issue_id ELSE NULL END as issue_id,
            CASE WHEN column_exists('articles', 'article_type') THEN COALESCE(a.article_type, 'research_article') ELSE 'research_article' END as article_type,
            CASE WHEN column_exists('articles', 'language_code') THEN COALESCE(a.language_code, 'en') ELSE 'en' END as language_code,
            CASE WHEN column_exists('articles', 'pdf_url') THEN COALESCE(a.pdf_url, '') ELSE '' END as pdf_url,
            CASE 
                WHEN search_query IS NOT NULL THEN
                    ts_rank(to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.abstract, '')), plainto_tsquery('english', search_query))
                ELSE 1.0
            END as rank
        FROM articles a
        WHERE 
            a.published_at IS NOT NULL
            AND (search_query IS NULL OR (
                to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.abstract, '')) @@ plainto_tsquery('english', search_query)
            ))
            AND (author_filter IS NULL OR (
                column_exists('articles', 'authors') AND 
                EXISTS (SELECT 1 FROM unnest(COALESCE(a.authors, ARRAY[]::TEXT[])) AS author WHERE author ILIKE '%' || author_filter || '%')
            ))
            AND (keyword_filter IS NULL OR (
                column_exists('articles', 'keywords') AND COALESCE(a.keywords, ARRAY[]::TEXT[]) && keyword_filter
            ))
            AND (volume_filter IS NULL OR a.volume_id = ANY(volume_filter))
            AND (issue_filter IS NULL OR (
                column_exists('articles', 'issue_id') AND a.issue_id = ANY(issue_filter)
            ))
            AND (date_from IS NULL OR a.published_at >= date_from)
            AND (date_to IS NULL OR a.published_at <= date_to)
            AND (article_type_filter IS NULL OR (
                column_exists('articles', 'article_type') AND 
                COALESCE(a.article_type, 'research_article') = ANY(article_type_filter)
            ))
        ORDER BY rank DESC, a.published_at DESC
        LIMIT limit_count OFFSET offset_count
    )
    SELECT 
        sr.*,
        (SELECT COUNT(*) FROM articles WHERE published_at IS NOT NULL) as total_count
    FROM search_results sr;
END;
$$ LANGUAGE plpgsql;

-- Create basic search indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_articles_search_title_gin ON articles USING gin(to_tsvector('english', title)) WHERE title IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_search_abstract_gin ON articles USING gin(to_tsvector('english', abstract)) WHERE abstract IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_at) WHERE published_at IS NOT NULL;

-- Only create these indexes if the columns exist
DO $$
BEGIN
    IF column_exists('articles', 'authors') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_authors_gin ON articles USING gin(authors);
    END IF;
    
    IF column_exists('articles', 'keywords') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_keywords_gin ON articles USING gin(keywords);
    END IF;
    
    IF column_exists('articles', 'article_type') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(article_type);
    END IF;
    
    IF column_exists('articles', 'language_code') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_language ON articles(language_code);
    END IF;
    
    IF column_exists('articles', 'issue_id') THEN
        CREATE INDEX IF NOT EXISTS idx_articles_issue_id ON articles(issue_id);
    END IF;
END $$;

-- Clean up helper function
DROP FUNCTION IF EXISTS column_exists(text, text);

-- Comments
COMMENT ON FUNCTION get_author_suggestions(TEXT, INTEGER) IS 'Get author name suggestions for autocomplete (safe version)';
COMMENT ON FUNCTION get_keyword_suggestions(TEXT, INTEGER) IS 'Get keyword suggestions for autocomplete (safe version)';
COMMENT ON FUNCTION get_search_facets(TEXT, TEXT, TEXT[], TIMESTAMP, TIMESTAMP) IS 'Get search facets with schema detection (safe version)';
COMMENT ON FUNCTION search_articles_advanced(TEXT, TEXT, TEXT[], INTEGER[], INTEGER[], TIMESTAMP, TIMESTAMP, TEXT[], INTEGER, INTEGER) IS 'Advanced article search with flexible schema support';