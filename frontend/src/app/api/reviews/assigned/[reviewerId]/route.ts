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
  { params }: { params: { reviewerId: string } }
) {
  try {
    const reviewerId = params.reviewerId;
    console.log(`Fetching assigned reviews for reviewer: ${reviewerId}`);

    // Get reviews assigned to this reviewer
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        submissions!inner(
          id,
          title,
          abstract,
          keywords,
          submission_type,
          submission_date,
          users!inner(first_name, last_name, affiliation)
        )
      `)
      .eq('reviewer_id', reviewerId)
      .in('status', ['pending', 'in_progress'])
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching assigned reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assigned reviews' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Transform reviews for frontend
    const assignedReviews = (reviews || []).map(review => {
      const submission = review.submissions;
      const author = Array.isArray(submission.users) ? submission.users[0] : submission.users;
      
      return {
        id: review.id,
        submission_id: submission.id,
        title: submission.title,
        abstract: submission.abstract,
        keywords: submission.keywords || [],
        manuscript_type: submission.submission_type,
        status: review.status,
        assigned_at: review.assigned_at,
        due_date: new Date(new Date(review.assigned_at).getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from assignment
        author: {
          name: author ? `${author.first_name} ${author.last_name}` : 'Unknown',
          affiliation: author?.affiliation || ''
        },
        submission_date: submission.submission_date
      };
    });

    return NextResponse.json(assignedReviews, { headers: corsHeaders() });

  } catch (error) {
    console.error('GET assigned reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
