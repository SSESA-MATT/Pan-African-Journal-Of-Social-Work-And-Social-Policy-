-- Clean Search Functions Migration
-- This version avoids JSON concatenation issues

-- Drop existing functions first to avoid parameter name conflicts
DROP FUNCTION IF EXISTS get_author_suggestions(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_keyword_suggestions(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_search_facets(TEXT, TEXT, TEXT[], TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS search_articles_advanced(TEXT, TEXT, TEXT[], INTEGER[], INTEGER[], TIMESTAMP, TIMESTAMP, TEXT[], INTEGER, INTEGER);

-- Helper function to safely extract text array from JSONB
CREATE OR REPLACE FUNCTION jsonb_to_text_array(input_jsonb JSONB)
RETURNS TEXT[] AS $$
BEGIN
    IF input_jsonb IS NULL THEN
        RETURN ARRAY[]::TEXT[];
    END IF;
    
    IF jsonb_typeof(input_jsonb) = 'array' THEN
        RETURN ARRAY(SELECT jsonb_array_elements_text(input_jsonb));
    ELSE
        RETURN ARRAY[]::TEXT[];
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN ARRAY[]::TEXT[];
END;
$$ LANGUAGE plpgsql;

-- Basic author suggestions function (handles JSONB arrays)
CREATE OR REPLACE FUNCTION get_author_suggestions(
    query_text TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    author TEXT,
    count BIGINT
) AS $$
BEGIN
    -- Try JSONB format first
    BEGIN
        RETURN QUERY
        SELECT 
            unnest_author as author,
            COUNT(*) as count
        FROM (
            SELECT jsonb_array_elements_text(COALESCE(authors, '[]'::jsonb)) as unnest_author
            FROM articles
            WHERE published_at IS NOT NULL
            AND authors IS NOT NULL
            AND jsonb_typeof(authors) = 'array'
        ) author_list
        WHERE unnest_author ILIKE '%' || query_text || '%'
        GROUP BY unnest_author
        ORDER BY count DESC, unnest_author
        LIMIT limit_count;
        RETURN;
    EXCEPTION
        WHEN OTHERS THEN
            -- Return empty result if all attempts fail
            RETURN;
    END;
END;
$$ LANGUAGE plpgsql;

-- Basic keyword suggestions function (handles JSONB arrays)
CREATE OR REPLACE FUNCTION get_keyword_suggestions(
    query_text TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    keyword TEXT,
    count BIGINT
) AS $$
BEGIN
    -- Try JSONB format first
    BEGIN
        RETURN QUERY
        SELECT 
            unnest_keyword as keyword,
            COUNT(*) as count
        FROM (
            SELECT jsonb_array_elements_text(COALESCE(keywords, '[]'::jsonb)) as unnest_keyword
            FROM articles
            WHERE published_at IS NOT NULL
            AND keywords IS NOT NULL
            AND jsonb_typeof(keywords) = 'array'
        ) keyword_list
        WHERE unnest_keyword ILIKE '%' || query_text || '%'
        GROUP BY unnest_keyword
        ORDER BY count DESC, unnest_keyword
        LIMIT limit_count;
        RETURN;
    EXCEPTION
        WHEN OTHERS THEN
            -- Return empty result if all attempts fail
            RETURN;
    END;
END;
$$ LANGUAGE plpgsql;

-- Simplified search facets function (handles JSONB)
CREATE OR REPLACE FUNCTION get_search_facets(
    p_search_query TEXT DEFAULT NULL,
    p_author_filter TEXT DEFAULT NULL,
    p_keyword_filter TEXT[] DEFAULT NULL,
    p_date_from TIMESTAMP DEFAULT NULL,
    p_date_to TIMESTAMP DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    article_count INTEGER;
    has_volumes BOOLEAN;
    has_issues BOOLEAN;
BEGIN
    -- Get total article count
    SELECT COUNT(*) INTO article_count FROM articles WHERE published_at IS NOT NULL;
    
    -- Check if we have volumes and issues tables
    has_volumes := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'volumes');
    has_issues := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'issues');
    
    -- Try to build comprehensive facets
    BEGIN
        WITH filtered_articles AS (
            SELECT 
                a.*,
                CASE WHEN has_volumes THEN v.volume_number ELSE NULL END as volume_number,
                CASE WHEN has_volumes THEN v.year ELSE EXTRACT(YEAR FROM a.published_at) END as volume_year,
                CASE WHEN has_issues THEN i.issue_number ELSE NULL END as issue_number
            FROM articles a
            LEFT JOIN volumes v ON (has_volumes AND a.volume_id = v.id)
            LEFT JOIN issues i ON (has_issues AND a.issue_id = i.id)
            WHERE 
                a.published_at IS NOT NULL
                AND (p_search_query IS NULL OR (
                    a.title ILIKE '%' || p_search_query || '%' OR
                    a.abstract ILIKE '%' || p_search_query || '%'
                ))
                AND (p_author_filter IS NULL OR (
                    EXISTS (
                        SELECT 1 
                        FROM jsonb_array_elements_text(COALESCE(a.authors, '[]'::jsonb)) AS author 
                        WHERE author ILIKE '%' || p_author_filter || '%'
                    )
                ))
                AND (p_keyword_filter IS NULL OR (
                    jsonb_to_text_array(a.keywords) && p_keyword_filter
                ))
                AND (p_date_from IS NULL OR a.published_at >= p_date_from)
                AND (p_date_to IS NULL OR a.published_at <= p_date_to)
        ),
        type_facets AS (
            SELECT 
                COALESCE(fa.article_type, 'research_article') as article_type,
                COUNT(*) as count
            FROM filtered_articles fa
            GROUP BY COALESCE(fa.article_type, 'research_article')
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
                COALESCE(fa.language_code, 'en') as language_code,
                COUNT(*) as count
            FROM filtered_articles fa
            GROUP BY COALESCE(fa.language_code, 'en')
            ORDER BY count DESC
        ),
        volume_facets AS (
            SELECT 
                volume_number,
                volume_year,
                COUNT(*) as count
            FROM filtered_articles 
            WHERE volume_number IS NOT NULL 
            GROUP BY volume_number, volume_year 
            ORDER BY volume_number DESC
        ),
        issue_facets AS (
            SELECT 
                issue_number,
                COUNT(*) as count
            FROM filtered_articles 
            WHERE issue_number IS NOT NULL 
            GROUP BY issue_number 
            ORDER BY issue_number
        )
        SELECT json_build_object(
            'volumes', CASE WHEN has_volumes THEN 
                COALESCE((SELECT json_agg(json_build_object('volume_number', volume_number, 'year', volume_year, 'count', count)) FROM volume_facets), '[]'::json)
                ELSE '[]'::json END,
            'issues', CASE WHEN has_issues THEN
                COALESCE((SELECT json_agg(json_build_object('issue_number', issue_number, 'count', count)) FROM issue_facets), '[]'::json)
                ELSE '[]'::json END,
            'types', COALESCE((SELECT json_agg(row_to_json(type_facets)) FROM type_facets), '[]'::json),
            'years', COALESCE((SELECT json_agg(row_to_json(year_facets)) FROM year_facets), '[]'::json),
            'languages', COALESCE((SELECT json_agg(row_to_json(language_facets)) FROM language_facets), '[]'::json)
        ) INTO result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Return minimal facets if complex query fails
            WITH basic_year_facets AS (
                SELECT 
                    EXTRACT(YEAR FROM a.published_at)::INTEGER as year,
                    COUNT(*) as count
                FROM articles a
                WHERE a.published_at IS NOT NULL
                GROUP BY EXTRACT(YEAR FROM a.published_at)
                ORDER BY year DESC
            )
            SELECT json_build_object(
                'volumes', '[]'::json,
                'issues', '[]'::json,
                'types', json_build_array(json_build_object('article_type', 'research_article', 'count', article_count)),
                'years', COALESCE((SELECT json_agg(json_build_object('year', year, 'count', count)) FROM basic_year_facets), '[]'::json),
                'languages', json_build_array(json_build_object('language_code', 'en', 'count', article_count))
            ) INTO result;
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Basic search function (handles JSONB arrays)
CREATE OR REPLACE FUNCTION search_articles_advanced(
    p_search_query TEXT DEFAULT NULL,
    p_author_filter TEXT DEFAULT NULL,
    p_keyword_filter TEXT[] DEFAULT NULL,
    p_volume_filter INTEGER[] DEFAULT NULL,
    p_issue_filter INTEGER[] DEFAULT NULL,
    p_date_from TIMESTAMP DEFAULT NULL,
    p_date_to TIMESTAMP DEFAULT NULL,
    p_article_type_filter TEXT[] DEFAULT NULL,
    p_limit_count INTEGER DEFAULT 20,
    p_offset_count INTEGER DEFAULT 0
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
DECLARE
    total_articles BIGINT;
BEGIN
    -- Get total count first
    SELECT COUNT(*) INTO total_articles FROM articles WHERE articles.published_at IS NOT NULL;
    
    -- Try comprehensive search first
    BEGIN
        RETURN QUERY
        WITH search_results AS (
            SELECT 
                a.id,
                COALESCE(a.title, '')::TEXT as title,
                COALESCE(a.abstract, '')::TEXT as abstract,
                jsonb_to_text_array(a.authors) as authors,
                jsonb_to_text_array(a.keywords) as keywords,
                a.published_at,
                a.volume_id,
                a.issue_id,
                COALESCE(a.article_type, 'research_article')::TEXT as article_type,
                COALESCE(a.language_code, 'en')::TEXT as language_code,
                COALESCE(a.pdf_url, '')::TEXT as pdf_url,
                CASE 
                    WHEN p_search_query IS NOT NULL THEN
                        ts_rank(to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.abstract, '')), plainto_tsquery('english', p_search_query))
                    ELSE 1.0
                END as rank
            FROM articles a
            WHERE 
                a.published_at IS NOT NULL
                AND (p_search_query IS NULL OR (
                    to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.abstract, '')) @@ plainto_tsquery('english', p_search_query)
                ))
                AND (p_author_filter IS NULL OR (
                    EXISTS (
                        SELECT 1 
                        FROM jsonb_array_elements_text(COALESCE(a.authors, '[]'::jsonb)) AS author 
                        WHERE author ILIKE '%' || p_author_filter || '%'
                    )
                ))
                AND (p_keyword_filter IS NULL OR (
                    jsonb_to_text_array(a.keywords) && p_keyword_filter
                ))
                AND (p_volume_filter IS NULL OR a.volume_id = ANY(p_volume_filter))
                AND (p_issue_filter IS NULL OR a.issue_id = ANY(p_issue_filter))
                AND (p_date_from IS NULL OR a.published_at >= p_date_from)
                AND (p_date_to IS NULL OR a.published_at <= p_date_to)
                AND (p_article_type_filter IS NULL OR COALESCE(a.article_type, 'research_article') = ANY(p_article_type_filter))
            ORDER BY rank DESC, a.published_at DESC
            LIMIT p_limit_count OFFSET p_offset_count
        )
        SELECT 
            sr.*,
            total_articles as total_count
        FROM search_results sr;
        RETURN;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Fallback to basic search
            RETURN QUERY
            WITH search_results AS (
                SELECT 
                    a.id,
                    COALESCE(a.title, '')::TEXT as title,
                    COALESCE(a.abstract, '')::TEXT as abstract,
                    ARRAY[]::TEXT[] as authors,
                    ARRAY[]::TEXT[] as keywords,
                    a.published_at,
                    a.volume_id,
                    NULL::INTEGER as issue_id,
                    'research_article'::TEXT as article_type,
                    'en'::TEXT as language_code,
                    ''::TEXT as pdf_url,
                    CASE 
                        WHEN p_search_query IS NOT NULL THEN
                            ts_rank(to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.abstract, '')), plainto_tsquery('english', p_search_query))
                        ELSE 1.0
                    END as rank
                FROM articles a
                WHERE 
                    a.published_at IS NOT NULL
                    AND (p_search_query IS NULL OR (
                        to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.abstract, '')) @@ plainto_tsquery('english', p_search_query)
                    ))
                    AND (p_date_from IS NULL OR a.published_at >= p_date_from)
                    AND (p_date_to IS NULL OR a.published_at <= p_date_to)
                ORDER BY rank DESC, a.published_at DESC
                LIMIT p_limit_count OFFSET p_offset_count
            )
            SELECT 
                sr.*,
                total_articles as total_count
            FROM search_results sr;
            RETURN;
    END;
