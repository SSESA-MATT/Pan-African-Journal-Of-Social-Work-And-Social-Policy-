import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use admin client to bypass email confirmation requirements
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Try admin client first, fallback to regular client
const supabaseAdmin = supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) : null;

const supabaseRegular = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, affiliation, role } = body;

    console.log('Simple registration attempt:', { email, first_name, last_name, role });

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

    // Method 1: Try admin client if available (bypasses email confirmation)
    if (supabaseAdmin) {
      console.log('Using admin client for instant registration...');
      
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase(),
          password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            first_name,
            last_name,
            affiliation: affiliation || '',
            role: role || 'author'
          }
        });

        if (authError) {
          console.error('Admin create user error:', authError);
          // Fall through to regular method
        } else if (authData.user) {
          console.log('Admin user created successfully:', authData.user.id);
          
          // Create profile in users table
          const { error: profileError } = await supabaseAdmin
            .from('users')
            .insert([
              {
                id: authData.user.id,
                email: authData.user.email!,
                first_name,
                last_name,
                affiliation: affiliation || '',
                role: role || 'author',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          return NextResponse.json({
            message: 'Registration successful! You can now sign in immediately.',
            user: {
              id: authData.user.id,
              email: authData.user.email!,
              first_name,
              last_name,
              affiliation: affiliation || '',
              role: role || 'author',
              email_confirmed: true
            },
            success: true,
            instantLogin: true
          });
        }
      } catch (adminError) {
        console.error('Admin registration failed, trying regular method:', adminError);
      }
    }

    // Method 2: Regular signup (may require email confirmation)
    console.log('Using regular signup method...');
    
    const { data: authData, error: authError } = await supabaseRegular.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author'
        }
      }
    });

    if (authError) {
      console.error('Regular signup error:', authError);
      
      // Handle specific errors
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please try signing in instead.' },
          { status: 400 }
        );
      }
      
      if (authError.message.includes('signup disabled') || authError.message.includes('email confirmation')) {
        return NextResponse.json(
          { error: 'Email registration is currently having issues. Please contact support or try again later.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Registration failed: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('Regular user created:', authData.user.id);

    // Try to create profile (might fail due to RLS, that's OK)
    try {
      const { error: profileError } = await supabaseRegular
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email!,
            first_name,
            last_name,
            affiliation: affiliation || '',
            role: role || 'author',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('Profile creation error (may be handled by trigger):', profileError);
      }
    } catch (profileErr) {
      console.log('Profile creation exception (continuing):', profileErr);
    }

    // Return success
    const needsConfirmation = !authData.user.email_confirmed_at;
    
    return NextResponse.json({
      message: needsConfirmation 
        ? 'Registration successful! Please check your email to confirm your account.'
        : 'Registration successful! You can now sign in.',
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        first_name,
        last_name,
        affiliation: affiliation || '',
        role: role || 'author',
        email_confirmed: !needsConfirmation
      },
      success: true,
      needsEmailConfirmation: needsConfirmation
    });

  } catch (error) {
    console.error('Simple registration error:', error);
    return NextResponse.json(
      { error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}