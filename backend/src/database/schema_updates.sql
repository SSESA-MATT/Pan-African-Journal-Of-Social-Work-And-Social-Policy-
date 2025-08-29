-- Database Schema Updates for Enhanced Manuscript Management System
-- Run these commands in your Supabase SQL Editor

-- ========================================
-- 1. REVIEWER PROFILES & EXPERTISE
-- ========================================

-- Reviewer expertise/specialization table
CREATE TABLE IF NOT EXISTS reviewer_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expertise_area VARCHAR(255) NOT NULL,
    proficiency_level VARCHAR(20) DEFAULT 'intermediate' 
        CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviewer availability and performance tracking
CREATE TABLE IF NOT EXISTS reviewer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    availability_status VARCHAR(20) DEFAULT 'available' 
        CHECK (availability_status IN ('available', 'busy', 'unavailable')),
    max_reviews_per_month INTEGER DEFAULT 3,
    current_review_load INTEGER DEFAULT 0,
    avg_review_time_days INTEGER DEFAULT 21,
    total_reviews_completed INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    bio TEXT,
    orcid VARCHAR(19),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. MANUSCRIPT WORKFLOW ENHANCEMENTS
-- ========================================

-- Manuscript workflow history/audit trail
CREATE TABLE IF NOT EXISTS manuscript_workflow_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    action_by UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 3. ADVANCED REVIEW ASSIGNMENTS
-- ========================================

-- Review invitations (separate from actual reviews)
CREATE TABLE IF NOT EXISTS review_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES users(id),
    invitation_status VARCHAR(20) DEFAULT 'pending'
        CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'expired')),
    invitation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    response_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '3 days'),
    decline_reason VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. MESSAGING & COMMUNICATION
-- ========================================

-- Messages between users (authors, reviewers, editors)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    message_body TEXT NOT NULL,
    message_type VARCHAR(30) DEFAULT 'general'
        CHECK (message_type IN ('general', 'review_request', 'revision_request', 'decision', 'query')),
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id UUID REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 5. FILE MANAGEMENT ENHANCEMENTS
-- ========================================

-- Add missing columns to existing manuscripts table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS manuscript_type VARCHAR(30) DEFAULT 'research' 
    CHECK (manuscript_type IN ('research', 'review', 'case-study', 'commentary', 'brief-communication')),
ADD COLUMN IF NOT EXISTS funding_information TEXT,
ADD COLUMN IF NOT EXISTS conflict_of_interest TEXT,
ADD COLUMN IF NOT EXISTS ethics_approval TEXT,
ADD COLUMN IF NOT EXISTS data_availability TEXT;

-- ========================================
-- 6. ANALYTICS & REPORTING
-- ========================================

-- System metrics and analytics
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    metric_value JSONB NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID REFERENCES users(id)
);

-- ========================================
-- 7. JOURNAL CONFIGURATION
-- ========================================

