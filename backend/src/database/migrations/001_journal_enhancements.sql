-- Journal Enhancement Phase 1: Database Schema Enhancements
-- Migration: 001_journal_enhancements.sql
-- Description: Add tables for DOIs, metrics, editorial calendar, and search analytics

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DOI Management Table
CREATE TABLE IF NOT EXISTS dois (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    doi_string VARCHAR(255) UNIQUE NOT NULL,
    registration_status VARCHAR(50) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'registered', 'failed', 'updated')),
    registered_at TIMESTAMP WITH TIME ZONE,
    crossref_response JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for DOI lookups
CREATE INDEX IF NOT EXISTS idx_dois_article_id ON dois(article_id);
CREATE INDEX IF NOT EXISTS idx_dois_string ON dois(doi_string);
CREATE INDEX IF NOT EXISTS idx_dois_status ON dois(registration_status);

-- Article Metrics Table
CREATE TABLE IF NOT EXISTS article_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('view', 'download', 'citation', 'share')),
    count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB, -- geographic data, referrer info, user agent, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, metric_type)
);

-- Create indexes for metrics queries
CREATE INDEX IF NOT EXISTS idx_article_metrics_article_id ON article_metrics(article_id);
CREATE INDEX IF NOT EXISTS idx_article_metrics_type ON article_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_article_metrics_updated ON article_metrics(last_updated DESC);

-- Detailed Metrics Events Table (for tracking individual events)
CREATE TABLE IF NOT EXISTS metric_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'download', 'citation', 'share')),
    user_session VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    country_code VARCHAR(2),
    city VARCHAR(100),
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for event tracking
CREATE INDEX IF NOT EXISTS idx_metric_events_article_id ON metric_events(article_id);
CREATE INDEX IF NOT EXISTS idx_metric_events_type ON metric_events(event_type);
CREATE INDEX IF NOT EXISTS idx_metric_events_timestamp ON metric_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metric_events_session ON metric_events(user_session);

-- Editorial Calendar Events Table
CREATE TABLE IF NOT EXISTS editorial_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('submission', 'review_due', 'revision_due', 'publication', 'deadline', 'meeting', 'reminder')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    reminder_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for calendar queries
CREATE INDEX IF NOT EXISTS idx_editorial_events_start_date ON editorial_events(start_date);
CREATE INDEX IF NOT EXISTS idx_editorial_events_end_date ON editorial_events(end_date);
CREATE INDEX IF NOT EXISTS idx_editorial_events_type ON editorial_events(event_type);
CREATE INDEX IF NOT EXISTS idx_editorial_events_status ON editorial_events(status);
CREATE INDEX IF NOT EXISTS idx_editorial_events_assigned_to ON editorial_events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_editorial_events_submission_id ON editorial_events(submission_id);
CREATE INDEX IF NOT EXISTS idx_editorial_events_priority ON editorial_events(priority);

-- Search Analytics Table
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_query TEXT NOT NULL,
    filters_applied JSONB,
    results_count INTEGER DEFAULT 0,
    user_session VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    response_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for search analytics
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics USING gin(to_tsvector('english', search_query));
CREATE INDEX IF NOT EXISTS idx_search_analytics_timestamp ON search_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_session ON search_analytics(user_session);

-- Citation Tracking Table
CREATE TABLE IF NOT EXISTS citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    citing_work_title TEXT,
    citing_work_authors TEXT[],
    citing_work_doi VARCHAR(255),
    citing_work_url TEXT,
    citation_context TEXT,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100), -- 'crossref', 'google_scholar', 'manual', etc.
    verified BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for citation tracking
