-- CONSOLIDATED MIGRATION FOR JOURNAL ENHANCEMENTS
-- Date: 2024-10-27
-- Description: Complete migration including search functions, DOI system, and missing columns
-- Run this file in Supabase SQL Editor

-- =============================================================================
-- PART 1: ADD MISSING COLUMNS TO ARTICLES TABLE
-- =============================================================================

-- Add missing columns to articles table if they don't exist
DO $$ 
BEGIN
    -- Add article_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'article_type') THEN
        ALTER TABLE articles ADD COLUMN article_type VARCHAR(50) DEFAULT 'research_article';
        ALTER TABLE articles ADD CONSTRAINT valid_article_type 
            CHECK (article_type IN ('research_article', 'review_article', 'case_study', 'commentary', 'policy_brief', 'editorial'));
    END IF;

    -- Add language column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'language') THEN
        ALTER TABLE articles ADD COLUMN language VARCHAR(10) DEFAULT 'en';
    END IF;

    -- Add volume column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'volume') THEN
        ALTER TABLE articles ADD COLUMN volume INTEGER;
    END IF;

    -- Add issue column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'issue') THEN
        ALTER TABLE articles ADD COLUMN issue INTEGER;
    END IF;

    -- Add page_start column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'page_start') THEN
        ALTER TABLE articles ADD COLUMN page_start INTEGER;
    END IF;

    -- Add page_end column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'page_end') THEN
        ALTER TABLE articles ADD COLUMN page_end INTEGER;
    END IF;

    -- Add citation_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'citation_count') THEN
        ALTER TABLE articles ADD COLUMN citation_count INTEGER DEFAULT 0;
    END IF;

    -- Add view_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'view_count') THEN
        ALTER TABLE articles ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;

    -- Add download_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'download_count') THEN
        ALTER TABLE articles ADD COLUMN download_count INTEGER DEFAULT 0;
    END IF;

    -- Add is_open_access column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'is_open_access') THEN
        ALTER TABLE articles ADD COLUMN is_open_access BOOLEAN DEFAULT true;
    END IF;

    -- Add peer_reviewed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'peer_reviewed') THEN
        ALTER TABLE articles ADD COLUMN peer_reviewed BOOLEAN DEFAULT true;
    END IF;

    -- Add featured column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'featured') THEN
        ALTER TABLE articles ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;

    -- Add search_vector column for full-text search
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'search_vector') THEN
        ALTER TABLE articles ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- =============================================================================
-- PART 2: CREATE SEARCH FUNCTIONS
-- =============================================================================

