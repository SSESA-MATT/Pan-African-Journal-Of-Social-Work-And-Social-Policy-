-- Journal Enhancement Phase 1 Migration
-- Adds tables for DOI management, article metrics, editorial calendar, and search analytics

-- DOI Management Table
CREATE TABLE dois (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    doi_string VARCHAR(255) UNIQUE NOT NULL,
    registration_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (registration_status IN ('pending', 'registered', 'failed', 'updated')),
    registered_at TIMESTAMP WITH TIME ZONE,
    crossref_response JSONB,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Article Metrics Table
CREATE TABLE article_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('view', 'download', 'citation', 'share')),
    count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}', -- stores geographic data, referrer info, etc.
    UNIQUE(article_id, metric_type)
);

-- Article Metric Events Table (for detailed tracking)
CREATE TABLE article_metric_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
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
CREATE TABLE editorial_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('submission', 'review_due', 'revision_due', 'publication', 'deadline', 'meeting', 'special_issue')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    priority VARCHAR(20) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    reminder_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search Analytics Table
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_query TEXT NOT NULL,
    filters_applied JSONB DEFAULT '{}',
    results_count INTEGER NOT NULL DEFAULT 0,
    user_session VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    search_time_ms INTEGER, -- search execution time in milliseconds
    clicked_results JSONB DEFAULT '[]', -- array of clicked article IDs
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Article Keywords Table (for better search indexing)
CREATE TABLE article_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0, -- keyword importance weight
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, keyword)
);

-- Article Authors Table (normalized author information)
CREATE TABLE article_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255),
    orcid_id VARCHAR(50),
    affiliation VARCHAR(500),
    author_order INTEGER NOT NULL, -- order of authorship
    corresponding_author BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, author_order)
);

-- Citation Exports Table (track citation downloads)
CREATE TABLE citation_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    format VARCHAR(20) NOT NULL CHECK (format IN ('bibtex', 'endnote', 'ris', 'apa', 'chicago', 'mla')),
    user_session VARCHAR(255),
    ip_address INET,
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Related Articles Table (for recommendation system)
CREATE TABLE related_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    related_article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,4) NOT NULL DEFAULT 0.0, -- 0.0 to 1.0
    relationship_type VARCHAR(50) DEFAULT 'keyword_similarity' 
        CHECK (relationship_type IN ('keyword_similarity', 'author_similarity', 'citation_similarity', 'manual_curation')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, related_article_id),
    CHECK (article_id != related_article_id)
);