CREATE INDEX IF NOT EXISTS idx_citations_article_id ON citations(article_id);
CREATE INDEX IF NOT EXISTS idx_citations_discovered_at ON citations(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_citations_source ON citations(source);
CREATE INDEX IF NOT EXISTS idx_citations_verified ON citations(verified);

-- Article Supplementary Materials Table
CREATE TABLE IF NOT EXISTS supplementary_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(100),
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for supplementary materials
CREATE INDEX IF NOT EXISTS idx_supplementary_materials_article_id ON supplementary_materials(article_id);
CREATE INDEX IF NOT EXISTS idx_supplementary_materials_public ON supplementary_materials(is_public);

-- Update existing articles table with new fields for enhanced functionality
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS structured_data JSONB,
ADD COLUMN IF NOT EXISTS social_media_image TEXT,
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS language_code VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS article_type VARCHAR(50) DEFAULT 'research_article' CHECK (article_type IN ('research_article', 'review_article', 'case_study', 'brief_communication', 'commentary', 'policy_brief', 'practice_note', 'student_voice')),
ADD COLUMN IF NOT EXISTS retraction_notice TEXT,
ADD COLUMN IF NOT EXISTS correction_notice TEXT,
ADD COLUMN IF NOT EXISTS is_retracted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_corrections BOOLEAN DEFAULT FALSE;

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
DROP TRIGGER IF EXISTS update_dois_updated_at ON dois;
CREATE TRIGGER update_dois_updated_at BEFORE UPDATE ON dois FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_editorial_events_updated_at ON editorial_events;
CREATE TRIGGER update_editorial_events_updated_at BEFORE UPDATE ON editorial_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_supplementary_materials_updated_at ON supplementary_materials;
CREATE TRIGGER update_supplementary_materials_updated_at BEFORE UPDATE ON supplementary_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update article metrics
CREATE OR REPLACE FUNCTION update_article_metrics(
    p_article_id UUID,
    p_metric_type VARCHAR(50),
    p_increment INTEGER DEFAULT 1,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO article_metrics (article_id, metric_type, count, metadata)
    VALUES (p_article_id, p_metric_type, p_increment, p_metadata)
    ON CONFLICT (article_id, metric_type)
    DO UPDATE SET 
        count = article_metrics.count + p_increment,
        last_updated = NOW(),
        metadata = COALESCE(p_metadata, article_metrics.metadata);
END;
$$ LANGUAGE plpgsql;

-- Create function to log metric events
CREATE OR REPLACE FUNCTION log_metric_event(
    p_article_id UUID,
    p_event_type VARCHAR(50),
    p_user_session VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_country_code VARCHAR(2) DEFAULT NULL,
    p_city VARCHAR(100) DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO metric_events (
        article_id, event_type, user_session, ip_address, user_agent, 
        referrer, country_code, city, metadata
    )
    VALUES (
        p_article_id, p_event_type, p_user_session, p_ip_address, p_user_agent,
        p_referrer, p_country_code, p_city, p_metadata
    );
    
    -- Update aggregated metrics
    PERFORM update_article_metrics(p_article_id, p_event_type, 1, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better search performance on existing tables
CREATE INDEX IF NOT EXISTS idx_articles_search_title_gin ON articles USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_articles_search_abstract_gin ON articles USING gin(to_tsvector('english', abstract));
CREATE INDEX IF NOT EXISTS idx_articles_search_combined_gin ON articles USING gin(to_tsvector('english', title || ' ' || abstract));
CREATE INDEX IF NOT EXISTS idx_articles_keywords_gin ON articles USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_articles_authors_gin ON articles USING gin(authors);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_volume_issue ON articles(volume_id, issue_id);
CREATE INDEX IF NOT EXISTS idx_articles_type ON articles(article_type);
CREATE INDEX IF NOT EXISTS idx_articles_language ON articles(language_code);
CREATE INDEX IF NOT EXISTS idx_articles_retracted ON articles(is_retracted);

-- Create composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_articles_search_composite ON articles(published_at DESC, volume_id, issue_id) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_search_type_date ON articles(article_type, published_at DESC) WHERE published_at IS NOT NULL;

-- Add RLS (Row Level Security) policies if needed
-- Note: These would be customized based on your specific security requirements

-- Create views for common queries
CREATE OR REPLACE VIEW article_metrics_summary AS
SELECT 
    a.id as article_id,
    a.title,
    a.published_at,
    COALESCE(views.count, 0) as view_count,
    COALESCE(downloads.count, 0) as download_count,
    COALESCE(citations.count, 0) as citation_count,
    COALESCE(shares.count, 0) as share_count,
    GREATEST(
        COALESCE(views.last_updated, a.created_at),
        COALESCE(downloads.last_updated, a.created_at),
        COALESCE(citations.last_updated, a.created_at),
        COALESCE(shares.last_updated, a.created_at)
    ) as metrics_last_updated
FROM articles a
LEFT JOIN article_metrics views ON a.id = views.article_id AND views.metric_type = 'view'
LEFT JOIN article_metrics downloads ON a.id = downloads.article_id AND downloads.metric_type = 'download'
LEFT JOIN article_metrics citations ON a.id = citations.article_id AND citations.metric_type = 'citation'
LEFT JOIN article_metrics shares ON a.id = shares.article_id AND shares.metric_type = 'share';

-- Create view for editorial calendar with related information
CREATE OR REPLACE VIEW editorial_calendar_view AS
SELECT 
    ee.*,
    s.title as submission_title,
    s.status as submission_status,
    u_assigned.first_name || ' ' || u_assigned.last_name as assigned_to_name,
    u_created.first_name || ' ' || u_created.last_name as created_by_name,
    CASE 
        WHEN ee.end_date < NOW() AND ee.status NOT IN ('completed', 'cancelled') THEN TRUE
        ELSE FALSE
    END as is_overdue
FROM editorial_events ee
LEFT JOIN submissions s ON ee.submission_id = s.id
LEFT JOIN users u_assigned ON ee.assigned_to = u_assigned.id
LEFT JOIN users u_created ON ee.created_by = u_created.id;

COMMENT ON TABLE dois IS 'Stores DOI information and registration status for published articles';
COMMENT ON TABLE article_metrics IS 'Aggregated metrics for articles (views, downloads, citations, shares)';
COMMENT ON TABLE metric_events IS 'Individual metric events for detailed analytics';
COMMENT ON TABLE editorial_events IS 'Editorial calendar events and deadlines';
COMMENT ON TABLE search_analytics IS 'Search query analytics and performance tracking';
COMMENT ON TABLE citations IS 'External citations discovered for articles';
COMMENT ON TABLE supplementary_materials IS 'Additional files and materials for articles';