-- Create or replace the search articles function
CREATE OR REPLACE FUNCTION search_articles(
    search_query TEXT DEFAULT NULL,
    article_types TEXT[] DEFAULT NULL,
    languages TEXT[] DEFAULT NULL,
    years INTEGER[] DEFAULT NULL,
    volumes INTEGER[] DEFAULT NULL,
    issues INTEGER[] DEFAULT NULL,
    authors_filter TEXT[] DEFAULT NULL,
    keywords_filter TEXT[] DEFAULT NULL,
    is_open_access_filter BOOLEAN DEFAULT NULL,
    is_peer_reviewed_filter BOOLEAN DEFAULT NULL,
    is_featured_filter BOOLEAN DEFAULT NULL,
    sort_by TEXT DEFAULT 'relevance',
    sort_order TEXT DEFAULT 'desc',
    page_limit INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    title TEXT,
    abstract TEXT,
    authors TEXT,
    keywords TEXT,
    publication_date DATE,
    article_type VARCHAR(50),
    language VARCHAR(10),
    volume INTEGER,
    issue INTEGER,
    page_start INTEGER,
    page_end INTEGER,
    citation_count INTEGER,
    view_count INTEGER,
    download_count INTEGER,
    is_open_access BOOLEAN,
    peer_reviewed BOOLEAN,
    featured BOOLEAN,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.abstract,
        a.authors,
        a.keywords,
        a.publication_date,
        a.article_type,
        a.language,
        a.volume,
        a.issue,
        a.page_start,
        a.page_end,
        a.citation_count,
        a.view_count,
        a.download_count,
        a.is_open_access,
        a.peer_reviewed,
        a.featured,
        CASE 
            WHEN search_query IS NOT NULL THEN
                ts_rank(
                    setweight(to_tsvector('english', COALESCE(a.title, '')), 'A') ||
                    setweight(to_tsvector('english', COALESCE(a.abstract, '')), 'B') ||
                    setweight(to_tsvector('english', COALESCE(a.keywords, '')), 'C') ||
                    setweight(to_tsvector('english', COALESCE(a.authors, '')), 'D'),
                    plainto_tsquery('english', search_query)
                )
            ELSE 0.0
        END::REAL as relevance_score
    FROM articles a
    WHERE 
        (search_query IS NULL OR (
            to_tsvector('english', COALESCE(a.title, '')) @@ plainto_tsquery('english', search_query) OR
            to_tsvector('english', COALESCE(a.abstract, '')) @@ plainto_tsquery('english', search_query) OR
            to_tsvector('english', COALESCE(a.keywords, '')) @@ plainto_tsquery('english', search_query) OR
            to_tsvector('english', COALESCE(a.authors, '')) @@ plainto_tsquery('english', search_query)
        ))
        AND (article_types IS NULL OR a.article_type = ANY(article_types))
        AND (languages IS NULL OR a.language = ANY(languages))
        AND (years IS NULL OR EXTRACT(YEAR FROM a.publication_date) = ANY(years))
        AND (volumes IS NULL OR a.volume = ANY(volumes))
        AND (issues IS NULL OR a.issue = ANY(issues))
        AND (authors_filter IS NULL OR EXISTS (
            SELECT 1 FROM unnest(string_to_array(a.authors, ',')) AS author_name
            WHERE TRIM(LOWER(author_name)) = ANY(SELECT LOWER(TRIM(unnest(authors_filter))))
        ))
        AND (keywords_filter IS NULL OR EXISTS (
            SELECT 1 FROM unnest(string_to_array(a.keywords, ',')) AS keyword
            WHERE TRIM(LOWER(keyword)) = ANY(SELECT LOWER(TRIM(unnest(keywords_filter))))
        ))
        AND (is_open_access_filter IS NULL OR a.is_open_access = is_open_access_filter)
        AND (is_peer_reviewed_filter IS NULL OR a.peer_reviewed = is_peer_reviewed_filter)
        AND (is_featured_filter IS NULL OR a.featured = is_featured_filter)
        AND a.status = 'published'
    ORDER BY
        CASE 
            WHEN sort_by = 'relevance' AND search_query IS NOT NULL THEN
                ts_rank(
                    setweight(to_tsvector('english', COALESCE(a.title, '')), 'A') ||
                    setweight(to_tsvector('english', COALESCE(a.abstract, '')), 'B') ||
                    setweight(to_tsvector('english', COALESCE(a.keywords, '')), 'C') ||
                    setweight(to_tsvector('english', COALESCE(a.authors, '')), 'D'),
                    plainto_tsquery('english', search_query)
                )
            ELSE 0
        END DESC,
        CASE WHEN sort_by = 'date' AND sort_order = 'desc' THEN a.publication_date END DESC,
        CASE WHEN sort_by = 'date' AND sort_order = 'asc' THEN a.publication_date END ASC,
        CASE WHEN sort_by = 'title' AND sort_order = 'desc' THEN a.title END DESC,
        CASE WHEN sort_by = 'title' AND sort_order = 'asc' THEN a.title END ASC,
        CASE WHEN sort_by = 'citations' AND sort_order = 'desc' THEN a.citation_count END DESC,
        CASE WHEN sort_by = 'citations' AND sort_order = 'asc' THEN a.citation_count END ASC,
        CASE WHEN sort_by = 'views' AND sort_order = 'desc' THEN a.view_count END DESC,
        CASE WHEN sort_by = 'views' AND sort_order = 'asc' THEN a.view_count END ASC,
        a.publication_date DESC
    LIMIT page_limit OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Create search suggestions function
CREATE OR REPLACE FUNCTION get_search_suggestions(
    partial_query TEXT,
    suggestion_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    suggestion TEXT,
    type TEXT,
    count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH title_suggestions AS (
        SELECT 
            a.title as suggestion,
            'title' as type,
            1 as count
        FROM articles a
        WHERE a.title ILIKE '%' || partial_query || '%'
        AND a.status = 'published'
        ORDER BY LENGTH(a.title)
        LIMIT suggestion_limit / 4
    ),
    author_suggestions AS (
        SELECT DISTINCT
            TRIM(author_name) as suggestion,
            'author' as type,
            COUNT(*)::INTEGER as count
        FROM articles a,
        unnest(string_to_array(a.authors, ',')) as author_name
        WHERE TRIM(author_name) ILIKE '%' || partial_query || '%'
        AND a.status = 'published'
        GROUP BY TRIM(author_name)
        ORDER BY count DESC
        LIMIT suggestion_limit / 4
    ),
    keyword_suggestions AS (
        SELECT DISTINCT
            TRIM(keyword) as suggestion,
            'keyword' as type,
            COUNT(*)::INTEGER as count
        FROM articles a,
        unnest(string_to_array(a.keywords, ',')) as keyword
        WHERE TRIM(keyword) ILIKE '%' || partial_query || '%'
        AND a.status = 'published'
        GROUP BY TRIM(keyword)
        ORDER BY count DESC
        LIMIT suggestion_limit / 4
    ),
    content_suggestions AS (
        SELECT DISTINCT
            LEFT(a.title, 100) as suggestion,
            'content' as type,
            1 as count
        FROM articles a
        WHERE (
            to_tsvector('english', a.title) @@ plainto_tsquery('english', partial_query) OR
            to_tsvector('english', a.abstract) @@ plainto_tsquery('english', partial_query)
        )
        AND a.status = 'published'
        ORDER BY ts_rank(to_tsvector('english', a.title), plainto_tsquery('english', partial_query)) DESC
        LIMIT suggestion_limit / 4
    )
    SELECT * FROM title_suggestions
    UNION ALL
    SELECT * FROM author_suggestions
    UNION ALL
    SELECT * FROM keyword_suggestions
    UNION ALL
    SELECT * FROM content_suggestions
    ORDER BY count DESC, LENGTH(suggestion)
    LIMIT suggestion_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PART 3: CREATE DOI SYSTEM TABLES
-- =============================================================================

-- Create DOI registrations table
CREATE TABLE IF NOT EXISTS doi_registrations (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    doi VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    registration_date TIMESTAMP,
    crossref_response JSONB,
    metadata JSONB NOT NULL,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_doi_format CHECK (doi ~ '^10\.\d{4,}/pajswsp\.\d{4}\.\d{2}\.\d{2}\.\d{3}$'),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'registered', 'failed', 'updating'))
);

