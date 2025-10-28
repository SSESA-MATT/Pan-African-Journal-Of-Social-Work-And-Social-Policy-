import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
  console.log('=== POST /api/admin/publish request started ===');
  
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

    const jsonData = await request.json();
    const { submissionId, issueId, volumeId, pageStart, pageEnd, doi } = jsonData;

    if (!submissionId) {
      return NextResponse.json({ 
        error: 'Missing required field: submissionId' 
      }, { status: 400, headers: corsHeaders() });
    }

    // Get the submission to publish
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({ 
        error: 'Submission not found' 
      }, { status: 404, headers: corsHeaders() });
    }

    // Check if submission is accepted
    if (submission.status !== 'accepted') {
      return NextResponse.json({ 
        error: 'Only accepted submissions can be published' 
      }, { status: 400, headers: corsHeaders() });
    }

    // Check if already published
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('submission_id', submissionId)
      .single();

    if (existingArticle) {
      return NextResponse.json({ 
        error: 'This submission has already been published' 
      }, { status: 400, headers: corsHeaders() });
    }

    // Create the article record
    const articleData = {
      submission_id: submissionId,
      issue_id: issueId || null,
      volume_id: volumeId || null,
      title: submission.title,
      abstract: submission.abstract,
      content: submission.content,
      keywords: submission.keywords || [],
      authors: submission.co_authors || [],
      pdf_url: submission.manuscript_file_url,
      doi: doi || null,
      page_start: pageStart || null,
      page_end: pageEnd || null,
      article_type: submission.manuscript_type || 'research_article',
      language_code: 'en',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single();

    if (articleError) {
      console.error('Article creation error:', articleError);
      return NextResponse.json({ 
        error: 'Failed to create article',
        details: articleError.message
      }, { status: 500, headers: corsHeaders() });
    }

    // Update submission status to published
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ 
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Submission update error:', updateError);
      // Article was created but submission status wasn't updated
      // This is not critical, but should be logged
    }

    console.log(`Successfully published submission ${submissionId} as article ${article.id}`);

    return NextResponse.json({
      success: true,
      message: 'Article published successfully',
      article: {
        id: article.id,
        title: article.title,
        published_at: article.published_at,
        doi: article.doi
      }
    }, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('Publish article error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      details: error.message
    }, { status: 500, headers: corsHeaders() });
  }
}

// Get list of submissions ready for publication
export async function GET(request: NextRequest) {
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
        error: 'Insufficient permissions' 
      }, { status: 403, headers: corsHeaders() });
    }

    // Get accepted submissions that haven't been published yet
    const { data: readySubmissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        title,
        abstract,
        author_id,
        co_authors,
        keywords,
        manuscript_type,
        word_count,
        manuscript_file_url,
        status,
        created_at,
        updated_at,
        author:users!author_id(id, email, first_name, last_name, affiliation)
      `)
      .eq('status', 'accepted')
      .not('id', 'in', `(SELECT submission_id FROM articles WHERE submission_id IS NOT NULL)`)
      .order('updated_at', { ascending: false });

    if (submissionsError) {
      console.error('Error fetching ready submissions:', submissionsError);
      return NextResponse.json({ 
        error: 'Failed to fetch submissions ready for publication' 
      }, { status: 500, headers: corsHeaders() });
    }

    return NextResponse.json({
      submissions: readySubmissions || [],
      count: (readySubmissions || []).length
    }, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('Get ready for publication error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500, headers: corsHeaders() });
  }
}