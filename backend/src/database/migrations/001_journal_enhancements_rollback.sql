-- Journal Enhancement Phase 1: Rollback Migration
-- Migration: 001_journal_enhancements_rollback.sql
-- Description: Rollback database schema enhancements

-- Drop views first
DROP VIEW IF EXISTS editorial_calendar_view;
DROP VIEW IF EXISTS article_metrics_summary;

-- Drop functions
DROP FUNCTION IF EXISTS log_metric_event(UUID, VARCHAR(50), VARCHAR(255), INET, TEXT, TEXT, VARCHAR(2), VARCHAR(100), JSONB);
DROP FUNCTION IF EXISTS update_article_metrics(UUID, VARCHAR(50), INTEGER, JSONB);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop triggers
DROP TRIGGER IF EXISTS update_dois_updated_at ON dois;
DROP TRIGGER IF EXISTS update_editorial_events_updated_at ON editorial_events;
DROP TRIGGER IF EXISTS update_supplementary_materials_updated_at ON supplementary_materials;

-- Drop indexes on existing tables
DROP INDEX IF EXISTS idx_articles_search_title_gin;
DROP INDEX IF EXISTS idx_articles_search_abstract_gin;
DROP INDEX IF EXISTS idx_articles_search_combined_gin;
DROP INDEX IF EXISTS idx_articles_keywords_gin;
DROP INDEX IF EXISTS idx_articles_authors_gin;
DROP INDEX IF EXISTS idx_articles_published_date;
DROP INDEX IF EXISTS idx_articles_volume_issue;
DROP INDEX IF EXISTS idx_articles_type;
DROP INDEX IF EXISTS idx_articles_language;
DROP INDEX IF EXISTS idx_articles_retracted;
DROP INDEX IF EXISTS idx_articles_search_composite;
DROP INDEX IF EXISTS idx_articles_search_type_date;

-- Remove added columns from articles table
ALTER TABLE articles 
DROP COLUMN IF EXISTS seo_title,
DROP COLUMN IF EXISTS seo_description,
DROP COLUMN IF EXISTS structured_data,
DROP COLUMN IF EXISTS social_media_image,
DROP COLUMN IF EXISTS reading_time_minutes,
DROP COLUMN IF EXISTS language_code,
DROP COLUMN IF EXISTS article_type,
DROP COLUMN IF EXISTS retraction_notice,
DROP COLUMN IF EXISTS correction_notice,
DROP COLUMN IF EXISTS is_retracted,
DROP COLUMN IF EXISTS has_corrections;

-- Drop new tables (in reverse order of dependencies)
DROP TABLE IF EXISTS supplementary_materials;
DROP TABLE IF EXISTS citations;
DROP TABLE IF EXISTS search_analytics;
DROP TABLE IF EXISTS editorial_events;
DROP TABLE IF EXISTS metric_events;
DROP TABLE IF EXISTS article_metrics;
DROP TABLE IF EXISTS dois;