END;
$$ LANGUAGE plpgsql;

-- Create basic search indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_articles_search_title_gin ON articles USING gin(to_tsvector('english', title)) WHERE title IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_search_abstract_gin ON articles USING gin(to_tsvector('english', abstract)) WHERE abstract IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_at) WHERE published_at IS NOT NULL;

-- Try to create indexes for optional columns (will fail silently if columns don't exist)
DO $$
BEGIN
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_articles_authors_gin ON articles USING gin(authors);
    EXCEPTION
        WHEN undefined_column THEN
            NULL;
    END;
    
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_articles_keywords_gin ON articles USING gin(keywords);
    EXCEPTION
        WHEN undefined_column THEN
            NULL;
    END;
    
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(article_type);
    EXCEPTION
        WHEN undefined_column THEN
            NULL;
    END;
    
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_articles_language ON articles(language_code);
    EXCEPTION
        WHEN undefined_column THEN
            NULL;
    END;
    
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_articles_issue_id ON articles(issue_id);
    EXCEPTION
        WHEN undefined_column THEN
            NULL;
    END;
END $$;

-- Comments
COMMENT ON FUNCTION jsonb_to_text_array(JSONB) IS 'Helper function to safely convert JSONB arrays to TEXT arrays';
COMMENT ON FUNCTION get_author_suggestions(TEXT, INTEGER) IS 'Get author name suggestions for autocomplete (JSONB-safe, clean version)';
COMMENT ON FUNCTION get_keyword_suggestions(TEXT, INTEGER) IS 'Get keyword suggestions for autocomplete (JSONB-safe, clean version)';
COMMENT ON FUNCTION get_search_facets(TEXT, TEXT, TEXT[], TIMESTAMP, TIMESTAMP) IS 'Get search facets with JSONB handling (clean, safe version)';
COMMENT ON FUNCTION search_articles_advanced(TEXT, TEXT, TEXT[], INTEGER[], INTEGER[], TIMESTAMP, TIMESTAMP, TEXT[], INTEGER, INTEGER) IS 'Advanced article search with JSONB array support (clean version)';