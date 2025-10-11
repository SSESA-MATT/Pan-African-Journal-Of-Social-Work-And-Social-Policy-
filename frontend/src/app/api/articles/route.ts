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
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get all published articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        abstract,
        authors,
        keywords,
        doi,
        publication_date,
        volume_id,
        issue_id,
        page_start,
        page_end,
        created_at,
        updated_at,
        volumes (
          volume_number,
          year,
          title
        ),
        issues (
          issue_number,
          title,
          publication_date
        )
      `)
      .order('publication_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      return NextResponse.json(
        { error: 'Failed to fetch articles', details: articlesError.message }, 
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting article count:', countError);
    }

    return NextResponse.json({
      articles: articles || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}