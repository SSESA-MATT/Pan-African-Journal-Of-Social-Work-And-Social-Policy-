import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('=== REVIEWER AUTH DEBUG ENDPOINT ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Reviewer Auth Debug - Session error:', sessionError);
    console.log('Reviewer Auth Debug - Session exists:', !!session);
    console.log('Reviewer Auth Debug - Session user ID:', session?.user?.id);
    console.log('Reviewer Auth Debug - Session user email:', session?.user?.email);
    
    // Also check user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('Reviewer Auth Debug - User error:', userError);
    console.log('Reviewer Auth Debug - User exists:', !!user);
    console.log('Reviewer Auth Debug - User ID:', user?.id);
    console.log('Reviewer Auth Debug - User email:', user?.email);

    // Get user profile to check role
    let userProfile = null;
    let profileError = null;
    if (session?.user?.id) {
      const { data: profile, error: pError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      userProfile = profile;
      profileError = pError;
      
      console.log('Reviewer Auth Debug - Profile error:', profileError);
      console.log('Reviewer Auth Debug - Profile exists:', !!userProfile);
      console.log('Reviewer Auth Debug - Profile role:', userProfile?.role);
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        error: sessionError?.message || null
      },
      user: {
        exists: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        error: userError?.message || null
      },
      profile: {
        exists: !!userProfile,
        role: userProfile?.role || null,
        firstName: userProfile?.first_name || null,
        lastName: userProfile?.last_name || null,
        error: profileError?.message || null
      },
      cookies: request.headers.get('cookie') ? 'Present' : 'Missing',
      cookieHeader: request.headers.get('cookie') || 'No cookies',
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      origin: request.headers.get('origin')
    });
    
  } catch (error: any) {
    console.error('Reviewer auth debug error:', error);
    return NextResponse.json({ 
      error: 'Reviewer auth debug failed', 
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}