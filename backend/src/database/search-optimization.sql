-- Search Optimization Script
-- Additional indexes and optimizations for enhanced search performance

-- Create custom text search configuration for academic content
CREATE TEXT SEARCH CONFIGURATION academic_english (COPY = english);

-- Add custom dictionary for academic terms
-- This would include common academic abbreviations, technical terms, etc.
-- ALTER TEXT SEARCH CONFIGURATION academic_english
--     ALTER MAPPING FOR asciiword WITH academic_dict, english_stem;

-- Enhanced full-text search indexes using custom configuration
DROP INDEX IF EXISTS idx_articles_search_title;
DROP INDEX IF EXISTS idx_articles_search_abstract;

CREATE INDEX idx_articles_search_title_enhanced 
    ON articles USING gin(to_tsvector('academic_english', title));

CREATE INDEX idx_articles_search_abstract_enhanced 
    ON articles USING gin(to_tsvector('academic_english', abstract));

-- Combined search index for title and abstract
CREATE INDEX idx_articles_search_combined 
    ON articles USING gin(
        to_tsvector('academic_english', title || ' ' || abstract)
    );

-- Keyword search optimization
CREATE INDEX idx_articles_keywords_gin ON articles USING gin(keywords);

-- Author search optimization (for JSONB author arrays)
CREATE INDEX idx_articles_authors_gin ON articles USING gin(authors);

-- Composite indexes for common filter combinations
CREATE INDEX idx_articles_volume_issue_date 
    ON articles(volume_id, issue_id, published_at DESC);

CREATE INDEX idx_articles_date_volume 
    ON articles(published_at DESC, volume_id);

-- Partial indexes for published articles only
CREATE INDEX idx_articles_published_search_title 
    ON articles USING gin(to_tsvector('academic_english', title))
    WHERE published_at IS NOT NULL;

CREATE INDEX idx_articles_published_search_abstract 
    ON articles USING gin(to_tsvector('academic_english', abstract))
    WHERE published_at IS NOT NULL;

-- Index for article keywords table
CREATE INDEX idx_article_keywords_keyword_trgm 
    ON article_keywords USING gin(keyword gin_trgm_ops);

-- Enable trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for fuzzy search
CREATE INDEX idx_articles_title_trgm ON articles USING gin(title gin_trgm_ops);
CREATE INDEX idx_article_authors_name_trgm ON article_authors USING gin(author_name gin_trgm_ops);

-- Function to calculate search relevance score
CREATE OR REPLACE FUNCTION calculate_search_relevance(
    p_title TEXT,
    p_abstract TEXT,
    p_keywords JSONB,
    p_authors JSONB,
    p_search_query TEXT,
    p_published_at TIMESTAMP WITH TIME ZONE
) RETURNS DECIMAL(10,6) AS $$
DECLARE
    title_rank DECIMAL(10,6) := 0;
    abstract_rank DECIMAL(10,6) := 0;
    keyword_rank DECIMAL(10,6) := 0;
    author_rank DECIMAL(10,6) := 0;
    recency_boost DECIMAL(10,6) := 0;
    total_rank DECIMAL(10,6) := 0;
BEGIN
    -- Title relevance (highest weight)
    title_rank := ts_rank_cd(
        to_tsvector('academic_english', p_title),
        plainto_tsquery('academic_english', p_search_query)
    ) * 4.0;
    
    -- Abstract relevance
    abstract_rank := ts_rank_cd(
        to_tsvector('academic_english', p_abstract),
        plainto_tsquery('academic_english', p_search_query)
    ) * 2.0;
    
    -- Keyword relevance
    IF p_keywords IS NOT NULL THEN
        keyword_rank := ts_rank_cd(
            to_tsvector('academic_english', jsonb_array_elements_text(p_keywords)),
            plainto_tsquery('academic_english', p_search_query)
        ) * 3.0;
    END IF;
    
    -- Author relevance
    IF p_authors IS NOT NULL THEN
        author_rank := ts_rank_cd(
            to_tsvector('academic_english', jsonb_array_elements_text(p_authors)),
            plainto_tsquery('academic_english', p_search_query)
        ) * 1.5;
    END IF;
    
    -- Recency boost (more recent articles get slight boost)
    recency_boost := GREATEST(0, 1.0 - (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p_published_at)) / (365 * 24 * 3600))) * 0.1;
    
    total_rank := title_rank + abstract_rank + keyword_rank + author_rank + recency_boost;
    
    RETURN total_rank;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function for advanced search with multiple criteria
