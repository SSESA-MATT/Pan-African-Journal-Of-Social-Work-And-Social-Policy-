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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== GET /api/submissions/[id] request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const submissionId = params.id;

    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;
    console.log('Fetching submission:', submissionId, 'for user:', userId);

    // Get submission with author and reviewer assignment info
    const { data: submission, error } = await supabase
      .from('submissions')
      .select(`
        *,
        author:users!author_id(id, email, first_name, last_name),
        reviewer_assignments(
          id,
          reviewer_id,
          status,
          assigned_at,
          due_date
        ),
        reviews(
          id,
          reviewer_id,
          recommendation,
          status,
          submitted_at
        )
      `)
      .eq('id', submissionId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Submission not found' }, { status: 404, headers: corsHeaders() });
    }

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404, headers: corsHeaders() });
    }

    // Check access permissions
    const isAuthor = submission.author_id === userId;
    const isAssignedReviewer = submission.reviewer_assignments?.some(
      (assignment: any) => assignment.reviewer_id === userId
    );
    
    // Check if user is admin/editor
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdminOrEditor = userProfile?.role && ['admin', 'editor'].includes(userProfile.role);

    if (!isAuthor && !isAssignedReviewer && !isAdminOrEditor) {
      return NextResponse.json({ 
        error: 'Access denied. You do not have permission to view this submission.' 
      }, { status: 403, headers: corsHeaders() });
    }

    // Format the response
    const formattedSubmission = {
      id: submission.id,
      title: submission.title || 'Untitled',
      abstract: submission.abstract || '',
      content: submission.content || '',
      keywords: Array.isArray(submission.keywords) ? submission.keywords : [],
      authors: Array.isArray(submission.co_authors) ? submission.co_authors : [],
      corresponding_author: submission.corresponding_author || '',
      manuscript_type: submission.submission_type || submission.manuscript_type || 'research',
      funding_information: submission.funding_statement || '',
      conflict_of_interest: submission.conflict_of_interest || '',
      ethics_approval: submission.ethics_statement || '',
      data_availability: submission.data_availability || '',
      status: submission.status || 'submitted',
      submission_date: submission.submission_date || submission.created_at,
      created_at: submission.created_at,
      updated_at: submission.updated_at || submission.created_at,
      word_count: Number(submission.word_count) || 0,
      manuscript_file_url: submission.manuscript_file_url || '',
      author: {
        id: submission.author?.id,
        name: submission.author ? 
          `${submission.author.first_name || ''} ${submission.author.last_name || ''}`.trim() || submission.author.email :
          'Unknown Author',
        email: submission.author?.email || ''
      },
      reviewer_assignments: submission.reviewer_assignments || [],
      reviews: submission.reviews || [],
      user_role: {
        is_author: isAuthor,
        is_reviewer: isAssignedReviewer,
        is_admin_or_editor: isAdminOrEditor
      }
    };

    console.log(`Successfully retrieved submission ${submissionId}`);

    return NextResponse.json(formattedSubmission, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('GET submission error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}