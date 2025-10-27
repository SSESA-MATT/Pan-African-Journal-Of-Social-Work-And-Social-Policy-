-- Seed Data for Journal Enhancement Phase 1 Testing
-- This file provides sample data for testing search and analytics functionality

-- Insert sample volumes (if volumes table exists)
INSERT INTO volumes (volume_number, year, title, description, created_at) 
VALUES 
    (1, 2023, 'Volume 1: Foundations of African Social Work', 'Inaugural volume focusing on foundational concepts', '2023-01-01'::timestamp),
    (2, 2024, 'Volume 2: Contemporary Challenges', 'Current issues in African social work practice', '2024-01-01'::timestamp)
ON CONFLICT (volume_number, year) DO NOTHING;

-- Insert sample issues (if issues table exists)
INSERT INTO issues (volume_id, issue_number, title, publication_date, created_at)
SELECT 
    v.id,
    1,
    'Issue 1: Community-Based Interventions',
    v.year::text || '-03-01'::date,
    v.year::text || '-01-15'::timestamp
FROM volumes v
WHERE v.volume_number IN (1, 2)
ON CONFLICT (volume_id, issue_number) DO NOTHING;

INSERT INTO issues (volume_id, issue_number, title, publication_date, created_at)
SELECT 
    v.id,
    2,
    'Issue 2: Policy and Practice Integration',
    v.year::text || '-09-01'::date,
    v.year::text || '-07-15'::timestamp
FROM volumes v
WHERE v.volume_number IN (1, 2)
ON CONFLICT (volume_id, issue_number) DO NOTHING;

