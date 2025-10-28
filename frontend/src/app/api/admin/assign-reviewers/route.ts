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

export async function POST(request: NextRequest) {
  console.log('=== POST /api/admin/assign-reviewers request started ===');
  
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

    const jsonData = await request.json();
    console.log('Assigning reviewers:', jsonData);

    // Validate required fields
    if (!jsonData.submissionId || !jsonData.reviewerIds || !Array.isArray(jsonData.reviewerIds)) {
      return NextResponse.json({ 
        error: 'Missing required fields: submissionId and reviewerIds array are required' 
      }, { status: 400, headers: corsHeaders() });
    }

    const { submissionId, reviewerIds, dueDate } = jsonData;

    // Validate submission exists
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id, title, status')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ 
        error: 'Submission not found' 
      }, { status: 404, headers: corsHeaders() });
    }

    // Validate reviewers exist and have reviewer role
    const { data: reviewers, error: reviewersError } = await supabase
      .from('users')
      .select('id, email, role')
      .in('id', reviewerIds);

    if (reviewersError || !reviewers || reviewers.length !== reviewerIds.length) {
      return NextResponse.json({ 
        error: 'One or more reviewer IDs are invalid' 
      }, { status: 400, headers: corsHeaders() });
    }

    const invalidReviewers = reviewers.filter(r => !['reviewer', 'admin', 'editor'].includes(r.role));
    if (invalidReviewers.length > 0) {
      return NextResponse.json({ 
        error: `Users without reviewer permissions: ${invalidReviewers.map(r => r.email).join(', ')}` 
      }, { status: 400, headers: corsHeaders() });
    }

    // Check for existing assignments
    const { data: existingAssignments } = await supabase
      .from('reviewer_assignments')
      .select('reviewer_id')
      .eq('submission_id', submissionId)
      .in('reviewer_id', reviewerIds);

    if (existingAssignments && existingAssignments.length > 0) {
      const alreadyAssigned = existingAssignments.map(a => a.reviewer_id);
      const conflictingReviewers = reviewers.filter(r => alreadyAssigned.includes(r.id));
      return NextResponse.json({ 
        error: `Reviewers already assigned: ${conflictingReviewers.map(r => r.email).join(', ')}` 
      }, { status: 409, headers: corsHeaders() });
    }

    // Create reviewer assignments
    const assignments = reviewerIds.map(reviewerId => ({
      submission_id: submissionId,
      reviewer_id: reviewerId,
      assigned_by: userId,
      assigned_at: new Date().toISOString(),
      due_date: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Default 14 days
      status: 'assigned'
    }));

    const { data: createdAssignments, error: assignmentError } = await supabase
      .from('reviewer_assignments')
      .insert(assignments)
      .select(`
        *,
        reviewer:users!reviewer_id(id, email, first_name, last_name)
      `);

    if (assignmentError) {
      console.error('Assignment creation error:', assignmentError);
      return NextResponse.json({ 
        error: 'Failed to create reviewer assignments' 
      }, { status: 500, headers: corsHeaders() });
    }

    // Update submission status
    await supabase
      .from('submissions')
      .update({ 
        status: 'assigned_for_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    // TODO: Send email notifications to reviewers
    // This would be implemented with the email service

    console.log(`Successfully assigned ${reviewerIds.length} reviewers to submission ${submissionId}`);

    return NextResponse.json(
      { 
        success: true,
        message: `Successfully assigned ${reviewerIds.length} reviewers`,
        assignments: createdAssignments,
        submission: {
          id: submission.id,
          title: submission.title,
          status: 'assigned_for_review'
        }
      },
      { status: 201, headers: corsHeaders() }
    );

  } catch (error: any) {
    console.error('POST assign-reviewers error:', error);
    return NextResponse.json(
      { error: 'Failed to assign reviewers', details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('=== GET /api/admin/assign-reviewers request started ===');
  
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

    const url = new URL(request.url);
    const submissionId = url.searchParams.get('submissionId');

    if (submissionId) {
      // Get assignments for specific submission
      const { data: assignments, error } = await supabase
        .from('reviewer_assignments')
        .select(`
          *,
          reviewer:users!reviewer_id(id, email, first_name, last_name, role),
          submission:submissions(id, title, status)
        `)
        .eq('submission_id', submissionId)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500, headers: corsHeaders() });
      }

      return NextResponse.json(assignments || [], { headers: corsHeaders() });
    } else {
      // Get all assignments
      const { data: assignments, error } = await supabase
        .from('reviewer_assignments')
        .select(`
          *,
          reviewer:users!reviewer_id(id, email, first_name, last_name, role),
          submission:submissions(id, title, status, author_id)
        `)
        .order('assigned_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500, headers: corsHeaders() });
      }

      return NextResponse.json(assignments || [], { headers: corsHeaders() });
    }

  } catch (error: any) {
    console.error('GET assign-reviewers error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}