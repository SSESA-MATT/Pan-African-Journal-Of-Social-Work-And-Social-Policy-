-- Africa Journal Database Schema
-- PostgreSQL database schema for the scholarly publishing platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    affiliation VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('author', 'reviewer', 'editor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Volumes table
CREATE TABLE volumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volume_number INTEGER UNIQUE NOT NULL,
    year INTEGER NOT NULL,
    description TEXT
);

-- Issues table
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_number INTEGER NOT NULL,
    volume_id UUID NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
    description TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(volume_id, issue_number)
);

-- Submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    keywords JSONB NOT NULL DEFAULT '[]',
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    co_authors JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' 
        CHECK (status IN ('submitted', 'under_review', 'revisions_required', 'accepted', 'rejected')),
    manuscript_url VARCHAR(500),
    editor_comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comments TEXT NOT NULL,
    recommendation VARCHAR(20) NOT NULL 
        CHECK (recommendation IN ('accept', 'minor_revisions', 'major_revisions', 'reject')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, reviewer_id)
);

-- Articles table (published submissions)
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    authors JSONB NOT NULL DEFAULT '[]',
    pdf_url VARCHAR(500) NOT NULL,
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_submissions_author_id ON submissions(author_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
CREATE INDEX idx_reviews_submission_id ON reviews(submission_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_articles_issue_id ON articles(issue_id);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_issues_volume_id ON issues(volume_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Manuscripts table (new manuscript management system)
CREATE TABLE manuscripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords JSONB NOT NULL DEFAULT '[]',
    authors JSONB NOT NULL DEFAULT '[]',
    corresponding_author VARCHAR(255) NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'under-review', 'awaiting-revision', 'revised-submitted', 'accepted', 'rejected', 'published')),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Manuscript files table
CREATE TABLE manuscript_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('manuscript', 'figure', 'table', 'supplementary')),
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Reviews table for manuscripts
CREATE TABLE manuscript_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'assigned'
        CHECK (status IN ('assigned', 'in-progress', 'completed', 'overdue')),
    recommendation VARCHAR(30)
        CHECK (recommendation IN ('accept', 'minor-revisions', 'major-revisions', 'reject-resubmit', 'reject')),
    comments_to_author TEXT,
    comments_to_editor TEXT,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    originality_rating INTEGER CHECK (originality_rating >= 1 AND originality_rating <= 5),
    significance_rating INTEGER CHECK (significance_rating >= 1 AND significance_rating <= 5),
    presentation_rating INTEGER CHECK (presentation_rating >= 1 AND presentation_rating <= 5),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    submitted_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '21 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manuscript_id, reviewer_id)
);

-- Create additional indexes for manuscript system
CREATE INDEX idx_manuscripts_author_id ON manuscripts(author_id);
CREATE INDEX idx_manuscripts_status ON manuscripts(status);
CREATE INDEX idx_manuscripts_submission_date ON manuscripts(submission_date);
CREATE INDEX idx_manuscripts_last_updated ON manuscripts(last_updated);
CREATE INDEX idx_manuscript_files_manuscript_id ON manuscript_files(manuscript_id);
CREATE INDEX idx_manuscript_reviews_manuscript_id ON manuscript_reviews(manuscript_id);
CREATE INDEX idx_manuscript_reviews_reviewer_id ON manuscript_reviews(reviewer_id);
CREATE INDEX idx_manuscript_reviews_status ON manuscript_reviews(status);
CREATE INDEX idx_manuscript_reviews_due_date ON manuscript_reviews(due_date);

-- Create triggers for manuscript system
CREATE TRIGGER update_manuscripts_updated_at 
    BEFORE UPDATE ON manuscripts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manuscript_reviews_updated_at 
    BEFORE UPDATE ON manuscript_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for manuscripts with review statistics
CREATE VIEW manuscript_summary AS
SELECT 
    m.*,
    COALESCE(review_stats.total_reviews, 0) as total_reviews,
    COALESCE(review_stats.completed_reviews, 0) as completed_reviews,
    COALESCE(review_stats.pending_reviews, 0) as pending_reviews,
    COALESCE(review_stats.overdue_reviews, 0) as overdue_reviews,
    array_agg(DISTINCT mr.reviewer_id) FILTER (WHERE mr.reviewer_id IS NOT NULL) as assigned_reviewers
FROM manuscripts m
LEFT JOIN manuscript_reviews mr ON m.id = mr.manuscript_id
LEFT JOIN (
    SELECT 
        manuscript_id,
        COUNT(*) as total_reviews,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_reviews,
        COUNT(*) FILTER (WHERE status IN ('assigned', 'in-progress')) as pending_reviews,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue_reviews
    FROM manuscript_reviews
    GROUP BY manuscript_id
) review_stats ON m.id = review_stats.manuscript_id
GROUP BY m.id, review_stats.total_reviews, review_stats.completed_reviews, 
         review_stats.pending_reviews, review_stats.overdue_reviews;