-- Create DOI generation tracking table
CREATE TABLE IF NOT EXISTS doi_sequences (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    volume INTEGER NOT NULL,
    issue INTEGER NOT NULL,
    last_article_number INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(year, volume, issue),
    CONSTRAINT valid_year CHECK (year >= 2000 AND year <= 2100),
    CONSTRAINT valid_volume CHECK (volume >= 1 AND volume <= 99),
    CONSTRAINT valid_issue CHECK (issue >= 1 AND issue <= 99),
    CONSTRAINT valid_article_number CHECK (last_article_number >= 0 AND last_article_number <= 999)
);

-- Add DOI columns to articles table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'doi') THEN
        ALTER TABLE articles ADD COLUMN doi VARCHAR(255) UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'doi_status') THEN
        ALTER TABLE articles ADD COLUMN doi_status VARCHAR(50) DEFAULT 'none';
        ALTER TABLE articles ADD CONSTRAINT valid_doi_status 
            CHECK (doi_status IN ('none', 'pending', 'registered', 'failed'));
    END IF;
END $$;

-- =============================================================================
-- PART 4: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Create indexes for articles table
CREATE INDEX IF NOT EXISTS idx_articles_article_type ON articles(article_type);
CREATE INDEX IF NOT EXISTS idx_articles_language ON articles(language);
CREATE INDEX IF NOT EXISTS idx_articles_volume ON articles(volume);
CREATE INDEX IF NOT EXISTS idx_articles_issue ON articles(issue);
CREATE INDEX IF NOT EXISTS idx_articles_publication_date ON articles(publication_date);
CREATE INDEX IF NOT EXISTS idx_articles_citation_count ON articles(citation_count);
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count);
CREATE INDEX IF NOT EXISTS idx_articles_is_open_access ON articles(is_open_access);
CREATE INDEX IF NOT EXISTS idx_articles_peer_reviewed ON articles(peer_reviewed);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_doi ON articles(doi);
CREATE INDEX IF NOT EXISTS idx_articles_doi_status ON articles(doi_status);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_articles_search_vector ON articles USING gin(search_vector);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_status_date ON articles(status, publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_type_status ON articles(article_type, status);
CREATE INDEX IF NOT EXISTS idx_articles_featured_status ON articles(featured, status) WHERE featured = true;

-- Create indexes for DOI tables
CREATE INDEX IF NOT EXISTS idx_doi_registrations_article_id ON doi_registrations(article_id);
CREATE INDEX IF NOT EXISTS idx_doi_registrations_doi ON doi_registrations(doi);
CREATE INDEX IF NOT EXISTS idx_doi_registrations_status ON doi_registrations(status);
CREATE INDEX IF NOT EXISTS idx_doi_registrations_created_at ON doi_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_doi_sequences_year_volume_issue ON doi_sequences(year, volume, issue);

-- =============================================================================
-- PART 5: CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_doi_registrations_updated_at ON doi_registrations;
CREATE TRIGGER update_doi_registrations_updated_at
    BEFORE UPDATE ON doi_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doi_sequences_updated_at ON doi_sequences;
CREATE TRIGGER update_doi_sequences_updated_at
    BEFORE UPDATE ON doi_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get next DOI number
CREATE OR REPLACE FUNCTION get_next_doi_number(
    p_year INTEGER,
    p_volume INTEGER,
    p_issue INTEGER
) RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    INSERT INTO doi_sequences (year, volume, issue, last_article_number)
    VALUES (p_year, p_volume, p_issue, 1)
    ON CONFLICT (year, volume, issue)
    DO UPDATE SET 
        last_article_number = doi_sequences.last_article_number + 1,
        updated_at = CURRENT_TIMESTAMP
    RETURNING last_article_number INTO next_number;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate DOI string
CREATE OR REPLACE FUNCTION generate_doi(
    p_prefix VARCHAR DEFAULT '10.5555',
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    p_volume INTEGER DEFAULT 1,
    p_issue INTEGER DEFAULT 1
) RETURNS VARCHAR AS $$
DECLARE
    article_number INTEGER;
    doi_string VARCHAR;
BEGIN
    article_number := get_next_doi_number(p_year, p_volume, p_issue);
    
    doi_string := p_prefix || '/pajswsp.' || 
                  p_year || '.' ||
                  LPAD(p_volume::TEXT, 2, '0') || '.' ||
                  LPAD(p_issue::TEXT, 2, '0') || '.' ||
                  LPAD(article_number::TEXT, 3, '0');
    
    RETURN doi_string;
END;
$$ LANGUAGE plpgsql;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_article_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.abstract, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.keywords, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.authors, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS update_articles_search_vector ON articles;
CREATE TRIGGER update_articles_search_vector
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_article_search_vector();

-- =============================================================================
-- PART 6: UPDATE EXISTING DATA
-- =============================================================================

-- Update search vectors for existing articles
UPDATE articles 
SET search_vector = 
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(abstract, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(keywords, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(authors, '')), 'D')
WHERE search_vector IS NULL;

-- Set default values for new columns where needed
UPDATE articles SET article_type = 'research_article' WHERE article_type IS NULL;
UPDATE articles SET language = 'en' WHERE language IS NULL;
UPDATE articles SET citation_count = 0 WHERE citation_count IS NULL;
UPDATE articles SET view_count = 0 WHERE view_count IS NULL;
UPDATE articles SET download_count = 0 WHERE download_count IS NULL;
UPDATE articles SET is_open_access = true WHERE is_open_access IS NULL;
UPDATE articles SET peer_reviewed = true WHERE peer_reviewed IS NULL;
UPDATE articles SET featured = false WHERE featured IS NULL;
UPDATE articles SET doi_status = 'none' WHERE doi_status IS NULL;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Create a view for easy DOI status checking
CREATE OR REPLACE VIEW doi_registration_status AS
SELECT 
    a.id as article_id,
    a.title,
    a.doi,
    a.doi_status,
    a.publication_date,
    a.volume,
    a.issue,
    dr.id as registration_id,
    dr.status as registration_status,
    dr.registration_date,
    dr.error_message,
    dr.retry_count,
    dr.created_at as registration_created_at,
    dr.updated_at as registration_updated_at
FROM articles a
LEFT JOIN doi_registrations dr ON a.id = dr.article_id
WHERE a.doi IS NOT NULL OR dr.id IS NOT NULL;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully at %', NOW();
    RAISE NOTICE 'Added columns: article_type, language, volume, issue, page_start, page_end, citation_count, view_count, download_count, is_open_access, peer_reviewed, featured, search_vector, doi, doi_status';
    RAISE NOTICE 'Created tables: doi_registrations, doi_sequences';
    RAISE NOTICE 'Created functions: search_articles, get_search_suggestions, generate_doi, get_next_doi_number';
    RAISE NOTICE 'Created indexes for performance optimization';
    RAISE NOTICE 'Updated existing data with default values';
END $$;