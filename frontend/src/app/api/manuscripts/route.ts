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

export async function POST(request: NextRequest) {
  try {
    console.log('Processing manuscript submission via manuscripts API...');
    
    const body = await request.json();
    
    // Extract manuscript data
    const { 
      title, 
      abstract, 
      content, 
      keywords, 
      authors, 
      corresponding_author, 
      manuscript_type,
      funding_information,
      conflict_of_interest,
      ethics_approval,
      data_availability
    } = body;

    // Validate required fields
    if (!title || !abstract || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, abstract, and content are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Create submission record
    const submissionData = {
      title,
      abstract,
      keywords: Array.isArray(keywords) ? keywords : [],
      manuscript_type: manuscript_type || 'research',
      manuscript_file_url: 'text-submission', // For text-based submissions
      author_id: '00000000-0000-0000-0000-000000000001', // Default for testing
      status: 'submitted',
      submission_date: new Date().toISOString(),
      author_statement: funding_information,
      ethics_statement: ethics_approval,
      conflict_of_interest: conflict_of_interest,
      funding_statement: funding_information,
      full_text: content,
      corresponding_author,
      all_authors: Array.isArray(authors) ? authors.join(', ') : authors,
      data_availability_statement: data_availability
    };

    console.log('Saving manuscript to database:', submissionData);

    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert([submissionData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save manuscript to database', details: dbError.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    console.log('Manuscript saved successfully:', submission);

    return NextResponse.json(
      { 
        id: submission.id,
        title: submission.title,
        status: submission.status,
        submission_date: submission.submission_date,
        message: 'Manuscript submitted successfully!'
      },
      { status: 201, headers: corsHeaders() }
    );

  } catch (error) {
    console.error('POST manuscript error:', error);
    return NextResponse.json(
      { error: 'Internal server error during submission' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all manuscripts (this matches the endpoint pattern)
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        users!inner(first_name, last_name, email, affiliation)
      `)
      .order('submission_date', { ascending: false });

    if (error) {
      console.error('Error fetching manuscripts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch manuscripts' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(submissions || [], { headers: corsHeaders() });

  } catch (error) {
    console.error('GET manuscripts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
