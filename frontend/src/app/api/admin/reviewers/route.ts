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
  console.log('=== GET /api/admin/reviewers request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;

    // Check if user is admin or editor
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile || !['admin', 'editor'].includes(userProfile.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Admin or editor role required.' 
      }, { status: 403, headers: corsHeaders() });
    }

    // Get all users with reviewer, admin, or editor roles
    const { data: reviewers, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        last_sign_in_at
      `)
      .in('role', ['reviewer', 'admin', 'editor'])
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch reviewers' }, { status: 500, headers: corsHeaders() });
    }

    // Get reviewer workload (current active assignments)
    const { data: workload } = await supabase
      .from('reviewer_assignments')
      .select('reviewer_id')
      .in('status', ['assigned', 'in_progress']);

    // Count assignments per reviewer
    const workloadMap = (workload || []).reduce((acc: Record<string, number>, assignment: any) => {
      acc[assignment.reviewer_id] = (acc[assignment.reviewer_id] || 0) + 1;
      return acc;
    }, {});

    // Enhance reviewers with workload information
    const enhancedReviewers = (reviewers || []).map(reviewer => ({
      ...reviewer,
      name: `${reviewer.first_name || ''} ${reviewer.last_name || ''}`.trim() || reviewer.email,
      currentAssignments: workloadMap[reviewer.id] || 0,
      isActive: reviewer.last_sign_in_at ? 
        new Date(reviewer.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : 
        false // Active if signed in within last 30 days
    }));

    console.log(`Found ${enhancedReviewers.length} potential reviewers`);

    return NextResponse.json(enhancedReviewers, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('GET reviewers error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}