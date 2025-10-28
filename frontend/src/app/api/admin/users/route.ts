import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
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
  console.log('=== GET /api/admin/users request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;

    // Check if user is admin or editor
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile || !['admin', 'editor'].includes(userProfile.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Admin or editor role required.' 
      }, { status: 403, headers: corsHeaders() });
    }

    // Get all users from auth.users table
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500, headers: corsHeaders() });
    }

    // Get all users from application users table
    const { data: appUsers, error: appError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (appError) {
      console.error('Error fetching app users:', appError);
      return NextResponse.json({ error: 'Failed to fetch application users' }, { status: 500, headers: corsHeaders() });
    }

    // Create a map of existing app users
    const appUsersMap = new Map(appUsers?.map(user => [user.id, user]) || []);

    // Sync missing users from auth to application users table
    const missingUsers = authUsers.users.filter(authUser => 
      !appUsersMap.has(authUser.id) && authUser.email_confirmed_at
    );

    console.log(`Found ${missingUsers.length} users to sync from auth to application table`);

    // Insert missing users
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
        .insert(userData)
        .select()
        .single();

      if (insertError) {
        console.error(`Error inserting user ${authUser.id}:`, insertError);
      } else {
        console.log(`Successfully synced user: ${authUser.email}`);
        // Add to our local map
        appUsersMap.set(authUser.id, userData);
      }
    }

    // Get updated users list
    const { data: updatedUsers, error: updatedError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (updatedError) {
      console.error('Error fetching updated users:', updatedError);
      return NextResponse.json({ error: 'Failed to fetch updated users' }, { status: 500, headers: corsHeaders() });
    }

    // Enhance users with auth information
    const enhancedUsers = (updatedUsers || []).map(user => {
      const authUser = authUsers.users.find(au => au.id === user.id);
      return {
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        last_sign_in_at: authUser?.last_sign_in_at,
        email_confirmed_at: authUser?.email_confirmed_at,
        is_active: authUser?.last_sign_in_at ? 
          new Date(authUser.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : 
          false, // Active if signed in within last 30 days
        auth_provider: authUser?.app_metadata?.provider || 'email'
      };
    });

    console.log(`Returning ${enhancedUsers.length} users`);

    return NextResponse.json({
      users: enhancedUsers,
      total: enhancedUsers.length,
      synced: missingUsers.length
    }, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('GET users error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(request: NextRequest) {
  console.log('=== PUT /api/admin/users request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders() });
    }

    const currentUserId = session.user.id;

    // Check if user is admin or editor
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUserId)
      .single();

    if (profileError || !userProfile || !['admin', 'editor'].includes(userProfile.role)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Admin or editor role required.' 
      }, { status: 403, headers: corsHeaders() });
    }

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({ error: 'User ID and updates are required' }, { status: 400, headers: corsHeaders() });
    }

    // Validate role if being updated
    if (updates.role && !['admin', 'editor', 'reviewer', 'author'].includes(updates.role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400, headers: corsHeaders() });
    }

    // Update user in application users table
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500, headers: corsHeaders() });
    }

    console.log(`Successfully updated user: ${userId}`);

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully'
    }, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('PUT users error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500, headers: corsHeaders() });
  }
}