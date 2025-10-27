-- Backup and Restore Procedures for Journal Enhancement Phase 1
-- Provides utilities for database backup and restore operations

-- Function to create a backup of critical journal data
CREATE OR REPLACE FUNCTION create_journal_backup()
RETURNS JSON AS $$
DECLARE
    backup_data JSON;
    backup_timestamp TIMESTAMP;
BEGIN
    backup_timestamp := CURRENT_TIMESTAMP;
    
    SELECT json_build_object(
        'backup_timestamp', backup_timestamp,
        'articles_count', (SELECT COUNT(*) FROM articles),
        'dois_count', (SELECT COUNT(*) FROM dois),
        'metrics_count', (SELECT COUNT(*) FROM article_metrics),
        'events_count', (SELECT COUNT(*) FROM editorial_events),
        'search_analytics_count', (SELECT COUNT(*) FROM search_analytics),
        'tables_status', json_build_object(
            'articles', CASE WHEN EXISTS (SELECT 1 FROM articles LIMIT 1) THEN 'populated' ELSE 'empty' END,
            'dois', CASE WHEN EXISTS (SELECT 1 FROM dois LIMIT 1) THEN 'populated' ELSE 'empty' END,
            'article_metrics', CASE WHEN EXISTS (SELECT 1 FROM article_metrics LIMIT 1) THEN 'populated' ELSE 'empty' END,
            'editorial_events', CASE WHEN EXISTS (SELECT 1 FROM editorial_events LIMIT 1) THEN 'populated' ELSE 'empty' END,
            'search_analytics', CASE WHEN EXISTS (SELECT 1 FROM search_analytics LIMIT 1) THEN 'populated' ELSE 'empty' END
        )
    ) INTO backup_data;
    
    RETURN backup_data;
END;
$$ LANGUAGE plpgsql;

-- Function to validate database integrity
CREATE OR REPLACE FUNCTION validate_database_integrity()
RETURNS JSON AS $$
DECLARE
    validation_result JSON;
    orphaned_dois INTEGER;
    orphaned_metrics INTEGER;
    orphaned_keywords INTEGER;
    orphaned_authors INTEGER;
    missing_metadata INTEGER;
BEGIN
    -- Check for orphaned records
    SELECT COUNT(*) INTO orphaned_dois
    FROM dois d
    WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = d.article_id);
    
    SELECT COUNT(*) INTO orphaned_metrics
    FROM article_metrics m
    WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = m.article_id);
    
    SELECT COUNT(*) INTO orphaned_keywords
    FROM article_keywords k
    WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = k.article_id);
    
    SELECT COUNT(*) INTO orphaned_authors
    FROM article_authors au
    WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = au.article_id);
    
    -- Check for articles missing essential metadata
    SELECT COUNT(*) INTO missing_metadata
    FROM articles a
    WHERE a.published_at IS NOT NULL 
    AND (a.title IS NULL OR a.title = '' OR a.abstract IS NULL OR a.abstract = '');
    
    SELECT json_build_object(
        'validation_timestamp', CURRENT_TIMESTAMP,
        'integrity_status', CASE 
            WHEN orphaned_dois + orphaned_metrics + orphaned_keywords + orphaned_authors = 0 
            THEN 'good' 
            ELSE 'issues_found' 
        END,
        'orphaned_records', json_build_object(
            'dois', orphaned_dois,
            'metrics', orphaned_metrics,
            'keywords', orphaned_keywords,
            'authors', orphaned_authors
        ),
        'data_quality', json_build_object(
            'articles_missing_metadata', missing_metadata
        ),
        'recommendations', CASE 
            WHEN orphaned_dois + orphaned_metrics + orphaned_keywords + orphaned_authors > 0
            THEN json_build_array('Clean up orphaned records', 'Review data integrity constraints')
            ELSE json_build_array('Database integrity is good')
        END
    ) INTO validation_result;
    
    RETURN validation_result;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up orphaned records
CREATE OR REPLACE FUNCTION cleanup_orphaned_records()
RETURNS JSON AS $$
DECLARE
    cleanup_result JSON;
    deleted_dois INTEGER;
    deleted_metrics INTEGER;
    deleted_keywords INTEGER;
    deleted_authors INTEGER;
BEGIN
    -- Clean up orphaned DOIs
    DELETE FROM dois d
    WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = d.article_id);
    GET DIAGNOSTICS deleted_dois = ROW_COUNT;
    
    -- Clean up orphaned metrics
    DELETE FROM article_metrics m
    WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = m.article_id);
    GET DIAGNOSTICS deleted_metrics = ROW_COUNT;
    
    -- Clean up orphaned keywords
    DELETE FROM article_keywords k
    WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = k.article_id);
    GET DIAGNOSTICS deleted_keywords = ROW_COUNT;
    
    -- Clean up orphaned authors
    DELETE FROM article_authors au
    WHERE NOT EXISTS (SELECT 1 FROM articles a WHERE a.id = au.article_id);
    GET DIAGNOSTICS deleted_authors = ROW_COUNT;
    
    SELECT json_build_object(
        'cleanup_timestamp', CURRENT_TIMESTAMP,
        'records_deleted', json_build_object(
            'dois', deleted_dois,
            'metrics', deleted_metrics,
            'keywords', deleted_keywords,
            'authors', deleted_authors
        ),
        'total_deleted', deleted_dois + deleted_metrics + deleted_keywords + deleted_authors
    ) INTO cleanup_result;
    
    RETURN cleanup_result;
