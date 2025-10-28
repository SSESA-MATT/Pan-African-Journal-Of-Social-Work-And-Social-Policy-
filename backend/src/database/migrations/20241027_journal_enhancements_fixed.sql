-- Journal Enhancement Phase 1 Migration (Fixed for existing schema)
-- Adds tables for DOI management, article metrics, editorial calendar, and search analytics

-- First, let's check what type the articles.id column is and adjust accordingly
-- This version assumes articles.id is INTEGER (most common case)

-- DOI Management Table (Fixed to use INTEGER for article_id)
CREATE TABLE IF NOT EXISTS dois (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    doi_string VARCHAR(255) UNIQUE NOT NULL,
    registration_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (registration_status IN ('pending', 'registered', 'failed', 'updated')),
    registered_at TIMESTAMP WITH TIME ZONE,
    crossref_response JSONB,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Article Metrics Table (Fixed to use INTEGER for article_id)
CREATE TABLE IF NOT EXISTS article_metrics (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('view', 'download', 'citation', 'share')),
    count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}', -- stores geographic data, referrer info, etc.
    UNIQUE(article_id, metric_type)
);

-- Article Metric Events Table (Fixed to use INTEGER for article_id)
CREATE TABLE IF NOT EXISTS article_metric_events (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'download', 'citation', 'share')),
    user_session VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    country_code VARCHAR(2),
    city VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Editorial Calendar Events Table
CREATE TABLE IF NOT EXISTS editorial_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('submission', 'review_due', 'revision_due', 'publication', 'deadline', 'meeting', 'special_issue')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    manuscript_id INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search Analytics Table
CREATE TABLE IF NOT EXISTS search_analytics (
    id SERIAL PRIMARY KEY,
    search_query TEXT,
    filters_applied JSONB DEFAULT '{}',
    results_count INTEGER NOT NULL DEFAULT 0,
    response_time_ms INTEGER,
    user_session VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Article Keywords Table (for enhanced search indexing)
CREATE TABLE IF NOT EXISTS article_keywords (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0, -- for keyword importance weighting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, keyword)
);

-- Article Authors Table (for enhanced author search)
CREATE TABLE IF NOT EXISTS article_authors (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_order INTEGER NOT NULL DEFAULT 1,
    orcid_id VARCHAR(50),
    affiliation TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, author_order)
);

