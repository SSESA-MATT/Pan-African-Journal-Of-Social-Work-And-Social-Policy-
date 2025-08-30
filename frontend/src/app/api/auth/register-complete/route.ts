import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, affiliation, role } = body;

    console.log('Complete registration attempt:', { email, first_name, last_name, role });

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

    // Step 1: Create user with admin client (auto-confirmed)
    const { data: adminUserData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name,
        last_name,
        affiliation: affiliation || '',
        role: role || 'author'
      }
    });

    if (adminError) {
      console.error('Admin user creation error:', adminError);
      return NextResponse.json(
        { error: adminError.message },
        { status: 400 }
      );
    }

    if (!adminUserData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('User created with admin:', adminUserData.user.id);

    // Step 2: Create user profile in our users table
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: adminUserData.user.id,
          email: adminUserData.user.email,
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author'
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // Step 3: Sign in the user to get a proper session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Auto sign-in error:', signInError);
      // User was created but couldn't sign in - they can login manually
      return NextResponse.json({
        message: 'Registration successful! Please log in with your credentials.',
        user: {
          id: adminUserData.user.id,
          email: adminUserData.user.email!,
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author',
          email_confirmed: true
        },
        needsManualLogin: true
      });
    }

    // Step 4: Return success with session data
    return NextResponse.json({
      message: 'Registration and login successful!',
      user: {
        id: signInData.user.id,
        email: signInData.user.email!,
        first_name,
        last_name,
        affiliation: affiliation || '',
        role: role || 'author',
        email_confirmed: true
      },
      token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      autoLoggedIn: true
    });

  } catch (error) {
    console.error('Complete registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
