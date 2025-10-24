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
  console.log('=== SECURE GET /api/users request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to ensure they're authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    // Only fetch users if the current user is an admin or has appropriate permissions
    // For now, we'll fetch all users but this should be restricted in production
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database GET users error:', error);
      const debug = request.headers.get('x-debug') === '1';
      return NextResponse.json(
        { error: 'Failed to fetch users', details: debug ? error.message : 'Query failed' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(users || [], { headers: corsHeaders() });
  } catch (error: any) {
    console.error('GET users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('=== SECURE POST /api/users request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to ensure they're authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const body = await request.json();
    
    const { data: user, error } = await supabase
      .from('users')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Database POST users error:', error);
      return NextResponse.json(
        { error: 'Failed to create user', details: error.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(user, { status: 201, headers: corsHeaders() });
  } catch (error: any) {
    console.error('POST users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ message: 'Users PUT - Not implemented yet' }, { status: 501, headers: corsHeaders() });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: 'Users DELETE - Not implemented yet' }, { status: 501, headers: corsHeaders() });
}
