import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get user role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || !['admin', 'editor'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' }, 
        { status: 403 }
      );
    }

    // Get user statistics
    const { data: users, error: usersError } = await supabase
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