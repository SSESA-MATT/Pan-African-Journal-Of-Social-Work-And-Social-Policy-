-- Advanced Search Functions for Journal Enhancement Phase 1
-- Provides comprehensive search functionality with faceted navigation

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS get_author_suggestions(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_keyword_suggestions(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_search_facets(TEXT, TEXT, TEXT[], TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS search_articles_advanced(TEXT, TEXT, TEXT[], INTEGER[], INTEGER[], TIMESTAMP, TIMESTAMP, TEXT[], INTEGER, INTEGER);

-- Author suggestions function for autocomplete
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
EXCEPTION
    WHEN OTHERS THEN
        -- Return empty result if query fails
        RETURN;
END;
$$ LANGUAGE plpgsql;

-- Keyword suggestions function for autocomplete
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
EXCEPTION
    WHEN OTHERS THEN
        -- Return empty result if query fails
        RETURN;
END;
$$ LANGUAGE plpgsql;

-- Search facets function for dynamic filtering
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
    
    -- Build comprehensive facets
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
$$ LANGUAGE plpgsql;-
- Advanced article search function with comprehensive filtering
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
    -- Get total count for matching articles
    SELECT COUNT(*) INTO total_articles 
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
        AND (p_article_type_filter IS NULL OR COALESCE(a.article_type, 'research_article') = ANY(p_article_type_filter));
    
    -- Return search results with ranking
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
                    ts_rank(
                        to_tsvector('english', COALESCE(a.title, '') || ' ' || COALESCE(a.abstract, '')), 
                        plainto_tsquery('english', p_search_query)
                    )
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
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback to basic search if advanced search fails
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
                1.0::REAL as rank
            FROM articles a
            WHERE 
                a.published_at IS NOT NULL
                AND (p_search_query IS NULL OR (
                    a.title ILIKE '%' || p_search_query || '%' OR
                    a.abstract ILIKE '%' || p_search_query || '%'
                ))
                AND (p_date_from IS NULL OR a.published_at >= p_date_from)
                AND (p_date_to IS NULL OR a.published_at <= p_date_to)
            ORDER BY a.published_at DESC
            LIMIT p_limit_count OFFSET p_offset_count
        )
        SELECT 
            sr.*,
            1::BIGINT as total_count
        FROM search_results sr;
END;
$$ LANGUAGE plpgsql;

-- Function to track search analytics
CREATE OR REPLACE FUNCTION track_search_analytics(
    p_search_query TEXT,
    p_filters_applied JSONB DEFAULT '{}',
    p_results_count INTEGER DEFAULT 0,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_user_session VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO search_analytics (
        search_query,
        filters_applied,
        results_count,
        response_time_ms,
        user_session,
        ip_address,
        user_agent,
        timestamp
    ) VALUES (
        p_search_query,
        p_filters_applied,
        p_results_count,
        p_response_time_ms,
        p_user_session,
        p_ip_address,
        p_user_agent,
        CURRENT_TIMESTAMP
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Silently fail if analytics tracking fails
        NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update article metrics
CREATE OR REPLACE FUNCTION update_article_metrics(
    p_article_id INTEGER,
    p_metric_type VARCHAR(50),
    p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO article_metrics (article_id, metric_type, count, last_updated)
    VALUES (p_article_id, p_metric_type, p_increment, CURRENT_TIMESTAMP)
    ON CONFLICT (article_id, metric_type)
    DO UPDATE SET 
        count = article_metrics.count + p_increment,
        last_updated = CURRENT_TIMESTAMP;
EXCEPTION
    WHEN OTHERS THEN
        -- Silently fail if metrics update fails
        NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to record article metric events
CREATE OR REPLACE FUNCTION record_article_event(
    p_article_id INTEGER,
    p_event_type VARCHAR(50),
    p_user_session VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer VARCHAR(500) DEFAULT NULL,
    p_country_code VARCHAR(2) DEFAULT NULL,
    p_city VARCHAR(100) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO article_metric_events (
        article_id,
        event_type,
        user_session,
        ip_address,
        user_agent,
        referrer,
        country_code,
        city,
        metadata,
        timestamp
    ) VALUES (
        p_article_id,
        p_event_type,
        p_user_session,
        p_ip_address,
        p_user_agent,
        p_referrer,
        p_country_code,
        p_city,
        p_metadata,
        CURRENT_TIMESTAMP
    );
    
    -- Also update aggregated metrics
    PERFORM update_article_metrics(p_article_id, p_event_type, 1);
EXCEPTION
    WHEN OTHERS THEN
        -- Silently fail if event recording fails
        NULL;
END;
$$ LANGUAGE plpgsql;

-- Add function comments for documentation
COMMENT ON FUNCTION get_author_suggestions(TEXT, INTEGER) IS 'Get author name suggestions for autocomplete functionality';
COMMENT ON FUNCTION get_keyword_suggestions(TEXT, INTEGER) IS 'Get keyword suggestions for autocomplete functionality';
COMMENT ON FUNCTION get_search_facets(TEXT, TEXT, TEXT[], TIMESTAMP, TIMESTAMP) IS 'Get search facets for dynamic filtering interface';
COMMENT ON FUNCTION search_articles_advanced(TEXT, TEXT, TEXT[], INTEGER[], INTEGER[], TIMESTAMP, TIMESTAMP, TEXT[], INTEGER, INTEGER) IS 'Advanced article search with comprehensive filtering and ranking';
COMMENT ON FUNCTION track_search_analytics(TEXT, JSONB, INTEGER, INTEGER, VARCHAR, INET, TEXT) IS 'Track search query analytics for performance monitoring';
COMMENT ON FUNCTION update_article_metrics(INTEGER, VARCHAR, INTEGER) IS 'Update aggregated article metrics';
COMMENT ON FUNCTION record_article_event(INTEGER, VARCHAR, VARCHAR, INET, TEXT, VARCHAR, VARCHAR, VARCHAR, JSONB) IS 'Record individual article metric events';