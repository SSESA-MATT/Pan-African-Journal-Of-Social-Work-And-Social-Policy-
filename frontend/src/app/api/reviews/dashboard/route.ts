import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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
  console.log('=== SECURE GET /api/reviews/dashboard request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to ensure they're authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session error:', sessionError);
    console.log('Session exists:', !!session);
    console.log('Session user ID:', session?.user?.id);
    
    if (sessionError || !session) {
      console.log('No session found - returning 401');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;
    console.log('Fetching reviewer dashboard data for user:', userId);

    // Get user profile to check reviewer role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404, headers: corsHeaders() });
    }

    // Check if user has reviewer permissions
    if (!['reviewer', 'editor', 'admin'].includes(userProfile.role)) {
      console.log('User does not have reviewer permissions, role:', userProfile.role);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403, headers: corsHeaders() });
    }

    console.log('User has reviewer permissions, fetching submissions...');
    
    // Fetch submissions that need review - using a more compatible query
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        submission_date,
        author_id,
        submission_type,
        keywords,
        status
      `)
      .in('status', ['submitted', 'under_review'])
      .order('submission_date', { ascending: false })
      .limit(10);

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch submissions', details: submissionsError.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    console.log(`Found ${submissions?.length || 0} submissions for review`);

    // For each submission, get the author info separately
    const pendingReviews = [];
    if (submissions && submissions.length > 0) {
      for (const submission of submissions) {
        try {
          // Get author info with a simpler query
          const { data: author } = await supabase
            .from('users')
            .select('first_name, last_name, affiliation')
            .eq('id', submission.author_id)
            .single();

          // Add the review item regardless of whether we found author info
          pendingReviews.push({
            id: `pending-${submission.id}`,
            submission_id: submission.id,
            title: submission.title,
            abstract: submission.abstract,
            status: 'pending',
            submitted_at: submission.submission_date,
            due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            author_first_name: author?.first_name || 'Unknown',
            author_last_name: author?.last_name || 'Author',
            author_affiliation: author?.affiliation || 'Unknown',
            keywords: submission.keywords || [],
            priority: 'medium',
            manuscript_type: submission.submission_type || 'research_article'
          });
        } catch (authorErr) {
          console.error('Error fetching author for submission:', submission.id, authorErr);
          // Still add the submission even if author fetch fails
          pendingReviews.push({
            id: `pending-${submission.id}`,
            submission_id: submission.id,
            title: submission.title,
            abstract: submission.abstract,
            status: 'pending',
            submitted_at: submission.submission_date,
            due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            author_first_name: 'Unknown',
            author_last_name: 'Author',
            author_affiliation: 'Unknown',
            keywords: submission.keywords || [],
            priority: 'medium',
            manuscript_type: submission.submission_type || 'research_article'
          });
        }
      }
    }

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
        title: 'No submissions available for review',
        abstract: 'There are currently no manuscripts pending review. New submissions will appear here automatically when authors submit their work.',
        status: 'pending',
        submitted_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        author_first_name: 'System',
        author_last_name: 'Message',
        author_affiliation: 'Journal System',
        keywords: ['waiting', 'submissions'],
        priority: 'low',
        manuscript_type: 'system_message'
      }];
    }

    console.log('Returning dashboard data with', dashboardData.pendingReviews.length, 'pending reviews');
    return NextResponse.json(dashboardData, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('Dashboard API error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error?.message || 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
