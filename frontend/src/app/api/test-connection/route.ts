import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Test connection to Supabase - only if admin client is available
    let authUsers = null;
    let authError = null;
    
    if (supabaseAdmin) {
      const result = await supabaseAdmin.auth.admin.listUsers();
      authUsers = result.data;
      authError = result.error;
      
      if (authError) {
        return NextResponse.json({
          status: 'error',
          message: 'Supabase auth connection failed',
          error: authError.message
        }, { status: 500 });
      }
    }

    // Test database connection
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);

    if (dbError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: dbError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      authUsersCount: authUsers?.users?.length || 0,
      dbUsersCount: dbUsers?.length || 0,
      sampleUsers: dbUsers?.map(u => ({ email: u.email, role: u.role })) || [],
      adminClientAvailable: supabaseAdmin !== null
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