-- Add missing columns to existing articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS keywords JSONB DEFAULT '[]';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS volume_id UUID REFERENCES volumes(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update submissions table to include published status
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check_updated 
    CHECK (status IN ('submitted', 'under_review', 'revisions_required', 'accepted', 'rejected', 'published'));

-- Create indexes for performance optimization

-- DOI indexes
CREATE INDEX idx_dois_article_id ON dois(article_id);
CREATE INDEX idx_dois_doi_string ON dois(doi_string);
CREATE INDEX idx_dois_registration_status ON dois(registration_status);

-- Article metrics indexes
CREATE INDEX idx_article_metrics_article_id ON article_metrics(article_id);
CREATE INDEX idx_article_metrics_type ON article_metrics(metric_type);
CREATE INDEX idx_article_metric_events_article_id ON article_metric_events(article_id);
CREATE INDEX idx_article_metric_events_timestamp ON article_metric_events(timestamp DESC);
CREATE INDEX idx_article_metric_events_country ON article_metric_events(country_code);

-- Editorial calendar indexes
CREATE INDEX idx_editorial_events_start_date ON editorial_events(start_date);
CREATE INDEX idx_editorial_events_end_date ON editorial_events(end_date);
CREATE INDEX idx_editorial_events_assigned_to ON editorial_events(assigned_to);
CREATE INDEX idx_editorial_events_status ON editorial_events(status);
CREATE INDEX idx_editorial_events_type ON editorial_events(event_type);
CREATE INDEX idx_editorial_events_submission_id ON editorial_events(submission_id);
CREATE INDEX idx_editorial_events_manuscript_id ON editorial_events(manuscript_id);

-- Search analytics indexes
CREATE INDEX idx_search_analytics_timestamp ON search_analytics(timestamp DESC);
CREATE INDEX idx_search_analytics_query ON search_analytics USING gin(to_tsvector('english', search_query));
CREATE INDEX idx_search_analytics_results_count ON search_analytics(results_count);

-- Article keywords indexes
CREATE INDEX idx_article_keywords_article_id ON article_keywords(article_id);
CREATE INDEX idx_article_keywords_keyword ON article_keywords(keyword);
CREATE INDEX idx_article_keywords_weight ON article_keywords(weight DESC);

-- Article authors indexes
CREATE INDEX idx_article_authors_article_id ON article_authors(article_id);
CREATE INDEX idx_article_authors_name ON article_authors(author_name);
CREATE INDEX idx_article_authors_orcid ON article_authors(orcid_id);
CREATE INDEX idx_article_authors_order ON article_authors(author_order);

-- Citation exports indexes
CREATE INDEX idx_citation_exports_article_id ON citation_exports(article_id);
CREATE INDEX idx_citation_exports_format ON citation_exports(format);
CREATE INDEX idx_citation_exports_exported_at ON citation_exports(exported_at DESC);

-- Related articles indexes
CREATE INDEX idx_related_articles_article_id ON related_articles(article_id);
CREATE INDEX idx_related_articles_related_id ON related_articles(related_article_id);
CREATE INDEX idx_related_articles_score ON related_articles(similarity_score DESC);

-- Enhanced search indexes for articles
CREATE INDEX idx_articles_search_title ON articles USING gin(to_tsvector('english', title));
CREATE INDEX idx_articles_search_abstract ON articles USING gin(to_tsvector('english', abstract));
CREATE INDEX idx_articles_search_keywords ON articles USING gin(keywords);
CREATE INDEX idx_articles_published_date ON articles(published_at DESC);
CREATE INDEX idx_articles_volume_issue ON articles(volume_id, issue_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_dois_updated_at 
    BEFORE UPDATE ON dois 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_editorial_events_updated_at 
    BEFORE UPDATE ON editorial_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries

-- Article metrics summary view
CREATE VIEW article_metrics_summary AS
SELECT 
    a.id as article_id,
    a.title,
    a.published_at,
    COALESCE(views.count, 0) as view_count,
    COALESCE(downloads.count, 0) as download_count,
    COALESCE(citations.count, 0) as citation_count,
    COALESCE(shares.count, 0) as share_count,
    GREATEST(
        COALESCE(views.last_updated, a.published_at),
        COALESCE(downloads.last_updated, a.published_at),
        COALESCE(citations.last_updated, a.published_at),
        COALESCE(shares.last_updated, a.published_at)
    ) as metrics_last_updated
FROM articles a
LEFT JOIN article_metrics views ON a.id = views.article_id AND views.metric_type = 'view'
LEFT JOIN article_metrics downloads ON a.id = downloads.article_id AND downloads.metric_type = 'download'
LEFT JOIN article_metrics citations ON a.id = citations.article_id AND citations.metric_type = 'citation'
LEFT JOIN article_metrics shares ON a.id = shares.article_id AND shares.metric_type = 'share';

-- Editorial calendar upcoming events view
CREATE VIEW upcoming_editorial_events AS
SELECT 
    ee.*,
    u.first_name || ' ' || u.last_name as assigned_to_name,
    s.title as submission_title,
    m.title as manuscript_title,
    CASE 
        WHEN ee.start_date < CURRENT_TIMESTAMP THEN 'overdue'
        WHEN ee.start_date <= CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'upcoming'
    END as urgency_status
FROM editorial_events ee
LEFT JOIN users u ON ee.assigned_to = u.id
LEFT JOIN submissions s ON ee.submission_id = s.id
LEFT JOIN manuscripts m ON ee.manuscript_id = m.id
WHERE ee.status IN ('pending', 'in_progress')
    AND ee.start_date >= CURRENT_TIMESTAMP - INTERVAL '1 day'
ORDER BY ee.start_date ASC;

-- Search analytics summary view
CREATE VIEW search_analytics_summary AS
SELECT 
    DATE_TRUNC('day', timestamp) as search_date,
    COUNT(*) as total_searches,
    COUNT(DISTINCT user_session) as unique_sessions,
    AVG(results_count) as avg_results_count,
    AVG(search_time_ms) as avg_search_time_ms,
    COUNT(*) FILTER (WHERE results_count = 0) as zero_result_searches,
    COUNT(*) FILTER (WHERE jsonb_array_length(clicked_results) > 0) as searches_with_clicks
FROM search_analytics
GROUP BY DATE_TRUNC('day', timestamp)
ORDER BY search_date DESC;

-- Functions for metrics management

-- Function to increment article metrics
CREATE OR REPLACE FUNCTION increment_article_metric(
    p_article_id UUID,
    p_metric_type VARCHAR(50),
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    -- Insert or update the metric count
    INSERT INTO article_metrics (article_id, metric_type, count, metadata)
    VALUES (p_article_id, p_metric_type, 1, p_metadata)
    ON CONFLICT (article_id, metric_type)
    DO UPDATE SET 
        count = article_metrics.count + 1,
        last_updated = CURRENT_TIMESTAMP,
        metadata = COALESCE(article_metrics.metadata, '{}') || p_metadata;
    
    -- Insert the individual event
    INSERT INTO article_metric_events (article_id, event_type, metadata)
    VALUES (p_article_id, p_metric_type, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- Function to generate DOI string
CREATE OR REPLACE FUNCTION generate_doi_string(
    p_article_id UUID
)
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
    
    -- Get next sequence number for this volume/issue
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(doi_string FROM 'pajswsp\.\d{4}\.\d{2}\.\d{2}\.(\d{3})$') AS INTEGER)
    ), 0) + 1
    INTO v_sequence
    FROM dois d
    JOIN articles a ON d.article_id = a.id
    JOIN issues i ON a.issue_id = i.id
    JOIN volumes vol ON i.volume_id = vol.id
    WHERE vol.volume_number = v_volume AND i.issue_number = v_issue;
    
    -- Format DOI string: 10.xxxx/pajswsp.YYYY.VV.II.NNN
    v_doi_string := FORMAT('10.5555/pajswsp.%s.%s.%s.%s', 
        v_year, 
        LPAD(v_volume::TEXT, 2, '0'),
        LPAD(v_issue::TEXT, 2, '0'),
        LPAD(v_sequence::TEXT, 3, '0')
    );
    
    RETURN v_doi_string;
END;
$$ LANGUAGE plpgsql;

-- Function to update article search index
CREATE OR REPLACE FUNCTION update_article_search_index()
RETURNS TRIGGER AS $$
BEGIN
    -- Update keywords table
    DELETE FROM article_keywords WHERE article_id = NEW.id;
    
    IF NEW.keywords IS NOT NULL THEN
        INSERT INTO article_keywords (article_id, keyword)
        SELECT NEW.id, jsonb_array_elements_text(NEW.keywords);
    END IF;
    
    -- Update authors table
    DELETE FROM article_authors WHERE article_id = NEW.id;
    
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

-- Create trigger for article search index updates
CREATE TRIGGER update_article_search_index_trigger
    AFTER INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_article_search_index();

-- Insert initial data for testing (optional)
-- This will be handled by the seeding script

COMMENT ON TABLE dois IS 'Digital Object Identifiers for published articles';
COMMENT ON TABLE article_metrics IS 'Aggregated metrics for article performance tracking';
COMMENT ON TABLE article_metric_events IS 'Individual metric events for detailed analytics';
COMMENT ON TABLE editorial_events IS 'Editorial calendar events and deadlines';
COMMENT ON TABLE search_analytics IS 'Search query analytics and performance tracking';
COMMENT ON TABLE article_keywords IS 'Normalized keywords for enhanced search indexing';
COMMENT ON TABLE article_authors IS 'Normalized author information for articles';
COMMENT ON TABLE citation_exports IS 'Citation export tracking for analytics';
COMMENT ON TABLE related_articles IS 'Article relationships for recommendation system';