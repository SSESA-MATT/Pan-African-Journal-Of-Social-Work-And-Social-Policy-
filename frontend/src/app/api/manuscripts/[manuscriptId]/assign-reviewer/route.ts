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

export async function POST(
  request: NextRequest,
  { params }: { params: { manuscriptId: string } }
) {
  try {
    const manuscriptId = params.manuscriptId;
    const body = await request.json();
    const { reviewerId, assignedBy } = body;

    console.log(`Assigning reviewer ${reviewerId} to manuscript ${manuscriptId}`);

    // Create review record
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        submission_id: parseInt(manuscriptId),
        reviewer_id: reviewerId,
        assigned_by: assignedBy || '00000000-0000-0000-0000-000000000001',
        status: 'pending',
        assigned_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error assigning reviewer:', error);
      return NextResponse.json(
        { error: 'Failed to assign reviewer' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Update manuscript status to under_review
    await supabase
      .from('submissions')
      .update({ 
        status: 'under_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', manuscriptId);

    return NextResponse.json(
      { 
        message: 'Reviewer assigned successfully',
        review
      },
      { headers: corsHeaders() }
    );

  } catch (error) {
    console.error('POST assign reviewer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
