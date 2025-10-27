-- Search functions for advanced search functionality
-- Migration: 20241027_search_functions.sql

-- Function to get author suggestions
CREATE OR REPLACE FUNCTION get_author_suggestions(
    query_text TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    author TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest_author as author,
        COUNT(*) as count
    FROM (
        SELECT unnest(authors) as unnest_author
        FROM articles
        WHERE published_at IS NOT NULL
    ) author_list
    WHERE unnest_author ILIKE '%' || query_text || '%'
    GROUP BY unnest_author
    ORDER BY count DESC, unnest_author
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get keyword suggestions
CREATE OR REPLACE FUNCTION get_keyword_suggestions(
    query_text TEXT,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    keyword TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest_keyword as keyword,
        COUNT(*) as count
    FROM (
        SELECT unnest(keywords) as unnest_keyword
        FROM articles
        WHERE published_at IS NOT NULL
    ) keyword_list
    WHERE unnest_keyword ILIKE '%' || query_text || '%'
    GROUP BY unnest_keyword
    ORDER BY count DESC, unnest_keyword
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get author facets with counts based on current search context
CREATE OR REPLACE FUNCTION get_author_facets(
    search_query TEXT DEFAULT NULL,
    keyword_filter TEXT[] DEFAULT NULL,
    date_from TIMESTAMP DEFAULT NULL,
    date_to TIMESTAMP DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    author TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_articles AS (
        SELECT a.authors
        FROM articles a
        WHERE 
            a.published_at IS NOT NULL
            AND (search_query IS NULL OR to_tsvector('english', a.title || ' ' || a.abstract) @@ plainto_tsquery('english', search_query))
            AND (keyword_filter IS NULL OR a.keywords && keyword_filter)
            AND (date_from IS NULL OR a.published_at >= date_from)
            AND (date_to IS NULL OR a.published_at <= date_to)
    )
    SELECT 
        unnest_author as author,
        COUNT(*) as count
    FROM (
        SELECT unnest(authors) as unnest_author
        FROM filtered_articles
    ) author_list
    WHERE unnest_author IS NOT NULL AND unnest_author != ''
    GROUP BY unnest_author
    HAVING COUNT(*) > 0
    ORDER BY count DESC, unnest_author
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get keyword facets with counts based on current search context
CREATE OR REPLACE FUNCTION get_keyword_facets(
    search_query TEXT DEFAULT NULL,
    author_filter TEXT DEFAULT NULL,
    date_from TIMESTAMP DEFAULT NULL,
    date_to TIMESTAMP DEFAULT NULL,
    limit_count INTEGER DEFAULT 30
)
RETURNS TABLE (
    keyword TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_articles AS (
        SELECT a.keywords
        FROM articles a
        WHERE 
            a.published_at IS NOT NULL
            AND (search_query IS NULL OR to_tsvector('english', a.title || ' ' || a.abstract) @@ plainto_tsquery('english', search_query))
            AND (author_filter IS NULL OR EXISTS (SELECT 1 FROM unnest(a.authors) AS author WHERE author ILIKE '%' || author_filter || '%'))
            AND (date_from IS NULL OR a.published_at >= date_from)
            AND (date_to IS NULL OR a.published_at <= date_to)
    )
    SELECT 
        unnest_keyword as keyword,
        COUNT(*) as count
    FROM (
        SELECT unnest(keywords) as unnest_keyword
        FROM filtered_articles
    ) keyword_list
    WHERE unnest_keyword IS NOT NULL AND unnest_keyword != ''
    GROUP BY unnest_keyword
    HAVING COUNT(*) > 0
    ORDER BY count DESC, unnest_keyword
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Enhanced facets function with language support
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
        SELECT 
            a.*,
            v.volume_number,
            v.year as volume_year,
            i.issue_number
        FROM articles a
        LEFT JOIN volumes v ON a.volume_id = v.id
        LEFT JOIN issues i ON a.issue_id = i.id
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
            fa.volume_number,
            fa.volume_year as year,
            COUNT(*) as count
        FROM filtered_articles fa
        WHERE fa.volume_number IS NOT NULL
        GROUP BY fa.volume_number, fa.volume_year
        ORDER BY fa.volume_number DESC
    ),
    issue_facets AS (
        SELECT 
            fa.issue_number,
            COUNT(*) as count
        FROM filtered_articles fa
        WHERE fa.issue_number IS NOT NULL
        GROUP BY fa.issue_number
        ORDER BY fa.issue_number
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
    ),
    language_facets AS (
        SELECT 
            COALESCE(fa.language_code, 'en') as language_code,
            COUNT(*) as count
        FROM filtered_articles fa
        GROUP BY COALESCE(fa.language_code, 'en')
        ORDER BY count DESC
    )
    SELECT json_build_object(
        'volumes', COALESCE((SELECT json_agg(row_to_json(volume_facets)) FROM volume_facets), '[]'::json),
        'issues', COALESCE((SELECT json_agg(row_to_json(issue_facets)) FROM issue_facets), '[]'::json),
        'types', COALESCE((SELECT json_agg(row_to_json(type_facets)) FROM type_facets), '[]'::json),
        'years', COALESCE((SELECT json_agg(row_to_json(year_facets)) FROM year_facets), '[]'::json),
        'languages', COALESCE((SELECT json_agg(row_to_json(language_facets)) FROM language_facets), '[]'::json)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS idx_articles_search_title_gin ON articles USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_articles_search_abstract_gin ON articles USING gin(to_tsvector('english', abstract));
CREATE INDEX IF NOT EXISTS idx_articles_search_combined_gin ON articles USING gin(to_tsvector('english', title || ' ' || abstract));
CREATE INDEX IF NOT EXISTS idx_articles_authors_gin ON articles USING gin(authors);
CREATE INDEX IF NOT EXISTS idx_articles_keywords_gin ON articles USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_articles_facet_composite ON articles(article_type, language_code, published_at) WHERE published_at IS NOT NULL;

-- Comments
COMMENT ON FUNCTION get_author_suggestions(TEXT, INTEGER) IS 'Get author name suggestions for autocomplete';
COMMENT ON FUNCTION get_keyword_suggestions(TEXT, INTEGER) IS 'Get keyword suggestions for autocomplete';
COMMENT ON FUNCTION get_author_facets(TEXT, TEXT[], TIMESTAMP, TIMESTAMP, INTEGER) IS 'Get author facets with counts for current search context';
COMMENT ON FUNCTION get_keyword_facets(TEXT, TEXT, TIMESTAMP, TIMESTAMP, INTEGER) IS 'Get keyword facets with counts for current search context';
COMMENT ON FUNCTION get_search_facets(TEXT, TEXT, TEXT[], TIMESTAMP, TIMESTAMP) IS 'Get comprehensive search facets for filtering';