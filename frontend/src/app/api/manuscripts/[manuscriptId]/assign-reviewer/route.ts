import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Lightweight anon client (only used as a fallback).
const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// If a service role key is provided in the environment, create an admin client.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

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

    // Create a route-handler client to validate session/role when service key is not available
    const routeClient = createRouteHandlerClient({ cookies });
    const { data: sessionData, error: sessionError } = await routeClient.auth.getSession();

    // If we don't have a service key, require an authenticated admin/editor session
    if (!supabaseAdmin) {
      if (sessionError || !sessionData?.session?.user) {
        console.error('Unauthorized assign attempt: no session');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
      }

      // Check user's role
      const userId = sessionData.session.user.id;
      const { data: userRow, error: userErr } = await routeClient
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (userErr || !userRow || !['editor', 'admin'].includes(userRow.role)) {
        console.error('Insufficient permissions to assign reviewer');
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403, headers: corsHeaders() });
      }
    }

    // Choose privileged client: admin client (service role) if available, else the route handler client
    const privileged = supabaseAdmin || routeClient;

    // Create review/assignment record. Note: frontend DB schema expects numeric submission IDs.
    const { data: review, error } = await privileged
      .from('reviews')
      .insert([
        {
          submission_id: parseInt(manuscriptId, 10),
          reviewer_id: reviewerId,
          assigned_by: assignedBy || '00000000-0000-0000-0000-000000000001',
          status: 'pending',
          assigned_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error assigning reviewer:', error);
      return NextResponse.json({ error: 'Failed to assign reviewer' }, { status: 500, headers: corsHeaders() });
    }

    // Update manuscript status to under_review
    const { error: updateErr } = await privileged
      .from('submissions')
      .update({ status: 'under_review', updated_at: new Date().toISOString() })
      .eq('id', manuscriptId);

    if (updateErr) {
      console.error('Failed to update submission status:', updateErr);
      // Not fatal for assignment; continue
    }

    return NextResponse.json({ message: 'Reviewer assigned successfully', review }, { headers: corsHeaders() });
  } catch (error) {
    console.error('POST assign reviewer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders() });
  }
}
