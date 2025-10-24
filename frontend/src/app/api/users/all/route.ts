import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Ensure authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch users (all):', error);
      return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 });
    }

    return NextResponse.json(users || []);
  } catch (err: any) {
    console.error('GET /api/users/all error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err?.message || 'Unknown' }, { status: 500 });
  }
}
