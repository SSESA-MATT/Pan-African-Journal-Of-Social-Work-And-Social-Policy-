-- ROLLBACK SCRIPT FOR CONSOLIDATED MIGRATION
-- Date: 2024-10-27
-- Description: Rollback script to undo the consolidated migration changes
-- WARNING: This will remove data and cannot be undone!

-- =============================================================================
-- ROLLBACK PART 6: DROP VIEWS
-- =============================================================================

DROP VIEW IF EXISTS doi_registration_status;

-- =============================================================================
-- ROLLBACK PART 5: DROP FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS update_articles_search_vector ON articles;
DROP TRIGGER IF EXISTS update_doi_registrations_updated_at ON doi_registrations;
DROP TRIGGER IF EXISTS update_doi_sequences_updated_at ON doi_sequences;

-- Drop functions
DROP FUNCTION IF EXISTS update_article_search_vector();
DROP FUNCTION IF EXISTS generate_doi(VARCHAR, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_next_doi_number(INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_search_suggestions(TEXT, INTEGER);
DROP FUNCTION IF EXISTS search_articles(TEXT, TEXT[], TEXT[], INTEGER[], INTEGER[], INTEGER[], TEXT[], TEXT[], BOOLEAN, BOOLEAN, BOOLEAN, TEXT, TEXT, INTEGER, INTEGER);

-- =============================================================================
-- ROLLBACK PART 4: DROP INDEXES
-- =============================================================================

-- Drop DOI table indexes
DROP INDEX IF EXISTS idx_doi_sequences_year_volume_issue;
DROP INDEX IF EXISTS idx_doi_registrations_created_at;
DROP INDEX IF EXISTS idx_doi_registrations_status;
DROP INDEX IF EXISTS idx_doi_registrations_doi;
DROP INDEX IF EXISTS idx_doi_registrations_article_id;

-- Drop composite indexes
DROP INDEX IF EXISTS idx_articles_featured_status;
DROP INDEX IF EXISTS idx_articles_type_status;
DROP INDEX IF EXISTS idx_articles_status_date;

-- Drop search index
DROP INDEX IF EXISTS idx_articles_search_vector;

-- Drop single column indexes
DROP INDEX IF EXISTS idx_articles_doi_status;
DROP INDEX IF EXISTS idx_articles_doi;
DROP INDEX IF EXISTS idx_articles_status;
DROP INDEX IF EXISTS idx_articles_featured;
DROP INDEX IF EXISTS idx_articles_peer_reviewed;
DROP INDEX IF EXISTS idx_articles_is_open_access;
DROP INDEX IF EXISTS idx_articles_view_count;
DROP INDEX IF EXISTS idx_articles_citation_count;
DROP INDEX IF EXISTS idx_articles_publication_date;
DROP INDEX IF EXISTS idx_articles_issue;
DROP INDEX IF EXISTS idx_articles_volume;
DROP INDEX IF EXISTS idx_articles_language;
DROP INDEX IF EXISTS idx_articles_article_type;

-- =============================================================================
-- ROLLBACK PART 3: DROP DOI TABLES
-- =============================================================================

-- Drop DOI tables
DROP TABLE IF EXISTS doi_sequences CASCADE;
DROP TABLE IF EXISTS doi_registrations CASCADE;

-- =============================================================================
-- ROLLBACK PART 1: REMOVE COLUMNS FROM ARTICLES TABLE
-- =============================================================================

-- Remove DOI columns
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'doi_status') THEN
        ALTER TABLE articles DROP CONSTRAINT IF EXISTS valid_doi_status;
        ALTER TABLE articles DROP COLUMN doi_status;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'doi') THEN
        ALTER TABLE articles DROP COLUMN doi;
    END IF;

    -- Remove other added columns
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'search_vector') THEN
        ALTER TABLE articles DROP COLUMN search_vector;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'featured') THEN
        ALTER TABLE articles DROP COLUMN featured;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'peer_reviewed') THEN
        ALTER TABLE articles DROP COLUMN peer_reviewed;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'is_open_access') THEN
        ALTER TABLE articles DROP COLUMN is_open_access;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'download_count') THEN
        ALTER TABLE articles DROP COLUMN download_count;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'view_count') THEN
        ALTER TABLE articles DROP COLUMN view_count;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'citation_count') THEN
        ALTER TABLE articles DROP COLUMN citation_count;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'page_end') THEN
        ALTER TABLE articles DROP COLUMN page_end;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'page_start') THEN
        ALTER TABLE articles DROP COLUMN page_start;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'issue') THEN
        ALTER TABLE articles DROP COLUMN issue;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'volume') THEN
        ALTER TABLE articles DROP COLUMN volume;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'language') THEN
        ALTER TABLE articles DROP COLUMN language;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'articles' AND column_name = 'article_type') THEN
        ALTER TABLE articles DROP CONSTRAINT IF EXISTS valid_article_type;
        ALTER TABLE articles DROP COLUMN article_type;
    END IF;
END $$;

-- =============================================================================
-- ROLLBACK COMPLETE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Rollback completed at %', NOW();
    RAISE NOTICE 'Removed all columns, tables, functions, indexes, and triggers added by the migration';
    RAISE NOTICE 'WARNING: All DOI registration data has been permanently deleted!';
END $$;