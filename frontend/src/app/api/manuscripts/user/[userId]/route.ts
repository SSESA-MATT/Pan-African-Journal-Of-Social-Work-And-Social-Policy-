import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    console.log(`Fetching manuscripts for user: ${userId}`);

    // Get manuscripts for specific user using only valid columns
    const { data: submissions, error } = await supabase
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
        updated_at
      `)
      .eq('author_id', userId)
      .order('submission_date', { ascending: false });

    if (error) {
      console.error('Error fetching user manuscripts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch manuscripts' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Transform to match the expected manuscript format
    const manuscripts = (submissions || []).map(submission => ({
      id: submission.id,
      title: submission.title,
      abstract: submission.abstract,
      content: '', // Not stored in database for this version
      keywords: submission.keywords || [],
      authors: Array.isArray(submission.co_authors) ? submission.co_authors : [],
      corresponding_author: '', // Not stored separately in current schema
      manuscript_type: submission.submission_type || 'research',
      funding_information: '', // Not stored in current schema
      conflict_of_interest: '', // Not stored in current schema  
      ethics_approval: '', // Not stored in current schema
      data_availability: '', // Not stored in current schema
      status: submission.status,
      submission_date: submission.submission_date,
      created_at: submission.created_at || submission.submission_date,
      updated_at: submission.updated_at || submission.submission_date,
      word_count: submission.word_count || 0,
      manuscript_file_url: submission.manuscript_file_url
    }));

    return NextResponse.json(manuscripts, { headers: corsHeaders() });

  } catch (error) {
    console.error('GET user manuscripts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
