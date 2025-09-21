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
  console.log('=== SECURE Admin GET /api/manuscripts/admin/all request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to ensure they're authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    // TODO: Add role check to ensure user is admin
    // For now, we'll allow any authenticated user, but in production this should be restricted
    console.log('Fetching all manuscripts for admin...');

    // Get all manuscripts with author info for admin view
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        users!inner(first_name, last_name, email, affiliation, role)
      `)
      .order('submission_date', { ascending: false });

    if (error) {
      console.error('Error fetching admin manuscripts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch manuscripts', details: error.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Transform to admin manuscript format with author details
    const manuscripts = (submissions || []).map((submission: any) => {
      const user = Array.isArray(submission.users) ? submission.users[0] : submission.users;
      return {
        id: submission.id,
        title: submission.title,
        abstract: submission.abstract,
        keywords: submission.keywords || [],
        authors: Array.isArray(submission.co_authors) ? submission.co_authors : [],
        manuscript_type: submission.submission_type || 'research',
        status: submission.status,
        submission_date: submission.submission_date,
        word_count: submission.word_count || 0,
        manuscript_file_url: submission.manuscript_file_url,
        author: {
          id: user?.id,
          name: user ? `${user.first_name} ${user.last_name}` : 'Unknown',
          email: user?.email,
          affiliation: user?.affiliation,
          role: user?.role
        },
        created_at: submission.created_at || submission.submission_date,
        updated_at: submission.updated_at || submission.submission_date
      };
    });

    return NextResponse.json(manuscripts, { headers: corsHeaders() });

  } catch (error) {
    console.error('GET admin manuscripts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
