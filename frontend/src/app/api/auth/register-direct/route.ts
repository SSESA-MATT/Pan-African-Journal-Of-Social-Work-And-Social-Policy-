import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, affiliation, role } = body;

    console.log('Direct registration attempt:', { email, first_name, last_name, role });

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create user in the users table without password_hash (Supabase Auth handles that)
    const userId = crypto.randomUUID();
    
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: email.toLowerCase(),
          first_name,
          last_name,
          affiliation: affiliation || '',
          role: role || 'author'
        }
      ]);

    if (userError) {
      console.error('User creation error:', userError);
      return NextResponse.json(
        { error: `Failed to create user account: ${userError.message}` },
        { status: 500 }
      );
    }

    console.log('User created successfully:', userId);

    return NextResponse.json({
      message: 'Registration successful! You can now log in.',
      user: {
        id: userId,
        email: email.toLowerCase(),
        first_name,
        last_name,
        affiliation: affiliation || '',
        role: role || 'author'
      },
      success: true
    });

  } catch (error) {
    console.error('Direct registration error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
