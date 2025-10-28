import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Create admin client for accessing auth.users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Ensure authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user has admin permissions
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !userProfile || !['admin', 'editor'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get all users from auth.users table
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
    }

    // Get all users from application users table
    const { data: appUsers, error: appError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (appError) {
      console.error('Failed to fetch users (all):', appError);
      return NextResponse.json({ error: 'Failed to fetch users', details: appError.message }, { status: 500 });
    }

    // Create a map of existing app users
    const appUsersMap = new Map((appUsers || []).map(user => [user.id, user]));

    // Sync missing users from auth to application users table
    let syncedCount = 0;
    if (authUsers && authUsers.users) {
      const missingUsers = authUsers.users.filter(authUser => 
        !appUsersMap.has(authUser.id) && authUser.email_confirmed_at
      );

      for (const authUser of missingUsers) {
        const userData = {
          id: authUser.id,
          email: authUser.email || '',
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          affiliation: authUser.user_metadata?.affiliation || '',
          role: authUser.user_metadata?.role || 'author',
          created_at: authUser.created_at,
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert(userData);

        if (insertError) {
          console.error(`Error inserting user ${authUser.id}:`, insertError);
        } else {
          console.log(`Successfully synced user: ${authUser.email}`);
          appUsersMap.set(authUser.id, userData);
          syncedCount++;
        }
      }
    }

    // Get updated users list
    const { data: updatedUsers, error: updatedError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (updatedError) {
      console.error('Failed to fetch updated users:', updatedError);
      return NextResponse.json({ error: 'Failed to fetch updated users' }, { status: 500 });
    }

    // Enhance users with auth information
    const enhancedUsers = (updatedUsers || []).map(user => {
      const authUser = authUsers?.users.find(au => au.id === user.id);
      return {
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        last_sign_in_at: authUser?.last_sign_in_at,
        email_confirmed_at: authUser?.email_confirmed_at,
        is_active: authUser?.last_sign_in_at ? 
          new Date(authUser.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : 
          false,
        auth_provider: authUser?.app_metadata?.provider || 'email'
      };
    });

    console.log(`Returning ${enhancedUsers.length} users, synced ${syncedCount} from auth`);

    return NextResponse.json(enhancedUsers);
  } catch (err: any) {
    console.error('GET /api/users/all error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err?.message || 'Unknown' }, { status: 500 });
  }
}
