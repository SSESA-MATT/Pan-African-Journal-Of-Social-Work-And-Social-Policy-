import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedJournalEnhancements() {
  try {
    console.log('🌱 Seeding journal enhancement data...');

    // Check if we have any articles to work with
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, published_at')
      .limit(10);

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      return;
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found. Creating sample articles first...');
      await createSampleArticles();
      
      // Fetch the newly created articles
      const { data: newArticles } = await supabase
        .from('articles')
        .select('id, title, published_at')
        .limit(10);
      
      if (newArticles) {
        await seedMetricsData(newArticles);
      }
    } else {
      await seedMetricsData(articles);
    }

    await seedEditorialEvents();
    await seedSearchAnalytics();

    console.log('✅ Journal enhancement seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding journal enhancements:', error);
    process.exit(1);
  }
}

async function createSampleArticles() {
  console.log('Creating sample articles...');

  // First ensure we have a volume and issue
  const { data: volume, error: volumeError } = await supabase
    .from('volumes')
    .select('id')
    .eq('volume_number', 1)
    .single();

  let volumeId = volume?.id;

  if (!volumeId) {
    const { data: newVolume, error: createVolumeError } = await supabase
      .from('volumes')
      .insert({
        volume_number: 1,
        year: 2024,
        description: 'Inaugural Volume - Foundations of African Social Work'
      })
      .select('id')
      .single();

    if (createVolumeError) {
      console.error('Error creating volume:', createVolumeError);
      return;
    }
    volumeId = newVolume.id;
  }

  const { data: issue, error: issueError } = await supabase
    .from('issues')
    .select('id')
    .eq('volume_id', volumeId)
    .eq('issue_number', 1)
    .single();

  let issueId = issue?.id;

  if (!issueId) {
    const { data: newIssue, error: createIssueError } = await supabase
      .from('issues')
      .insert({
        issue_number: 1,
        volume_id: volumeId,
        description: 'Community Development Focus',
        published_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createIssueError) {
      console.error('Error creating issue:', createIssueError);
      return;
    }
    issueId = newIssue.id;
  }

  // Create sample articles
  const sampleArticles = [
    {
      title: 'Community-Based Social Work Interventions in Rural Africa',
      abstract: 'This study examines the effectiveness of community-based social work interventions in rural African communities. Through a mixed-methods approach, we analyzed the impact of culturally adapted social work practices on community development and individual well-being.',
      authors: ['Dr. Amara Okafor', 'Prof. Kwame Asante', 'Dr. Fatima Al-Rashid'],
      keywords: ['community social work', 'rural development', 'cultural adaptation', 'Africa'],
      pdf_url: '/articles/community-based-interventions.pdf',
      volume_id: volumeId,
      issue_id: issueId,
      published_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      article_type: 'research_article',
      language_code: 'en',
      reading_time_minutes: 15
    },
    {
      title: 'Policy Analysis: Social Protection Systems in West Africa',
      abstract: 'An in-depth analysis of social protection systems across West African nations, examining policy frameworks, implementation challenges, and outcomes for vulnerable populations.',
      authors: ['Dr. Kofi Mensah', 'Dr. Aisha Diallo'],
      keywords: ['social policy', 'social protection', 'West Africa', 'policy analysis'],
      pdf_url: '/articles/social-protection-west-africa.pdf',
      volume_id: volumeId,
      issue_id: issueId,
      published_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      article_type: 'policy_brief',
      language_code: 'en',
      reading_time_minutes: 12
    },
    {
      title: 'Mental Health Services in Urban African Settings',
      abstract: 'This research explores the delivery of mental health services in urban African contexts, highlighting innovative approaches to addressing mental health challenges in resource-constrained environments.',
      authors: ['Dr. Thandiwe Mthembu', 'Prof. Omar Hassan', 'Dr. Grace Wanjiku'],
      keywords: ['mental health', 'urban settings', 'service delivery', 'Africa'],
      pdf_url: '/articles/mental-health-urban-africa.pdf',
      volume_id: volumeId,
      issue_id: issueId,
      published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      article_type: 'research_article',
      language_code: 'en',
      reading_time_minutes: 18
    }
  ];

  const { error: articlesError } = await supabase
    .from('articles')
    .insert(sampleArticles);

  if (articlesError) {
    console.error('Error creating sample articles:', articlesError);
  } else {
    console.log('✅ Sample articles created successfully');
  }
}

async function seedMetricsData(articles: any[]) {
  console.log('Seeding metrics data...');

  for (const article of articles) {
    // Generate realistic metrics
    const viewCount = Math.floor(Math.random() * 500) + 50;
    const downloadCount = Math.floor(viewCount * 0.3); // ~30% of viewers download
    const citationCount = Math.floor(Math.random() * 10);
    const shareCount = Math.floor(viewCount * 0.05); // ~5% of viewers share

    // Insert aggregated metrics
    const metrics = [
      { article_id: article.id, metric_type: 'view', count: viewCount },
      { article_id: article.id, metric_type: 'download', count: downloadCount },
      { article_id: article.id, metric_type: 'citation', count: citationCount },
      { article_id: article.id, metric_type: 'share', count: shareCount }
    ];

    const { error: metricsError } = await supabase
      .from('article_metrics')
      .insert(metrics);

    if (metricsError) {
      console.error(`Error inserting metrics for article ${article.id}:`, metricsError);
      continue;
    }

    // Generate some sample metric events for the last 30 days
    const events = [];
    const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NG', 'KE', 'ZA', 'GH'];
    const cities = ['New York', 'London', 'Toronto', 'Sydney', 'Berlin', 'Paris', 'Lagos', 'Nairobi', 'Cape Town', 'Accra'];

    for (let i = 0; i < Math.min(viewCount, 100); i++) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
      const countryIndex = Math.floor(Math.random() * countries.length);

      events.push({
        article_id: article.id,
        event_type: 'view',
        user_session: `session_${Math.random().toString(36).substr(2, 9)}`,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country_code: countries[countryIndex],
        city: cities[countryIndex],
        timestamp: timestamp.toISOString(),
        metadata: {
          user_agent: 'Mozilla/5.0 (compatible; Journal Reader)',
          referrer: Math.random() > 0.5 ? 'https://google.com' : 'https://scholar.google.com'
        }
      });
    }

    // Add some download events
    for (let i = 0; i < Math.min(downloadCount, 50); i++) {
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
      const countryIndex = Math.floor(Math.random() * countries.length);

      events.push({
        article_id: article.id,
        event_type: 'download',
        user_session: `session_${Math.random().toString(36).substr(2, 9)}`,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country_code: countries[countryIndex],
        city: cities[countryIndex],
        timestamp: timestamp.toISOString(),
        metadata: {
          user_agent: 'Mozilla/5.0 (compatible; Journal Reader)',
          file_type: 'pdf'
        }
      });
    }

    if (events.length > 0) {
      const { error: eventsError } = await supabase
        .from('metric_events')
        .insert(events);

      if (eventsError) {
        console.error(`Error inserting metric events for article ${article.id}:`, eventsError);
      }
    }
  }

  console.log('✅ Metrics data seeded successfully');
}

