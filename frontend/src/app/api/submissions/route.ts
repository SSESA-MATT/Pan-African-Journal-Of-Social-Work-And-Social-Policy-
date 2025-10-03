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
  console.log('=== SECURE GET /api/submissions request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to identify the user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }
    const userId = session.user.id;
    console.log('Fetching submissions for secure user ID:', userId);

    // Fetch submissions for the authenticated user
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database GET error:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions.', details: error.message }, { status: 500, headers: corsHeaders() });
    }

    console.log(`Found ${submissions?.length || 0} submissions for user ${userId}`);

    if (!submissions) {
      return NextResponse.json([], { headers: corsHeaders() });
    }

    // Map to the format expected by the frontend
    const manuscripts = submissions.map((submission: any) => ({
      id: submission.id,
      title: submission.title || 'Untitled',
      abstract: submission.abstract || '',
      content: '',
      keywords: Array.isArray(submission.keywords) ? submission.keywords : [],
      authors: Array.isArray(submission.co_authors) ? submission.co_authors : [],
      corresponding_author: submission.corresponding_author || '',
      manuscript_type: submission.submission_type || 'research',
      funding_information: submission.funding_statement || '',
      conflict_of_interest: submission.conflict_of_interest || '',
      ethics_approval: submission.ethics_statement || '',
      data_availability: submission.data_availability || '',
      status: submission.status || 'submitted',
      submission_date: submission.submission_date || submission.created_at,
      created_at: submission.created_at,
      updated_at: submission.updated_at || submission.created_at,
      last_updated: submission.updated_at || submission.created_at,
      word_count: Number(submission.word_count) || 0,
      manuscript_file_url: submission.manuscript_file_url || '',
      assigned_reviewers: []
    }));

    return NextResponse.json(manuscripts, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('GET submissions error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while fetching submissions.', details: error.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(request: NextRequest) {
  console.log('=== SECURE POST /api/submissions request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError.message);
      return NextResponse.json({ error: 'Failed to get user session.', details: sessionError.message }, { status: 500, headers: corsHeaders() });
    }

    if (!session) {
      console.error('No active session found. User is not authenticated.');
      return NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401, headers: corsHeaders() });
    }

    const secureUserId = session.user.id;
    console.log('Secure user ID from session:', secureUserId);

    const jsonData = await request.json();
    console.log('Received JSON data:', { title: jsonData.title });

    // Map form data to database fields, using the SECURE user ID
    const dbSubmission = {
      title: jsonData.title,
      abstract: jsonData.abstract,
      co_authors: Array.isArray(jsonData.authors) ? jsonData.authors : 
                  (jsonData.authors ? jsonData.authors.split(',').map((a: string) => a.trim()) : []),
      keywords: Array.isArray(jsonData.keywords) ? jsonData.keywords : 
                (jsonData.keywords ? jsonData.keywords.split(',').map((k: string) => k.trim()) : []),
      submission_type: jsonData.manuscript_type || 'research_article',
      corresponding_author: jsonData.corresponding_author || '',
      funding_statement: jsonData.funding_information || '',
      conflict_of_interest: jsonData.conflict_of_interest || 'No conflicts declared',
      ethics_statement: jsonData.ethics_approval || '',
      data_availability: jsonData.data_availability || '',
      manuscript_type: jsonData.manuscript_type || 'research',
      status: 'submitted',
      submission_date: new Date().toISOString(),
      author_id: secureUserId, // Use the secure ID from the session
      word_count: jsonData.word_count || (jsonData.content ? jsonData.content.replace(/<[^>]*>/g, '').split(' ').length : 0),
      manuscript_file_url: '' // File URL will be handled separately
    };

    console.log('Inserting into database with secure author_id:', { title: dbSubmission.title, author_id: dbSubmission.author_id });

    const { data, error } = await supabase
      .from('submissions')
      .insert([dbSubmission])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ error: 'Database insert failed.', details: error }, { status: 500, headers: corsHeaders() });
    }

    console.log('Successfully saved to database:', { id: data.id, title: data.title });

    return NextResponse.json(
      { 
        success: true,
        message: 'Manuscript submitted successfully',
        id: data.id,
        status: 'submitted',
        submission: data
      },
      { status: 201, headers: corsHeaders() }
    );

  } catch (error: any) {
    console.error('POST submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission', details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
