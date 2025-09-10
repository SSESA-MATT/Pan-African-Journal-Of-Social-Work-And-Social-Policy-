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

    // Get manuscripts for specific user
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        keywords,
        manuscript_type,
        status,
        submission_date,
        full_text,
        corresponding_author,
        all_authors,
        author_statement,
        ethics_statement,
        conflict_of_interest,
        funding_statement,
        data_availability_statement
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
      content: submission.full_text || '',
      keywords: submission.keywords || [],
      authors: submission.all_authors ? submission.all_authors.split(', ') : [],
      corresponding_author: submission.corresponding_author || '',
      manuscript_type: submission.manuscript_type || 'research',
      funding_information: submission.funding_statement || '',
      conflict_of_interest: submission.conflict_of_interest || '',
      ethics_approval: submission.ethics_statement || '',
      data_availability: submission.data_availability_statement || '',
      status: submission.status,
      submission_date: submission.submission_date,
      created_at: submission.submission_date,
      updated_at: submission.submission_date
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
