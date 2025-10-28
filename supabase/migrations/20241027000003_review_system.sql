-- Review System Migration
-- Creates tables for reviewer assignments and reviews

-- Reviewer Assignments Table
CREATE TABLE IF NOT EXISTS reviewer_assignments (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'declined')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, reviewer_id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comments TEXT NOT NULL,
    recommendation VARCHAR(50) NOT NULL CHECK (recommendation IN ('accept', 'minor_revisions', 'major_revisions', 'reject')),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('draft', 'completed')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, reviewer_id)
);

-- Add missing columns to submissions table if they don't exist
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS editorial_decision VARCHAR(50);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS editorial_comments TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS decision_date TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_submission_id ON reviewer_assignments(submission_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_reviewer_id ON reviewer_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_status ON reviewer_assignments(status);
CREATE INDEX IF NOT EXISTS idx_reviewer_assignments_due_date ON reviewer_assignments(due_date);

CREATE INDEX IF NOT EXISTS idx_reviews_submission_id ON reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_recommendation ON reviews(recommendation);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_reviewer_assignments_updated_at ON reviewer_assignments;
CREATE TRIGGER update_reviewer_assignments_updated_at
    BEFORE UPDATE ON reviewer_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get reviewer workload
CREATE OR REPLACE FUNCTION get_reviewer_workload(reviewer_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'reviewer_id', reviewer_uuid,
        'active_assignments', (
            SELECT COUNT(*) 
            FROM reviewer_assignments 
            WHERE reviewer_id = reviewer_uuid 
            AND status IN ('assigned', 'in_progress')
        ),
        'completed_reviews', (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE reviewer_id = reviewer_uuid 
            AND status = 'completed'
        ),
        'overdue_assignments', (
            SELECT COUNT(*) 
            FROM reviewer_assignments 
            WHERE reviewer_id = reviewer_uuid 
            AND status = 'assigned' 
            AND due_date < CURRENT_TIMESTAMP
        ),
        'avg_review_time_days', (
            SELECT AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 86400)
            FROM reviewer_assignments 
            WHERE reviewer_id = reviewer_uuid 
            AND status = 'completed'
            AND completed_at IS NOT NULL
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get submission review status
CREATE OR REPLACE FUNCTION get_submission_review_status(submission_id_param INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'submission_id', submission_id_param,
        'total_reviewers', (
            SELECT COUNT(*) 
            FROM reviewer_assignments 
            WHERE submission_id = submission_id_param
        ),
        'completed_reviews', (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE submission_id = submission_id_param 
            AND status = 'completed'
        ),
        'pending_reviews', (
            SELECT COUNT(*) 
            FROM reviewer_assignments 
            WHERE submission_id = submission_id_param 
            AND status = 'assigned'
        ),
        'overdue_reviews', (
            SELECT COUNT(*) 
            FROM reviewer_assignments 
            WHERE submission_id = submission_id_param 
            AND status = 'assigned' 
            AND due_date < CURRENT_TIMESTAMP
        ),
        'recommendations', (
            SELECT json_agg(json_build_object(
                'reviewer_id', reviewer_id,
                'recommendation', recommendation,
                'submitted_at', submitted_at
            ))
            FROM reviews 
            WHERE submission_id = submission_id_param 
            AND status = 'completed'
        ),
        'review_complete', (
            SELECT CASE 
                WHEN COUNT(*) > 0 AND COUNT(*) = (
                    SELECT COUNT(*) 
                    FROM reviewer_assignments 
                    WHERE submission_id = submission_id_param
                ) THEN true 
                ELSE false 
            END
            FROM reviews 
            WHERE submission_id = submission_id_param 
            AND status = 'completed'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add table comments for documentation
COMMENT ON TABLE reviewer_assignments IS 'Tracks reviewer assignments for submissions';
COMMENT ON TABLE reviews IS 'Stores completed peer reviews for submissions';

-- Add column comments
COMMENT ON COLUMN reviewer_assignments.status IS 'Status of the reviewer assignment (assigned, in_progress, completed, declined)';
COMMENT ON COLUMN reviews.recommendation IS 'Reviewer recommendation (accept, minor_revisions, major_revisions, reject)';
COMMENT ON COLUMN submissions.editorial_decision IS 'Final editorial decision on the submission';
COMMENT ON COLUMN submissions.editorial_comments IS 'Editorial comments for the author';

-- Create RLS policies for security
ALTER TABLE reviewer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Reviewers can see their own assignments
CREATE POLICY "Reviewers can view their own assignments" ON reviewer_assignments
    FOR SELECT USING (auth.uid() = reviewer_id);

-- Policy: Admins and editors can manage all assignments
CREATE POLICY "Admins and editors can manage assignments" ON reviewer_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

-- Policy: Authors can see assignments for their submissions
CREATE POLICY "Authors can view assignments for their submissions" ON reviewer_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM submissions 
            WHERE id = submission_id 
            AND author_id = auth.uid()
        )
    );

-- Policy: Reviewers can see their own reviews
CREATE POLICY "Reviewers can view their own reviews" ON reviews
    FOR SELECT USING (auth.uid() = reviewer_id);

-- Policy: Reviewers can create and update their own reviews
CREATE POLICY "Reviewers can manage their own reviews" ON reviews
    FOR ALL USING (auth.uid() = reviewer_id);

-- Policy: Admins and editors can see all reviews
CREATE POLICY "Admins and editors can view all reviews" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'editor')
        )
    );

-- Policy: Authors can see reviews for their submissions (after completion)
CREATE POLICY "Authors can view reviews for their submissions" ON reviews
    FOR SELECT USING (
        status = 'completed' AND
        EXISTS (
            SELECT 1 FROM submissions 
            WHERE id = submission_id 
            AND author_id = auth.uid()
        )
    );