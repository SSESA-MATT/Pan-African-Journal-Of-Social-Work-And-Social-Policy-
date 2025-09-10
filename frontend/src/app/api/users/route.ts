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
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(users || [], { headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: user, error } = await supabase
      .from('users')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(user, { status: 201, headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
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
