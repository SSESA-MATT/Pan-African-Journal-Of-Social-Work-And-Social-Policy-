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

    console.log('User has reviewer permissions, creating mock dashboard data...');
    
    // For now, let's return mock data to test if the RLS issue is with the submissions table
    // We'll gradually add real data back once we confirm this works
    const dashboardData = {
      pendingReviews: [
        {
          id: 'mock-1',
          submission_id: 'mock-submission-1',
          title: 'Sample Manuscript for Review',
          abstract: 'This is a sample manuscript that demonstrates the reviewer dashboard functionality. In a real system, this would be populated with actual submission data from authors.',
          status: 'pending',
          submitted_at: new Date().toISOString(),
          due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          author_first_name: 'Sample',
          author_last_name: 'Author',
          author_affiliation: 'Sample University',
          keywords: ['social work', 'community development'],
          priority: 'medium',
          manuscript_type: 'research_article'
        }
      ],
      completedReviews: [],
      reviewStats: {
        totalReviews: 1,
        pendingCount: 1,
        completedThisMonth: 0,
        averageReviewTime: 18,
        acceptanceRate: 0.4,
        onTimeCompletionRate: 0.85,
        expertise_areas: ['community social work', 'decolonial practice'],
        performance_rating: 4.2
      }
    };

    console.log('Returning mock dashboard data');
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