-- Insert sample articles with enhanced metadata
INSERT INTO articles (
    title, 
    abstract, 
    authors, 
    keywords, 
    published_at, 
    volume_id, 
    issue_id, 
    article_type, 
    language_code,
    pdf_url,
    created_at,
    updated_at
) VALUES 
(
    'Community-Based Social Work Interventions in Rural Kenya',
    'This study examines the effectiveness of community-based social work interventions in rural Kenyan communities. Through a mixed-methods approach, we analyzed the impact of culturally adapted interventions on community well-being and social cohesion. The findings demonstrate significant improvements in community engagement and social support networks.',
    '["Dr. Amina Ochieng", "Prof. James Mwangi", "Dr. Sarah Kimani"]'::jsonb,
    '["community social work", "rural interventions", "Kenya", "cultural adaptation", "community engagement"]'::jsonb,
    '2023-03-15'::timestamp,
    (SELECT id FROM volumes WHERE volume_number = 1 LIMIT 1),
    (SELECT id FROM issues WHERE issue_number = 1 AND volume_id = (SELECT id FROM volumes WHERE volume_number = 1 LIMIT 1) LIMIT 1),
    'research_article',
    'en',
    '/articles/pdfs/community-interventions-kenya.pdf',
    '2023-02-01'::timestamp,
    '2023-03-15'::timestamp
),
(
    'Policy Integration in African Social Work Education',
    'An analysis of policy integration within social work education curricula across five African countries. This comparative study identifies best practices and challenges in incorporating policy education into social work training programs. Recommendations for curriculum development are provided.',
    '["Prof. Fatima Al-Rashid", "Dr. Kwame Asante", "Dr. Nomsa Dlamini"]'::jsonb,
    '["social work education", "policy integration", "curriculum development", "Africa", "comparative study"]'::jsonb,
    '2023-09-20'::timestamp,
    (SELECT id FROM volumes WHERE volume_number = 1 LIMIT 1),
    (SELECT id FROM issues WHERE issue_number = 2 AND volume_id = (SELECT id FROM volumes WHERE volume_number = 1 LIMIT 1) LIMIT 1),
    'research_article',
    'en',
    '/articles/pdfs/policy-integration-education.pdf',
    '2023-08-01'::timestamp,
    '2023-09-20'::timestamp
),
(
    'Ubuntu Philosophy in Contemporary Social Work Practice',
    'This article explores the application of Ubuntu philosophy in modern social work practice across Southern Africa. Through case studies and practitioner interviews, we examine how traditional African values can enhance contemporary social work interventions and promote holistic healing approaches.',
    '["Dr. Thabo Mthembu", "Prof. Grace Ndovu", "Dr. Chipo Mukamuri"]'::jsonb,
    '["Ubuntu philosophy", "African values", "social work practice", "Southern Africa", "holistic healing"]'::jsonb,
    '2024-03-10'::timestamp,
    (SELECT id FROM volumes WHERE volume_number = 2 LIMIT 1),
    (SELECT id FROM issues WHERE issue_number = 1 AND volume_id = (SELECT id FROM volumes WHERE volume_number = 2 LIMIT 1) LIMIT 1),
    'research_article',
    'en',
    '/articles/pdfs/ubuntu-philosophy-practice.pdf',
    '2024-02-01'::timestamp,
    '2024-03-10'::timestamp
),
(
    'Child Protection Systems in West Africa: A Comparative Analysis',
    'A comprehensive analysis of child protection systems across Ghana, Nigeria, and Senegal. This study examines policy frameworks, implementation challenges, and outcomes for vulnerable children. The research provides insights into effective strategies for strengthening child protection in the region.',
    '["Dr. Adaora Okafor", "Prof. Mamadou Diallo", "Dr. Akosua Frimpong"]'::jsonb,
    '["child protection", "West Africa", "policy analysis", "vulnerable children", "comparative study"]'::jsonb,
    '2024-09-15'::timestamp,
    (SELECT id FROM volumes WHERE volume_number = 2 LIMIT 1),
    (SELECT id FROM issues WHERE issue_number = 2 AND volume_id = (SELECT id FROM volumes WHERE volume_number = 2 LIMIT 1) LIMIT 1),
    'research_article',
    'en',
    '/articles/pdfs/child-protection-west-africa.pdf',
    '2024-08-01'::timestamp,
    '2024-09-15'::timestamp
),
(
    'Mental Health Stigma in African Communities: Intervention Strategies',
    'This study addresses mental health stigma in various African communities and evaluates intervention strategies designed to reduce stigma and improve access to mental health services. The research includes community-based participatory approaches and culturally sensitive interventions.',
    '["Dr. Zainab Hassan", "Prof. David Omondi", "Dr. Fatou Sow"]'::jsonb,
    '["mental health", "stigma reduction", "African communities", "intervention strategies", "cultural sensitivity"]'::jsonb,
    '2024-06-01'::timestamp,
    (SELECT id FROM volumes WHERE volume_number = 2 LIMIT 1),
    (SELECT id FROM issues WHERE issue_number = 1 AND volume_id = (SELECT id FROM volumes WHERE volume_number = 2 LIMIT 1) LIMIT 1),
    'case_study',
    'en',
    '/articles/pdfs/mental-health-stigma-interventions.pdf',
    '2024-05-01'::timestamp,
    '2024-06-01'::timestamp
)
ON CONFLICT (title) DO NOTHING;

-- Insert sample DOIs for articles
INSERT INTO dois (article_id, doi_string, registration_status, metadata, created_at)
SELECT 
    a.id,
    '10.xxxx/pajswsp.' || EXTRACT(YEAR FROM a.published_at) || '.0' || 
    COALESCE(v.volume_number, 1) || '.0' || COALESCE(i.issue_number, 1) || '.00' || 
    ROW_NUMBER() OVER (ORDER BY a.id),
    'registered',
    json_build_object(
        'title', a.title,
        'authors', a.authors,
        'publication_date', a.published_at
    )::jsonb,
    a.created_at
FROM articles a
LEFT JOIN volumes v ON a.volume_id = v.id
LEFT JOIN issues i ON a.issue_id = i.id
WHERE a.published_at IS NOT NULL
ON CONFLICT (doi_string) DO NOTHING;

