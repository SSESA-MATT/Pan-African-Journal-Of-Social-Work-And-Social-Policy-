-- Migration: Create DOI management tables
-- Date: 2024-10-27
-- Description: Add tables for DOI registration and tracking

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

-- Create indexes for performance
CREATE INDEX idx_doi_registrations_article_id ON doi_registrations(article_id);
CREATE INDEX idx_doi_registrations_doi ON doi_registrations(doi);
CREATE INDEX idx_doi_registrations_status ON doi_registrations(status);
CREATE INDEX idx_doi_registrations_created_at ON doi_registrations(created_at);

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

-- Create index for DOI sequence lookups
CREATE INDEX idx_doi_sequences_year_volume_issue ON doi_sequences(year, volume, issue);

-- Add DOI column to articles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'doi') THEN
        ALTER TABLE articles ADD COLUMN doi VARCHAR(255) UNIQUE;
        CREATE INDEX idx_articles_doi ON articles(doi);
    END IF;
END $$;

-- Add DOI status column to articles table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'articles' AND column_name = 'doi_status') THEN
        ALTER TABLE articles ADD COLUMN doi_status VARCHAR(50) DEFAULT 'none';
        ALTER TABLE articles ADD CONSTRAINT valid_doi_status 
            CHECK (doi_status IN ('none', 'pending', 'registered', 'failed'));
        CREATE INDEX idx_articles_doi_status ON articles(doi_status);
    END IF;
END $$;

-- Create function to update updated_at timestamp
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

-- Create function to get next DOI for a given year/volume/issue
CREATE OR REPLACE FUNCTION get_next_doi_number(
    p_year INTEGER,
    p_volume INTEGER,
    p_issue INTEGER
) RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Insert or update the sequence record
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

-- Create function to generate DOI string
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
    -- Get next article number
    article_number := get_next_doi_number(p_year, p_volume, p_issue);
    
    -- Format DOI string
    doi_string := p_prefix || '/pajswsp.' || 
                  p_year || '.' ||
                  LPAD(p_volume::TEXT, 2, '0') || '.' ||
                  LPAD(p_issue::TEXT, 2, '0') || '.' ||
                  LPAD(article_number::TEXT, 3, '0');
    
    RETURN doi_string;
END;
$$ LANGUAGE plpgsql;

-- Create view for DOI registration status
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

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON doi_registrations TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON doi_sequences TO your_app_user;
-- GRANT USAGE ON SEQUENCE doi_registrations_id_seq TO your_app_user;
-- GRANT USAGE ON SEQUENCE doi_sequences_id_seq TO your_app_user;