-- Journal settings and configuration
CREATE TABLE IF NOT EXISTS journal_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- New indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_reviewer_expertise_reviewer_id ON reviewer_expertise(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_expertise_area ON reviewer_expertise(expertise_area);
CREATE INDEX IF NOT EXISTS idx_reviewer_profiles_availability ON reviewer_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_manuscript_workflow_history_manuscript_id ON manuscript_workflow_history(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_review_invitations_manuscript_id ON review_invitations(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_review_invitations_reviewer_id ON review_invitations(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_invitations_status ON review_invitations(invitation_status);
CREATE INDEX IF NOT EXISTS idx_messages_manuscript_id ON messages(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- ========================================
-- 9. CREATE UPDATE TRIGGERS
-- ========================================

-- Update triggers for new tables
CREATE TRIGGER update_reviewer_profiles_updated_at 
    BEFORE UPDATE ON reviewer_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. CREATE USEFUL VIEWS
-- ========================================

-- View for reviewer dashboard with workload and expertise
CREATE OR REPLACE VIEW reviewer_dashboard_view AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.affiliation,
    rp.availability_status,
    rp.current_review_load,
    rp.max_reviews_per_month,
    rp.avg_review_time_days,
    rp.total_reviews_completed,
    rp.average_rating,
    array_agg(DISTINCT re.expertise_area) as expertise_areas,
    COUNT(DISTINCT r.id) FILTER (WHERE r.id IS NOT NULL) as active_reviews,
    COUNT(DISTINCT ri.id) FILTER (WHERE ri.invitation_status = 'pending') as pending_invitations
FROM users u
LEFT JOIN reviewer_profiles rp ON u.id = rp.reviewer_id
LEFT JOIN reviewer_expertise re ON u.id = re.reviewer_id
LEFT JOIN reviews r ON u.id = r.reviewer_id
LEFT JOIN review_invitations ri ON u.id = ri.reviewer_id
WHERE u.role IN ('reviewer', 'editor', 'admin')
GROUP BY u.id, u.first_name, u.last_name, u.email, u.affiliation, 
         rp.availability_status, rp.current_review_load, rp.max_reviews_per_month, 
         rp.avg_review_time_days, rp.total_reviews_completed, rp.average_rating;

-- View for manuscript assignment recommendations
CREATE OR REPLACE VIEW manuscript_reviewer_matches AS
SELECT 
    s.id as manuscript_id,
    s.title as manuscript_title,
    s.keywords as manuscript_keywords,
    u.id as reviewer_id,
    u.first_name,
    u.last_name,
    u.email,
    u.affiliation,
    rp.availability_status,
    rp.current_review_load,
    rp.avg_review_time_days,
    array_agg(DISTINCT re.expertise_area) as reviewer_expertise,
    -- Calculate match score based on keyword overlap
    CASE 
        WHEN s.keywords IS NOT NULL AND array_length(s.keywords::text[], 1) > 0 AND array_length(array_agg(DISTINCT re.expertise_area), 1) > 0
        THEN array_length(array(SELECT unnest(s.keywords::text[]) INTERSECT SELECT unnest(array_agg(DISTINCT re.expertise_area))), 1) * 20
        ELSE 0
    END as expertise_match_score
FROM submissions s
CROSS JOIN users u
LEFT JOIN reviewer_profiles rp ON u.id = rp.reviewer_id
LEFT JOIN reviewer_expertise re ON u.id = re.reviewer_id
WHERE u.role IN ('reviewer', 'editor') 
    AND s.status IN ('submitted', 'under_review')
    AND u.id != s.author_id  -- Exclude author from reviewing their own work
GROUP BY s.id, s.title, s.keywords, u.id, u.first_name, u.last_name, 
         u.email, u.affiliation, rp.availability_status, rp.current_review_load, rp.avg_review_time_days
HAVING array_length(array_agg(DISTINCT re.expertise_area), 1) > 0;

-- ========================================
-- 11. INSERT DEFAULT JOURNAL SETTINGS
-- ========================================

INSERT INTO journal_settings (setting_key, setting_value, description) VALUES
('journal_name', '"Pan-African Journal of Social Work and Social Policy"', 'Name of the journal'),
('review_deadline_days', '21', 'Default deadline for reviews in days'),
('max_reviewers_per_manuscript', '3', 'Maximum number of reviewers per manuscript'),
('min_reviewers_per_manuscript', '2', 'Minimum number of reviewers per manuscript'),
('auto_assign_reviewers', 'false', 'Whether to automatically assign reviewers'),
('email_notifications', 'true', 'Whether to send email notifications'),
('blind_review', 'true', 'Whether reviews are blind/anonymous')
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================
-- 12. SAMPLE DATA FOR TESTING (OPTIONAL)
-- ========================================

-- You can uncomment this section to add sample reviewer expertise data
/*
-- Sample reviewer expertise (add after creating real reviewer accounts)
INSERT INTO reviewer_expertise (reviewer_id, expertise_area, proficiency_level) 
SELECT u.id, area, 'expert' 
FROM users u, 
     unnest(ARRAY['Community Development', 'Rural Social Work', 'Social Policy', 'African Studies', 'Policy Analysis']) as area
WHERE u.role = 'reviewer' 
LIMIT 20;

-- Sample reviewer profiles
INSERT INTO reviewer_profiles (reviewer_id, availability_status, max_reviews_per_month, avg_review_time_days)
SELECT id, 'available', 3 + (random() * 2)::int, 18 + (random() * 10)::int
FROM users 
WHERE role IN ('reviewer', 'editor');
*/