-- Citation Exports Table (for tracking citation downloads)
CREATE TABLE IF NOT EXISTS citation_exports (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    format VARCHAR(20) NOT NULL CHECK (format IN ('bibtex', 'endnote', 'ris', 'apa', 'mla', 'chicago')),
    user_session VARCHAR(255),
    ip_address INET,
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Related Articles Table (for recommendation system)
CREATE TABLE IF NOT EXISTS related_articles (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    related_article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,4) NOT NULL DEFAULT 0.0,
    relationship_type VARCHAR(50) DEFAULT 'keyword_similarity' 
        CHECK (relationship_type IN ('keyword_similarity', 'author_similarity', 'citation_similarity', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, related_article_id),
    CHECK (article_id != related_article_id)
);

-- Add missing columns to articles table if they don't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS volume_id INTEGER REFERENCES volumes(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dois_doi_string ON dois(doi_string);
CREATE INDEX IF NOT EXISTS idx_dois_registration_status ON dois(registration_status);
CREATE INDEX IF NOT EXISTS idx_article_metrics_type ON article_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_article_metric_events_article_id ON article_metric_events(article_id);
CREATE INDEX IF NOT EXISTS idx_article_metric_events_timestamp ON article_metric_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_article_metric_events_country ON article_metric_events(country_code);
CREATE INDEX IF NOT EXISTS idx_editorial_events_end_date ON editorial_events(end_date);
CREATE INDEX IF NOT EXISTS idx_editorial_events_assigned_to ON editorial_events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_editorial_events_status ON editorial_events(status);
CREATE INDEX IF NOT EXISTS idx_editorial_events_type ON editorial_events(event_type);
CREATE INDEX IF NOT EXISTS idx_editorial_events_submission_id ON editorial_events(submission_id);
CREATE INDEX IF NOT EXISTS idx_editorial_events_manuscript_id ON editorial_events(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics USING gin(to_tsvector('english', search_query));
CREATE INDEX IF NOT EXISTS idx_search_analytics_results_count ON search_analytics(results_count);
CREATE INDEX IF NOT EXISTS idx_article_keywords_keyword ON article_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_article_keywords_weight ON article_keywords(weight DESC);
CREATE INDEX IF NOT EXISTS idx_article_authors_name ON article_authors(author_name);
CREATE INDEX IF NOT EXISTS idx_article_authors_orcid ON article_authors(orcid_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_order ON article_authors(author_order);
CREATE INDEX IF NOT EXISTS idx_citation_exports_format ON citation_exports(format);
CREATE INDEX IF NOT EXISTS idx_citation_exports_exported_at ON citation_exports(exported_at DESC);
CREATE INDEX IF NOT EXISTS idx_related_articles_related_id ON related_articles(related_article_id);
CREATE INDEX IF NOT EXISTS idx_related_articles_score ON related_articles(similarity_score DESC);

-- Enhanced search indexes for articles table
CREATE INDEX IF NOT EXISTS idx_articles_search_title ON articles USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_articles_search_abstract ON articles USING gin(to_tsvector('english', abstract));
CREATE INDEX IF NOT EXISTS idx_articles_search_keywords ON articles USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_volume_issue ON articles(volume_id, issue_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_editorial_events_updated_at ON editorial_events;
CREATE TRIGGER update_editorial_events_updated_at
    BEFORE UPDATE ON editorial_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOI Generation Function
CREATE OR REPLACE FUNCTION generate_doi(p_article_id INTEGER)
RETURNS VARCHAR(255) AS $$
DECLARE
    v_year INTEGER;
    v_volume INTEGER;
    v_issue INTEGER;
    v_sequence INTEGER;
    v_doi_string VARCHAR(255);
BEGIN
    -- Get article publication info
    SELECT
        EXTRACT(YEAR FROM a.published_at),
        v.volume_number,
        i.issue_number
    INTO v_year, v_volume, v_issue
    FROM articles a
    JOIN issues i ON a.issue_id = i.id
    JOIN volumes v ON i.volume_id = v.id
    WHERE a.id = p_article_id;

    -- Get next sequence number for this issue
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(doi_string FROM 'pajswsp\.\d{4}\.\d{2}\.\d{2}\.(\d{3})') AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM dois d
    JOIN articles a ON d.article_id = a.id
    JOIN issues i ON a.issue_id = i.id
    JOIN volumes v ON i.volume_id = v.id
    WHERE v.volume_number = v_volume AND i.issue_number = v_issue;

    -- Format DOI string: 10.xxxx/pajswsp.YYYY.VV.II.NNN
    v_doi_string := FORMAT('10.xxxx/pajswsp.%s.%s.%s.%s',
        v_year,
        LPAD(v_volume::TEXT, 2, '0'),
        LPAD(v_issue::TEXT, 2, '0'),
        LPAD(v_sequence::TEXT, 3, '0')
    );

    RETURN v_doi_string;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically populate article_keywords and article_authors
CREATE OR REPLACE FUNCTION populate_article_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Clear existing data
    DELETE FROM article_keywords WHERE article_id = NEW.id;
    DELETE FROM article_authors WHERE article_id = NEW.id;

    -- Populate keywords if they exist
    IF NEW.keywords IS NOT NULL THEN
        INSERT INTO article_keywords (article_id, keyword)
        SELECT NEW.id, jsonb_array_elements_text(NEW.keywords);
    END IF;

    -- Populate authors if they exist
    IF NEW.authors IS NOT NULL THEN
        INSERT INTO article_authors (article_id, author_name, author_order)
        SELECT
            NEW.id,
            jsonb_array_elements_text(NEW.authors),
            ROW_NUMBER() OVER ()
        FROM jsonb_array_elements_text(NEW.authors);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for article metadata population
DROP TRIGGER IF EXISTS populate_article_metadata_trigger ON articles;
CREATE TRIGGER populate_article_metadata_trigger
    AFTER INSERT OR UPDATE OF keywords, authors ON articles
    FOR EACH ROW EXECUTE FUNCTION populate_article_metadata();

-- Add table comments
COMMENT ON TABLE article_metrics IS 'Aggregated metrics for article performance tracking';
COMMENT ON TABLE article_metric_events IS 'Individual metric events for detailed analytics';
COMMENT ON TABLE editorial_events IS 'Editorial calendar events and deadlines';
COMMENT ON TABLE search_analytics IS 'Search query analytics and performance tracking';
COMMENT ON TABLE article_keywords IS 'Normalized keywords for enhanced search indexing';
COMMENT ON TABLE article_authors IS 'Normalized author information for articles';
COMMENT ON TABLE citation_exports IS 'Citation export tracking for analytics';
COMMENT ON TABLE related_articles IS 'Article relationships for recommendation system';