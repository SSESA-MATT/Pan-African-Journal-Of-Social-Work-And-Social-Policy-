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
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      
      // If no profile exists, create one from auth user data
      const userData = user.user_metadata || {};
      const { data: createdProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          affiliation: userData.affiliation || '',
          role: userData.role || 'author'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create user profile' }, 
          { status: 500 }
        );
      }

      return NextResponse.json(createdProfile);
    }

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Auth user endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}