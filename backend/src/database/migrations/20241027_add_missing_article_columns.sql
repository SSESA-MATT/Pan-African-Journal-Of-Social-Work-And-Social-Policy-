-- Add Missing Article Columns for Search Functionality
-- This migration adds columns that are expected by the search functions

-- Add missing columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS article_type VARCHAR(50) DEFAULT 'research_article' 
    CHECK (article_type IN ('research_article', 'review_article', 'case_study', 'brief_communication', 'commentary', 'policy_brief', 'practice_note', 'student_voice'));

ALTER TABLE articles ADD COLUMN IF NOT EXISTS language_code VARCHAR(10) DEFAULT 'en' 
    CHECK (language_code IN ('en', 'fr', 'ar', 'sw', 'pt', 'es'));

ALTER TABLE articles ADD COLUMN IF NOT EXISTS pdf_url TEXT;

ALTER TABLE articles ADD COLUMN IF NOT EXISTS issue_id INTEGER REFERENCES issues(id) ON DELETE SET NULL;

-- Update existing articles with default values if they're NULL
UPDATE articles SET article_type = 'research_article' WHERE article_type IS NULL;
UPDATE articles SET language_code = 'en' WHERE language_code IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_articles_article_type ON articles(article_type);
CREATE INDEX IF NOT EXISTS idx_articles_language_code ON articles(language_code);
CREATE INDEX IF NOT EXISTS idx_articles_issue_id ON articles(issue_id);

-- Add comments
COMMENT ON COLUMN articles.article_type IS 'Type of article (research_article, review_article, etc.)';
COMMENT ON COLUMN articles.language_code IS 'Language code for the article (en, fr, ar, sw, pt, es)';
COMMENT ON COLUMN articles.pdf_url IS 'URL to the PDF file of the article';
COMMENT ON COLUMN articles.issue_id IS 'Reference to the issue this article belongs to';