CREATE OR REPLACE FUNCTION advanced_article_search(
    p_query TEXT DEFAULT NULL,
    p_title_query TEXT DEFAULT NULL,
    p_author_query TEXT DEFAULT NULL,
    p_keywords TEXT[] DEFAULT NULL,
    p_date_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_date_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_volume_ids UUID[] DEFAULT NULL,
    p_issue_ids UUID[] DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    article_id UUID,
    title TEXT,
    abstract TEXT,
    authors JSONB,
    keywords JSONB,
    published_at TIMESTAMP WITH TIME ZONE,
    relevance_score DECIMAL(10,6),
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        SELECT 
            a.id,
            a.title,
            a.abstract,
            a.authors,
            a.keywords,
            a.published_at,
            calculate_search_relevance(
                a.title, 
                a.abstract, 
                a.keywords, 
                a.authors, 
                COALESCE(p_query, ''), 
                a.published_at
            ) as relevance,
            COUNT(*) OVER() as total_count
        FROM articles a
        LEFT JOIN issues i ON a.issue_id = i.id
        LEFT JOIN volumes v ON i.volume_id = v.id
        WHERE 
            -- General query search
            (p_query IS NULL OR (
                to_tsvector('academic_english', a.title || ' ' || a.abstract) @@ plainto_tsquery('academic_english', p_query)
                OR a.keywords @> to_jsonb(ARRAY[p_query])
                OR a.authors @> to_jsonb(ARRAY[p_query])
            ))
            -- Title-specific search
            AND (p_title_query IS NULL OR 
                to_tsvector('academic_english', a.title) @@ plainto_tsquery('academic_english', p_title_query))
            -- Author-specific search
            AND (p_author_query IS NULL OR 
                to_tsvector('academic_english', jsonb_array_elements_text(a.authors)) @@ plainto_tsquery('academic_english', p_author_query))
            -- Keyword search
            AND (p_keywords IS NULL OR a.keywords ?| p_keywords)
            -- Date range filter
            AND (p_date_start IS NULL OR a.published_at >= p_date_start)
            AND (p_date_end IS NULL OR a.published_at <= p_date_end)
            -- Volume filter
            AND (p_volume_ids IS NULL OR v.id = ANY(p_volume_ids))
            -- Issue filter
            AND (p_issue_ids IS NULL OR a.issue_id = ANY(p_issue_ids))
            -- Only published articles
            AND a.published_at IS NOT NULL
    )
    SELECT 
        sr.id,
        sr.title,
        sr.abstract,
        sr.authors,
        sr.keywords,
        sr.published_at,
        sr.relevance,
        sr.total_count
    FROM search_results sr
    ORDER BY sr.relevance DESC, sr.published_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to generate search facets
CREATE OR REPLACE FUNCTION get_search_facets(
    p_query TEXT DEFAULT NULL,
    p_filters JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
    facets JSONB := '{}';
    volume_facets JSONB;
    issue_facets JSONB;
    year_facets JSONB;
    keyword_facets JSONB;
BEGIN
    -- Volume facets
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', v.id,
            'number', v.volume_number,
            'year', v.year,
            'count', article_count
        )
    ) INTO volume_facets
    FROM (
        SELECT v.id, v.volume_number, v.year, COUNT(a.id) as article_count
        FROM volumes v
        LEFT JOIN issues i ON v.id = i.volume_id
        LEFT JOIN articles a ON i.id = a.issue_id
        WHERE a.published_at IS NOT NULL
        GROUP BY v.id, v.volume_number, v.year
        HAVING COUNT(a.id) > 0
        ORDER BY v.year DESC, v.volume_number DESC
    ) v;
    
    -- Issue facets
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', i.id,
            'number', i.issue_number,
            'volume_id', i.volume_id,
            'count', article_count
        )
    ) INTO issue_facets
    FROM (
        SELECT i.id, i.issue_number, i.volume_id, COUNT(a.id) as article_count
        FROM issues i
        LEFT JOIN articles a ON i.id = a.issue_id
        WHERE a.published_at IS NOT NULL
        GROUP BY i.id, i.issue_number, i.volume_id
        HAVING COUNT(a.id) > 0
        ORDER BY i.published_at DESC
    ) i;
    
    -- Year facets
    SELECT jsonb_agg(
        jsonb_build_object(
            'year', pub_year,
            'count', article_count
        )
    ) INTO year_facets
    FROM (
        SELECT EXTRACT(YEAR FROM published_at) as pub_year, COUNT(*) as article_count
        FROM articles
        WHERE published_at IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM published_at)
        ORDER BY pub_year DESC
    ) y;
    
    -- Top keyword facets
    SELECT jsonb_agg(
        jsonb_build_object(
            'keyword', keyword,
            'count', keyword_count
        )
    ) INTO keyword_facets
    FROM (
        SELECT ak.keyword, COUNT(*) as keyword_count
        FROM article_keywords ak
        JOIN articles a ON ak.article_id = a.id
        WHERE a.published_at IS NOT NULL
        GROUP BY ak.keyword
        ORDER BY keyword_count DESC
        LIMIT 20
    ) k;
    
    -- Combine all facets
    facets := jsonb_build_object(
        'volumes', COALESCE(volume_facets, '[]'::jsonb),
        'issues', COALESCE(issue_facets, '[]'::jsonb),
        'years', COALESCE(year_facets, '[]'::jsonb),
        'keywords', COALESCE(keyword_facets, '[]'::jsonb)
    );
    
    RETURN facets;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for search performance