-- Insert sample article metrics
INSERT INTO article_metrics (article_id, metric_type, count, last_updated)
SELECT 
    a.id,
    'view',
    (RANDOM() * 500 + 50)::INTEGER,
    CURRENT_TIMESTAMP
FROM articles a
WHERE a.published_at IS NOT NULL
ON CONFLICT (article_id, metric_type) DO NOTHING;

INSERT INTO article_metrics (article_id, metric_type, count, last_updated)
SELECT 
    a.id,
    'download',
    (RANDOM() * 100 + 10)::INTEGER,
    CURRENT_TIMESTAMP
FROM articles a
WHERE a.published_at IS NOT NULL
ON CONFLICT (article_id, metric_type) DO NOTHING;

-- Insert sample editorial events
INSERT INTO editorial_events (
    event_type,
    title,
    description,
    start_date,
    end_date,
    status,
    priority,
    created_at
) VALUES 
(
    'deadline',
    'Volume 3 Issue 1 Submission Deadline',
    'Final deadline for manuscript submissions for Volume 3, Issue 1',
    '2025-01-31'::timestamp,
    '2025-01-31'::timestamp,
    'scheduled',
    'high',
    CURRENT_TIMESTAMP
),
(
    'review_due',
    'Peer Review Completion - March Issue',
    'All peer reviews for March issue articles must be completed',
    '2025-02-15'::timestamp,
    '2025-02-15'::timestamp,
    'scheduled',
    'medium',
    CURRENT_TIMESTAMP
),
(
    'publication',
    'Volume 2 Issue 2 Publication',
    'Official publication date for Volume 2, Issue 2',
    '2024-09-01'::timestamp,
    '2024-09-01'::timestamp,
    'completed',
    'high',
    '2024-08-15'::timestamp
),
(
    'meeting',
    'Editorial Board Meeting - Q1 2025',
    'Quarterly editorial board meeting to discuss journal direction and policies',
    '2025-03-15 14:00:00'::timestamp,
    '2025-03-15 16:00:00'::timestamp,
    'scheduled',
    'medium',
    CURRENT_TIMESTAMP
);

-- Insert sample search analytics (simulating past searches)
INSERT INTO search_analytics (
    search_query,
    filters_applied,
    results_count,
    response_time_ms,
    timestamp
) VALUES 
(
    'community social work',
    '{"article_type": ["research_article"], "year": [2023, 2024]}'::jsonb,
    3,
    245,
    CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
    'Ubuntu philosophy',
    '{"language_code": ["en"]}'::jsonb,
    1,
    189,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    'child protection',
    '{"article_type": ["research_article"], "keywords": ["West Africa"]}'::jsonb,
    1,
    312,
    CURRENT_TIMESTAMP - INTERVAL '3 days'
),
(
    'mental health stigma',
    '{"article_type": ["case_study"]}'::jsonb,
    1,
    198,
    CURRENT_TIMESTAMP - INTERVAL '1 week'
);

-- Insert sample citation exports
INSERT INTO citation_exports (article_id, format, exported_at)
SELECT 
    a.id,
    (ARRAY['bibtex', 'endnote', 'ris', 'apa'])[floor(random() * 4 + 1)],
    CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days')
FROM articles a
WHERE a.published_at IS NOT NULL
ORDER BY RANDOM()
LIMIT 10;

-- Insert sample related articles (based on keyword similarity)
INSERT INTO related_articles (article_id, related_article_id, similarity_score, relationship_type)
SELECT DISTINCT
    a1.id,
    a2.id,
    0.75 + (RANDOM() * 0.25),
    'keyword_similarity'
FROM articles a1
CROSS JOIN articles a2
WHERE a1.id != a2.id
AND a1.published_at IS NOT NULL
AND a2.published_at IS NOT NULL
AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements_text(a1.keywords) k1
    JOIN jsonb_array_elements_text(a2.keywords) k2 ON k1.value = k2.value
)
LIMIT 5
ON CONFLICT (article_id, related_article_id) DO NOTHING;