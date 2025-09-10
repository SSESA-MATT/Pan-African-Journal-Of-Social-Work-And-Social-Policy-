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

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching reviewers...');

    // Get all users with reviewer role
    const { data: reviewers, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        affiliation,
        expertise,
        bio,
        created_at
      `)
      .eq('role', 'reviewer')
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching reviewers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviewers' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Transform reviewer data
    const transformedReviewers = (reviewers || []).map(reviewer => ({
      id: reviewer.id,
      name: `${reviewer.first_name} ${reviewer.last_name}`,
      email: reviewer.email,
      affiliation: reviewer.affiliation || '',
      expertise: reviewer.expertise || [],
      bio: reviewer.bio || '',
      created_at: reviewer.created_at
    }));

    return NextResponse.json(transformedReviewers, { headers: corsHeaders() });

  } catch (error) {
    console.error('GET reviewers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
