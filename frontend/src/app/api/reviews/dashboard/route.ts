import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Add CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching reviewer dashboard data from database...');
    
    // Fetch all submissions that need review (prioritize real users over test data)
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        keywords,
        submission_date,
        status,
        users!inner(first_name, last_name, affiliation)
      `)
      .in('status', ['submitted', 'under_review'])
      .not('author_id', 'in', '("00000000-0000-0000-0000-000000000001","00000000-0000-0000-0000-000000000002","00000000-0000-0000-0000-000000000003")')
      .order('submission_date', { ascending: false });

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch submissions', details: submissionsError.message },
        { status: 500 }
      );
    }

    // Transform submissions for pending reviews
    const pendingReviews = (submissions || []).map(submission => {
      const user = Array.isArray(submission.users) ? submission.users[0] : submission.users;
      return {
        id: `pending-${submission.id}`,
        submission_id: submission.id,
        title: submission.title,
        abstract: submission.abstract,
        status: 'pending',
        submitted_at: submission.submission_date,
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        author_first_name: user?.first_name || 'Unknown',
        author_last_name: user?.last_name || 'Author',
        author_affiliation: user?.affiliation || 'Unknown',
        keywords: submission.keywords || [],
        priority: 'medium',
        manuscript_type: 'research_article'
      };
    });

    const dashboardData = {
      pendingReviews: pendingReviews.slice(0, 5),
      completedReviews: [], // TODO: Fetch completed reviews
      reviewStats: {
        totalReviews: 0,
        pendingCount: pendingReviews.length,
        completedThisMonth: 0,
        averageReviewTime: 18,
        acceptanceRate: 0.4,
        onTimeCompletionRate: 0.85,
        expertise_areas: ['community social work', 'decolonial practice'],
        performance_rating: 4.2
      }
    };

    // Add fallback message if no real user data
    if (dashboardData.pendingReviews.length === 0) {
      dashboardData.pendingReviews = [{
        id: 'fallback-1',
        submission_id: 'none',
        title: 'No real user submissions yet - Waiting for authors to submit manuscripts',
        abstract: 'The system is ready to receive real submissions. Authors can register and submit manuscripts through the author portal. Real submissions will appear here automatically.',
        status: 'pending',
        submitted_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        author_first_name: 'System',
        author_last_name: 'Ready',
        author_affiliation: 'Awaiting Real Users',
        keywords: ['real-users', 'submissions', 'ready'],
        priority: 'low',
        manuscript_type: 'system_message'
      }];
    }

    return NextResponse.json(dashboardData, { headers: corsHeaders() });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