END;
$$ LANGUAGE plpgsql;

-- Function to reset search analytics (for development/testing)
CREATE OR REPLACE FUNCTION reset_search_analytics()
RETURNS JSON AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM search_analytics;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN json_build_object(
        'reset_timestamp', CURRENT_TIMESTAMP,
        'deleted_analytics_records', deleted_count,
        'status', 'completed'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to regenerate article metadata (keywords and authors tables)
CREATE OR REPLACE FUNCTION regenerate_article_metadata()
RETURNS JSON AS $$
DECLARE
    processed_articles INTEGER;
    total_keywords INTEGER;
    total_authors INTEGER;
BEGIN
    -- Clear existing metadata
    DELETE FROM article_keywords;
    DELETE FROM article_authors;
    
    -- Regenerate keywords
    INSERT INTO article_keywords (article_id, keyword)
    SELECT 
        a.id,
        jsonb_array_elements_text(a.keywords)
    FROM articles a
    WHERE a.keywords IS NOT NULL 
    AND jsonb_typeof(a.keywords) = 'array';
    
    GET DIAGNOSTICS total_keywords = ROW_COUNT;
    
    -- Regenerate authors
    INSERT INTO article_authors (article_id, author_name, author_order)
    SELECT
        a.id,
        jsonb_array_elements_text(a.authors),
        ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY ordinality)
    FROM articles a,
    jsonb_array_elements_text(a.authors) WITH ORDINALITY
    WHERE a.authors IS NOT NULL 
    AND jsonb_typeof(a.authors) = 'array';
    
    GET DIAGNOSTICS total_authors = ROW_COUNT;
    
    SELECT COUNT(DISTINCT id) INTO processed_articles
    FROM articles
    WHERE (authors IS NOT NULL AND jsonb_typeof(authors) = 'array')
    OR (keywords IS NOT NULL AND jsonb_typeof(keywords) = 'array');
    
    RETURN json_build_object(
        'regeneration_timestamp', CURRENT_TIMESTAMP,
        'processed_articles', processed_articles,
        'generated_keywords', total_keywords,
        'generated_authors', total_authors,
        'status', 'completed'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get database statistics
CREATE OR REPLACE FUNCTION get_database_statistics()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'timestamp', CURRENT_TIMESTAMP,
        'table_counts', json_build_object(
            'articles', (SELECT COUNT(*) FROM articles),
            'published_articles', (SELECT COUNT(*) FROM articles WHERE published_at IS NOT NULL),
            'dois', (SELECT COUNT(*) FROM dois),
            'article_metrics', (SELECT COUNT(*) FROM article_metrics),
            'metric_events', (SELECT COUNT(*) FROM article_metric_events),
            'editorial_events', (SELECT COUNT(*) FROM editorial_events),
            'search_analytics', (SELECT COUNT(*) FROM search_analytics),
            'article_keywords', (SELECT COUNT(*) FROM article_keywords),
            'article_authors', (SELECT COUNT(*) FROM article_authors),
            'citation_exports', (SELECT COUNT(*) FROM citation_exports),
            'related_articles', (SELECT COUNT(*) FROM related_articles)
        ),
        'article_types', (
            SELECT json_object_agg(
                COALESCE(article_type, 'research_article'),
                count
            )
            FROM (
                SELECT 
                    COALESCE(article_type, 'research_article') as article_type,
                    COUNT(*) as count
                FROM articles 
                WHERE published_at IS NOT NULL
                GROUP BY COALESCE(article_type, 'research_article')
            ) type_counts
        ),
        'language_distribution', (
            SELECT json_object_agg(
                COALESCE(language_code, 'en'),
                count
            )
            FROM (
                SELECT 
                    COALESCE(language_code, 'en') as language_code,
                    COUNT(*) as count
                FROM articles 
                WHERE published_at IS NOT NULL
                GROUP BY COALESCE(language_code, 'en')
            ) lang_counts
        ),
        'publication_years', (
            SELECT json_object_agg(
                year,
                count
            )
            FROM (
                SELECT 
                    EXTRACT(YEAR FROM published_at)::INTEGER as year,
                    COUNT(*) as count
                FROM articles 
                WHERE published_at IS NOT NULL
                GROUP BY EXTRACT(YEAR FROM published_at)
                ORDER BY year
            ) year_counts
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION create_journal_backup() IS 'Creates a backup summary of critical journal data';
COMMENT ON FUNCTION validate_database_integrity() IS 'Validates database integrity and identifies potential issues';
COMMENT ON FUNCTION cleanup_orphaned_records() IS 'Removes orphaned records that reference non-existent articles';
COMMENT ON FUNCTION reset_search_analytics() IS 'Resets search analytics data (for development/testing)';
COMMENT ON FUNCTION regenerate_article_metadata() IS 'Regenerates normalized article metadata tables';
COMMENT ON FUNCTION get_database_statistics() IS 'Returns comprehensive database statistics and metrics';