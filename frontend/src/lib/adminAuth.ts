import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function verifyAdminAuth(request: NextRequest) {
  try {
    // Try multiple auth methods
    let user = null;
    let authMethod = '';

    // Method 1: Authorization header (for your current setup)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: { user: tokenUser }, error } = await supabase.auth.getUser(token);
      if (!error && tokenUser) {
        user = tokenUser;
        authMethod = 'bearer';
      }
    }

    // Method 2: Try cookies if bearer failed
    if (!user) {
      // This would require more complex cookie parsing
      // For now, we'll rely on bearer tokens
    }

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
        status: 401
      };
    }

    // Check user role
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return {
        success: false,
        error: 'User profile not found',
        status: 404
      };
    }

    if (!['admin', 'editor'].includes(userProfile.role)) {
      return {
        success: false,
        error: 'Insufficient permissions',
        status: 403
      };
    }

    return {
      success: true,
      user,
      profile: userProfile,
      authMethod
    };

  } catch (error) {
    return {
      success: false,
      error: 'Authentication error',
      status: 500
    };
  }
}

// Helper function to create admin responses
export function createAuthResponse(authResult: any) {
  if (!authResult.success) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  return null; // Success, continue
}