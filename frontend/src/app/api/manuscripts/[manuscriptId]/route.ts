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
  { params }: { params: { manuscriptId: string } }
) {
  console.log('=== SECURE GET manuscript by ID request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to ensure they're authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const manuscriptId = params.manuscriptId;
    console.log(`Fetching manuscript: ${manuscriptId}`);

    // Get specific manuscript by ID
    const { data: submission, error } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        keywords,
        co_authors,
        submission_type,
        status,
        submission_date,
        word_count,
        manuscript_file_url,
        created_at,
        updated_at,
        users!inner(first_name, last_name, email, affiliation)
      `)
      .eq('id', manuscriptId)
      .single();

    if (error) {
      console.error('Error fetching manuscript:', error);
      return NextResponse.json(
        { error: 'Manuscript not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Transform to manuscript format
    const user = Array.isArray(submission.users) ? submission.users[0] : submission.users;
    const manuscript = {
      id: submission.id,
      title: submission.title,
      abstract: submission.abstract,
      content: '', // Not stored in current schema
      keywords: submission.keywords || [],
      authors: Array.isArray(submission.co_authors) ? submission.co_authors : [],
      corresponding_author: user ? `${user.first_name} ${user.last_name}` : '',
      manuscript_type: submission.submission_type || 'research',
      funding_information: '',
      conflict_of_interest: '',
      ethics_approval: '',
      data_availability: '',
      status: submission.status,
      submission_date: submission.submission_date,
      created_at: submission.created_at || submission.submission_date,
      updated_at: submission.updated_at || submission.submission_date,
      word_count: submission.word_count || 0,
      manuscript_file_url: submission.manuscript_file_url,
      author_info: user
    };

    return NextResponse.json(manuscript, { headers: corsHeaders() });

  } catch (error) {
    console.error('GET manuscript error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { manuscriptId: string } }
) {
  console.log('=== SECURE PUT manuscript by ID request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to ensure they're authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const secureUserId = session.user.id;
    const manuscriptId = params.manuscriptId;
    const body = await request.json();
    
    console.log(`Updating manuscript: ${manuscriptId}`);

    // Update manuscript data
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.abstract) updateData.abstract = body.abstract;
    if (body.keywords) updateData.keywords = Array.isArray(body.keywords) ? body.keywords : [];
    if (body.authors) updateData.co_authors = Array.isArray(body.authors) ? body.authors : [];
    if (body.manuscript_type) updateData.submission_type = body.manuscript_type;
    if (body.content) updateData.word_count = body.content.split(' ').length;
    updateData.updated_at = new Date().toISOString();

    const { data: submission, error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', manuscriptId)
      .eq('author_id', secureUserId) // Ensure user can only update their own manuscripts
      .select()
      .single();

    if (error) {
      console.error('Error updating manuscript:', error);
      return NextResponse.json(
        { error: 'Failed to update manuscript' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { message: 'Manuscript updated successfully', manuscript: submission },
      { headers: corsHeaders() }
    );

  } catch (error) {
    console.error('PUT manuscript error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { manuscriptId: string } }
) {
  console.log('=== SECURE DELETE manuscript by ID request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to ensure they're authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const secureUserId = session.user.id;
    const manuscriptId = params.manuscriptId;
    console.log(`Deleting manuscript: ${manuscriptId}`);

    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', manuscriptId)
      .eq('author_id', secureUserId); // Ensure user can only delete their own manuscripts

    if (error) {
      console.error('Error deleting manuscript:', error);
      return NextResponse.json(
        { error: 'Failed to delete manuscript', details: error.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { message: 'Manuscript deleted successfully' },
      { headers: corsHeaders() }
    );

  } catch (error: any) {
    console.error('DELETE manuscript error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
