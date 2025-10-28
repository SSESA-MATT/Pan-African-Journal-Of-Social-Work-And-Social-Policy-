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
  console.log('=== GET /api/reviews request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('No session found - returning 401');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;
    console.log('Fetching reviews for user ID:', userId);

    // For reviewer dashboard, only fetch user's own reviews (much faster)
    // Admin/editor views should use separate endpoints
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        submission:submissions(
          id,
          title,
          status,
          created_at,
          author_id
        )
      `)
      .eq('reviewer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500, headers: corsHeaders() });
    }

    console.log(`Found ${reviews?.length || 0} reviews for user ${userId}`);

    // Ensure reviews is always an array to prevent filter errors
    const reviewsArray = Array.isArray(reviews) ? reviews : [];
    
    return NextResponse.json(reviewsArray, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('GET reviews error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(request: NextRequest) {
  console.log('=== POST /api/reviews request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;
    const jsonData = await request.json();
    console.log('Creating review for submission:', jsonData.submissionId);

    // Validate required fields
    if (!jsonData.submissionId || !jsonData.comments || !jsonData.recommendation) {
      return NextResponse.json({ 
        error: 'Missing required fields: submissionId, comments, and recommendation are required' 
      }, { status: 400, headers: corsHeaders() });
    }

    // Check if user is assigned as reviewer for this submission
    const { data: assignment, error: assignmentError } = await supabase
      .from('reviewer_assignments')
      .select('*')
      .eq('submission_id', jsonData.submissionId)
      .eq('reviewer_id', userId)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ 
        error: 'You are not assigned as a reviewer for this submission' 
      }, { status: 403, headers: corsHeaders() });
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('submission_id', jsonData.submissionId)
      .eq('reviewer_id', userId)
      .single();

    if (existingReview) {
      return NextResponse.json({ 
        error: 'You have already submitted a review for this submission' 
      }, { status: 409, headers: corsHeaders() });
    }

    // Create the review
    const reviewData = {
      submission_id: jsonData.submissionId,
      reviewer_id: userId,
      comments: jsonData.comments,
      recommendation: jsonData.recommendation,
      status: 'completed',
      submitted_at: new Date().toISOString()
    };

    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();

    if (reviewError) {
      console.error('Database insert error:', reviewError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500, headers: corsHeaders() });
    }

    // Update reviewer assignment status
    await supabase
      .from('reviewer_assignments')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', assignment.id);

    // Update submission status if all reviews are completed
    const { data: allAssignments } = await supabase
      .from('reviewer_assignments')
      .select('status')
      .eq('submission_id', jsonData.submissionId);

    const allCompleted = allAssignments?.every(a => a.status === 'completed');
    
    if (allCompleted) {
      await supabase
        .from('submissions')
        .update({ status: 'under_review' })
        .eq('id', jsonData.submissionId);
    }

    console.log('Successfully created review:', review.id);

    return NextResponse.json(
      { 
        success: true,
        message: 'Review submitted successfully',
        review: review
      },
      { status: 201, headers: corsHeaders() }
    );

  } catch (error: any) {
    console.error('POST reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to process review', details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
