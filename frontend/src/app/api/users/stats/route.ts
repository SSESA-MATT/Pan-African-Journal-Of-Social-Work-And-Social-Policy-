import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Use service role key for admin operations (bypasses RLS) - fallback to regular client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : null;

export async function GET(request: NextRequest) {
  try {
    console.log('User stats API error:');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    console.log('User authenticated:', session.user.email);

    // Check user role - use admin client if available, otherwise regular client  
    const clientToUse = supabaseAdmin || supabase;
    const { data: userProfile, error: profileError } = await clientToUse
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    if (!['admin', 'editor'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }

    console.log('User role verified:', userProfile.role);

    // Get user statistics using appropriate client
    const { data: users, error: usersError } = await clientToUse
      .from('users')
      .select('role');

    if (usersError) {
      console.error('Error fetching user stats:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch user statistics', details: usersError.message }, 
        { status: 500 }
      );
    }

    // Calculate statistics
    const statistics = {
      total: users?.length || 0,
      admin: users?.filter(u => u.role === 'admin').length || 0,
      editor: users?.filter(u => u.role === 'editor').length || 0,
      reviewer: users?.filter(u => u.role === 'reviewer').length || 0,
      author: users?.filter(u => u.role === 'author').length || 0
    };

    return NextResponse.json({ statistics });

  } catch (error) {
    console.error('User stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}