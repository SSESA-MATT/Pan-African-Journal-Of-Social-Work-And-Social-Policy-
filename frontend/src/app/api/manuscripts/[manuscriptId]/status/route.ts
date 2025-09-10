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

export async function PUT(
  request: NextRequest,
  { params }: { params: { manuscriptId: string } }
) {
  try {
    const manuscriptId = params.manuscriptId;
    const body = await request.json();
    const { status, notes } = body;

    console.log(`Updating manuscript ${manuscriptId} status to: ${status}`);

    // Validate status
    const validStatuses = ['submitted', 'under_review', 'revision_requested', 'accepted', 'rejected', 'published'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Update manuscript status
    const { data: submission, error } = await supabase
      .from('submissions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', manuscriptId)
      .select()
      .single();

    if (error) {
      console.error('Error updating manuscript status:', error);
      return NextResponse.json(
        { error: 'Failed to update manuscript status' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { 
        message: 'Manuscript status updated successfully',
        manuscript: submission
      },
      { headers: corsHeaders() }
    );

  } catch (error) {
    console.error('PUT status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
