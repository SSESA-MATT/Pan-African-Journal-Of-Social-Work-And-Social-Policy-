-- Fix Supabase Security Warnings
-- This script enables RLS on all tables and fixes security definer views

-- Enable RLS on all tables that are missing it
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dois ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_metric_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE citation_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuscript_workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_settings ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for admin access
-- (You can make these more restrictive later)

-- Audit logs - only admins can see
DROP POLICY IF EXISTS "admin_audit_logs" ON audit_logs;
CREATE POLICY "admin_audit_logs" ON audit_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Related articles - public read, admin write
DROP POLICY IF EXISTS "public_read_related_articles" ON related_articles;
DROP POLICY IF EXISTS "admin_write_related_articles" ON related_articles;
CREATE POLICY "public_read_related_articles" ON related_articles FOR SELECT USING (true);
CREATE POLICY "admin_write_related_articles" ON related_articles FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- DOIs - public read, admin write
DROP POLICY IF EXISTS "public_read_dois" ON dois;
DROP POLICY IF EXISTS "admin_write_dois" ON dois;
CREATE POLICY "public_read_dois" ON dois FOR SELECT USING (true);
CREATE POLICY "admin_write_dois" ON dois FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Article metrics - public read, system write
DROP POLICY IF EXISTS "public_read_article_metrics" ON article_metrics;
DROP POLICY IF EXISTS "admin_write_article_metrics" ON article_metrics;
CREATE POLICY "public_read_article_metrics" ON article_metrics FOR SELECT USING (true);
CREATE POLICY "admin_write_article_metrics" ON article_metrics FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Article metric events - public read, system write
DROP POLICY IF EXISTS "public_read_article_metric_events" ON article_metric_events;
DROP POLICY IF EXISTS "admin_write_article_metric_events" ON article_metric_events;
CREATE POLICY "public_read_article_metric_events" ON article_metric_events FOR SELECT USING (true);
CREATE POLICY "admin_write_article_metric_events" ON article_metric_events FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Editorial events - admin only
DROP POLICY IF EXISTS "admin_editorial_events" ON editorial_events;
CREATE POLICY "admin_editorial_events" ON editorial_events FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Article authors - public read, admin write
DROP POLICY IF EXISTS "public_read_article_authors" ON article_authors;
DROP POLICY IF EXISTS "admin_write_article_authors" ON article_authors;
CREATE POLICY "public_read_article_authors" ON article_authors FOR SELECT USING (true);
CREATE POLICY "admin_write_article_authors" ON article_authors FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Search analytics - admin only
DROP POLICY IF EXISTS "admin_search_analytics" ON search_analytics;
CREATE POLICY "admin_search_analytics" ON search_analytics FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Article keywords - public read, admin write
DROP POLICY IF EXISTS "public_read_article_keywords" ON article_keywords;
DROP POLICY IF EXISTS "admin_write_article_keywords" ON article_keywords;
CREATE POLICY "public_read_article_keywords" ON article_keywords FOR SELECT USING (true);
CREATE POLICY "admin_write_article_keywords" ON article_keywords FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Citation exports - public read, admin write
DROP POLICY IF EXISTS "public_read_citation_exports" ON citation_exports;
DROP POLICY IF EXISTS "admin_write_citation_exports" ON citation_exports;
CREATE POLICY "public_read_citation_exports" ON citation_exports FOR SELECT USING (true);
CREATE POLICY "admin_write_citation_exports" ON citation_exports FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Reviewer expertise - reviewers can see their own, admins see all
DROP POLICY IF EXISTS "reviewer_own_expertise" ON reviewer_expertise;
DROP POLICY IF EXISTS "admin_all_expertise" ON reviewer_expertise;
CREATE POLICY "reviewer_own_expertise" ON reviewer_expertise FOR ALL USING (
    auth.uid() = reviewer_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Manuscript workflow history - admin only
DROP POLICY IF EXISTS "admin_workflow_history" ON manuscript_workflow_history;
CREATE POLICY "admin_workflow_history" ON manuscript_workflow_history FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Reviewer profiles - reviewers can see their own, admins see all
DROP POLICY IF EXISTS "reviewer_own_profile" ON reviewer_profiles;
CREATE POLICY "reviewer_own_profile" ON reviewer_profiles FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Review invitations - reviewers can see their own, admins see all
DROP POLICY IF EXISTS "reviewer_own_invitations" ON review_invitations;
CREATE POLICY "reviewer_own_invitations" ON review_invitations FOR ALL USING (
    auth.uid() = reviewer_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Messages - users can see their own messages, admins see all
DROP POLICY IF EXISTS "user_own_messages" ON messages;
CREATE POLICY "user_own_messages" ON messages FOR ALL USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- System metrics - admin only
DROP POLICY IF EXISTS "admin_system_metrics" ON system_metrics;
CREATE POLICY "admin_system_metrics" ON system_metrics FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Journal settings - admin only
DROP POLICY IF EXISTS "admin_journal_settings" ON journal_settings;
CREATE POLICY "admin_journal_settings" ON journal_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- Fix Security Definer Views (recreate without SECURITY DEFINER)
-- Note: You may need to adjust these based on your actual view definitions

-- Drop and recreate reviewer_dashboard_view without SECURITY DEFINER
DROP VIEW IF EXISTS reviewer_dashboard_view;
-- You'll need to recreate this view with your actual definition
-- CREATE VIEW reviewer_dashboard_view AS SELECT ...;

-- Drop and recreate manuscript_reviewer_matches without SECURITY DEFINER  
DROP VIEW IF EXISTS manuscript_reviewer_matches;
-- You'll need to recreate this view with your actual definition
-- CREATE VIEW manuscript_reviewer_matches AS SELECT ...;