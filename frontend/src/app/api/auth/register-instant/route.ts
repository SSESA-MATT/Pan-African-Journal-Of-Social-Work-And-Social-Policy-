import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, affiliation, role } = body;

    console.log('Instant registration attempt:', { email, first_name, last_name, role });

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Register user with Supabase Auth WITHOUT email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This bypasses email confirmation
        emailRedirectTo: undefined,
        data: {
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author'
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('User created:', authData.user.id);

    // For instant registration, we'll confirm the user's email automatically
    if (authData.user && !authData.user.email_confirmed_at) {
      console.log('Auto-confirming user email...');
      
      try {
        // Use admin client to confirm the user
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          authData.user.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.error('Email confirmation error:', confirmError);
          // Continue anyway - user is created
        } else {
          console.log('Email confirmed automatically');
        }
      } catch (confirmError) {
        console.error('Auto-confirm error:', confirmError);
        // Continue anyway - user is created
      }
    }

    // Create user profile in our users table using admin client
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: authData.user.email,
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author'
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue - user was created in auth
    }

    // Return success - user can login immediately
    return NextResponse.json({
      message: 'Registration successful! You can now log in.',
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        first_name,
        last_name,
        affiliation: affiliation || '',
        role: role || 'author',
        email_confirmed: true // Treated as confirmed
      },
      needsEmailConfirmation: false
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
