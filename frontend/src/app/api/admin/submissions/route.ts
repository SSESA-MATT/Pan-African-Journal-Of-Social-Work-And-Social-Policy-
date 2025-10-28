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
  console.log('=== GET /api/admin/submissions request started ===');
  
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

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('submissions')
      .select(`
        *,
        author:users!author_id(id, email, first_name, last_name),
        reviewer_assignments(
          id,
          status,
          assigned_at,
          due_date,
          reviewer:users!reviewer_id(id, email, first_name, last_name)
        ),
        reviews(
          id,
          status,
          recommendation,
          submitted_at,
          reviewer:users!reviewer_id(id, email, first_name, last_name)
        )
      `)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500, headers: corsHeaders() });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true });

    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Count error:', countError);
    }

    // Enhance submissions with additional computed fields
    const enhancedSubmissions = (submissions || []).map(submission => {
      const reviewerAssignments = submission.reviewer_assignments || [];
      const reviews = submission.reviews || [];
      
      return {
        ...submission,
        author_name: submission.author ? 
          `${submission.author.first_name || ''} ${submission.author.last_name || ''}`.trim() || submission.author.email :
          'Unknown Author',
        author_email: submission.author?.email || '',
        assigned_reviewers: reviewerAssignments.length,
        completed_reviews: reviews.filter((r: any) => r.status === 'completed').length,
        pending_reviews: reviewerAssignments.filter((a: any) => a.status === 'assigned').length,
        overdue_reviews: reviewerAssignments.filter((a: any) => 
          a.status === 'assigned' && a.due_date && new Date(a.due_date) < new Date()
        ).length,
        days_since_submission: Math.floor(
          (new Date().getTime() - new Date(submission.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
        can_assign_reviewers: ['submitted', 'under_review'].includes(submission.status),
        needs_decision: reviews.length > 0 && reviews.every((r: any) => r.status === 'completed')
      };
    });

    console.log(`Found ${enhancedSubmissions.length} submissions (total: ${count})`);

    return NextResponse.json({
      submissions: enhancedSubmissions,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    }, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('GET admin submissions error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(request: NextRequest) {
  console.log('=== PUT /api/admin/submissions request started ===');
  
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
        error: 'Insufficient permissions' 
      }, { status: 403, headers: corsHeaders() });
    }

    const jsonData = await request.json();
    const { submissionId, status, decision, comments } = jsonData;

    if (!submissionId || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: submissionId and status are required' 
      }, { status: 400, headers: corsHeaders() });
    }

    // Validate status
    const validStatuses = [
      'submitted', 'under_review', 'assigned_for_review', 
      'accepted', 'rejected', 'revision_requested', 'published'
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400, headers: corsHeaders() });
    }

    // Update submission
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (decision) {
      updateData.editorial_decision = decision;
    }

    if (comments) {
      updateData.editorial_comments = comments;
    }

    const { data: updatedSubmission, error: updateError } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select(`
        *,
        author:users!author_id(id, email, first_name, last_name)
      `)
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update submission' 
      }, { status: 500, headers: corsHeaders() });
    }

    // TODO: Send notification email to author about status change

    console.log(`Successfully updated submission ${submissionId} to status: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully',
      submission: updatedSubmission
    }, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('PUT admin submissions error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}