CREATE MATERIALIZED VIEW article_search_index AS
SELECT 
    a.id,
    a.title,
    a.abstract,
    a.authors,
    a.keywords,
    a.published_at,
    v.volume_number,
    v.year as volume_year,
    i.issue_number,
    to_tsvector('academic_english', a.title) as title_vector,
    to_tsvector('academic_english', a.abstract) as abstract_vector,
    to_tsvector('academic_english', a.title || ' ' || a.abstract) as combined_vector,
    string_agg(ak.keyword, ' ') as keyword_string,
    string_agg(aa.author_name, ' ') as author_string
FROM articles a
LEFT JOIN issues i ON a.issue_id = i.id
LEFT JOIN volumes v ON i.volume_id = v.id
LEFT JOIN article_keywords ak ON a.id = ak.article_id
LEFT JOIN article_authors aa ON a.id = aa.article_id
WHERE a.published_at IS NOT NULL
GROUP BY a.id, a.title, a.abstract, a.authors, a.keywords, a.published_at,
         v.volume_number, v.year, i.issue_number;

-- Create index on materialized view
CREATE INDEX idx_article_search_index_combined ON article_search_index USING gin(combined_vector);
CREATE INDEX idx_article_search_index_title ON article_search_index USING gin(title_vector);
CREATE INDEX idx_article_search_index_abstract ON article_search_index USING gin(abstract_vector);
CREATE INDEX idx_article_search_index_published ON article_search_index(published_at DESC);

-- Function to refresh search index
CREATE OR REPLACE FUNCTION refresh_article_search_index()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY article_search_index;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh search index when articles are updated
CREATE OR REPLACE FUNCTION trigger_refresh_search_index()
RETURNS TRIGGER AS $$
BEGIN
    -- Use pg_notify to trigger async refresh
    PERFORM pg_notify('refresh_search_index', NEW.id::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_search_index_trigger
    AFTER INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_search_index();

-- Performance analysis queries for monitoring

-- Query to analyze search performance
CREATE OR REPLACE FUNCTION analyze_search_performance()
RETURNS TABLE (
    index_name TEXT,
    index_size TEXT,
    table_size TEXT,
    index_usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||indexname as index_name,
        pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) as index_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
        idx_scan as index_usage_count
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public' 
        AND (indexname LIKE '%search%' OR indexname LIKE '%articles%')
    ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON FUNCTION advanced_article_search IS 'Advanced search function with multiple criteria and relevance scoring';
COMMENT ON FUNCTION get_search_facets IS 'Generate search facets for filtering';
COMMENT ON FUNCTION calculate_search_relevance IS 'Calculate relevance score for search results';
COMMENT ON MATERIALIZED VIEW article_search_index IS 'Materialized view for optimized article search performance';
COMMENT ON FUNCTION refresh_article_search_index IS 'Refresh the article search index materialized view';
COMMENT ON FUNCTION analyze_search_performance IS 'Analyze search index performance and usage statistics';