async function seedEditorialEvents() {
  console.log('Seeding editorial events...');

  // Get some users for assignment
  const { data: users } = await supabase
    .from('users')
    .select('id, first_name, last_name, role')
    .in('role', ['admin', 'editor', 'reviewer'])
    .limit(5);

  if (!users || users.length === 0) {
    console.log('No users found for editorial events');
    return;
  }

  const events = [
    {
      event_type: 'deadline',
      title: 'Special Issue Submission Deadline',
      description: 'Deadline for submissions to the special issue on "Indigenous Social Work Practices"',
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      all_day: true,
      assigned_to: users[0].id,
      created_by: users[0].id,
      status: 'pending',
      priority: 'high',
      metadata: {
        special_issue: true,
        expected_submissions: 15
      }
    },
    {
      event_type: 'meeting',
      title: 'Editorial Board Meeting',
      description: 'Monthly editorial board meeting to discuss journal policies and review processes',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      assigned_to: users[0].id,
      created_by: users[0].id,
      status: 'pending',
      priority: 'medium',
      metadata: {
        meeting_type: 'editorial_board',
        location: 'Virtual - Zoom'
      }
    },
    {
      event_type: 'publication',
      title: 'Volume 1, Issue 2 Publication',
      description: 'Scheduled publication date for the second issue of volume 1',
      start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      all_day: true,
      assigned_to: users[0].id,
      created_by: users[0].id,
      status: 'pending',
      priority: 'high',
      metadata: {
        volume: 1,
        issue: 2,
        expected_articles: 8
      }
    }
  ];

  const { error: eventsError } = await supabase
    .from('editorial_events')
    .insert(events);

  if (eventsError) {
    console.error('Error inserting editorial events:', eventsError);
  } else {
    console.log('✅ Editorial events seeded successfully');
  }
}

async function seedSearchAnalytics() {
  console.log('Seeding search analytics...');

  const searchQueries = [
    'community social work',
    'mental health Africa',
    'social policy',
    'rural development',
    'indigenous knowledge',
    'social protection',
    'urban social work',
    'policy analysis',
    'community development',
    'social justice'
  ];

  const events = [];

  for (let i = 0; i < 100; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);
    const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    const resultsCount = Math.floor(Math.random() * 20) + 1;

    events.push({
      search_query: query,
      filters_applied: {
        volume: Math.random() > 0.7 ? [1] : null,
        year: Math.random() > 0.8 ? [2024] : null,
        article_type: Math.random() > 0.9 ? ['research_article'] : null
      },
      results_count: resultsCount,
      user_session: `session_${Math.random().toString(36).substr(2, 9)}`,
      ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      user_agent: 'Mozilla/5.0 (compatible; Journal Search)',
      response_time_ms: Math.floor(Math.random() * 500) + 50,
      timestamp: timestamp.toISOString()
    });
  }

  const { error: analyticsError } = await supabase
    .from('search_analytics')
    .insert(events);

  if (analyticsError) {
    console.error('Error inserting search analytics:', analyticsError);
  } else {
    console.log('✅ Search analytics seeded successfully');
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedJournalEnhancements().catch(console.error);
}

export { seedJournalEnhancements };