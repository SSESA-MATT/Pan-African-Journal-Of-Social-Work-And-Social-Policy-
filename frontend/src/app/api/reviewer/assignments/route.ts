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
  console.log('=== GET /api/reviewer/assignments request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found - returning 401');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;
    console.log('Fetching reviewer assignments for user ID:', userId);

    // Check if user has reviewer permissions
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile || !['reviewer', 'admin', 'editor'].includes(userProfile.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Reviewer role required.' 
      }, { status: 403, headers: corsHeaders() });
    }

    // Get reviewer assignments with submission details
    const { data: assignments, error } = await supabase
      .from('reviewer_assignments')
      .select(`
        *,
        submission:submissions(
          id,
          title,
          abstract,
          author_id,
          status,
          created_at,
          manuscript_type,
          word_count,
          author:users!author_id(id, email, first_name, last_name)
        ),
        review:reviews(id, status, recommendation, submitted_at)
      `)
      .eq('reviewer_id', userId)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500, headers: corsHeaders() });
    }

    console.log(`Found ${assignments?.length || 0} assignments for user ${userId}`);

    // Ensure assignments is always an array and enhance with computed fields
    const assignmentsArray = Array.isArray(assignments) ? assignments : [];
    
    const enhancedAssignments = assignmentsArray.map(assignment => {
      const submission = assignment.submission;
      const review = assignment.review;
      
      return {
        ...assignment,
        submission: {
          ...submission,
          author_name: submission?.author ? 
            `${submission.author.first_name || ''} ${submission.author.last_name || ''}`.trim() || submission.author.email :
            'Unknown Author',
          author_email: submission?.author?.email || ''
        },
        is_overdue: assignment.due_date && new Date(assignment.due_date) < new Date(),
        days_until_due: assignment.due_date ? 
          Math.ceil((new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
          null,
        has_review: !!review,
        review_status: review?.status || null,
        can_review: assignment.status === 'assigned' && !review
      };
    });
    
    return NextResponse.json(enhancedAssignments, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('GET reviewer assignments error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(request: NextRequest) {
  console.log('=== PUT /api/reviewer/assignments request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;
    const jsonData = await request.json();
    const { assignmentId, status } = jsonData;

    if (!assignmentId || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: assignmentId and status are required' 
      }, { status: 400, headers: corsHeaders() });
    }

    // Validate status
    const validStatuses = ['assigned', 'in_progress', 'completed', 'declined'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400, headers: corsHeaders() });
    }

    // Check if assignment belongs to the current user
    const { data: assignment, error: assignmentError } = await supabase
      .from('reviewer_assignments')
      .select('*')
      .eq('id', assignmentId)
      .eq('reviewer_id', userId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ 
        error: 'Assignment not found or access denied' 
      }, { status: 404, headers: corsHeaders() });
    }

    // Update assignment status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updatedAssignment, error: updateError } = await supabase
      .from('reviewer_assignments')
      .update(updateData)
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update assignment status' 
      }, { status: 500, headers: corsHeaders() });
    }

    console.log(`Successfully updated assignment ${assignmentId} to status: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'Assignment status updated successfully',
      assignment: updatedAssignment
    }, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('PUT reviewer assignments error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}