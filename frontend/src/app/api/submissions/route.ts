import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Add CORS headers
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

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let query = supabase
      .from('submissions')
      .select(`
        *,
        users!inner(first_name, last_name, email, affiliation)
      `);
    
    // If userId is provided, filter by that user
    if (userId) {
      query = query.eq('author_id', userId);
    }
    
    const { data: submissions, error } = await query
      .order('submission_date', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(submissions || [], { headers: corsHeaders() });

  } catch (error) {
    console.error('GET submissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Processing manuscript submission...');
    
    const contentType = request.headers.get('content-type');
    let submissionData: any = {};
    
    if (contentType?.includes('application/json')) {
      // Handle JSON submission (from ManuscriptSubmissionForm)
      const jsonData = await request.json();
      submissionData = {
        title: jsonData.title,
        abstract: jsonData.abstract,
        keywords: Array.isArray(jsonData.keywords) ? jsonData.keywords.join(', ') : jsonData.keywords,
        manuscriptType: jsonData.manuscript_type || 'research',
        authors: Array.isArray(jsonData.authors) ? jsonData.authors.join(', ') : jsonData.authors,
        corresponding_author: jsonData.corresponding_author,
        content: jsonData.content,
        funding_information: jsonData.funding_information,
        conflict_of_interest: jsonData.conflict_of_interest,
        ethics_approval: jsonData.ethics_approval,
        data_availability: jsonData.data_availability,
        file: null // No file in JSON submissions for now
      };
    } else {
      // Handle FormData submission (from regular SubmissionForm)
      const formData = await request.formData();
      submissionData = {
        title: formData.get('title') as string,
        abstract: formData.get('abstract') as string,
        keywords: formData.get('keywords') as string,
        manuscriptType: formData.get('manuscriptType') as string,
        file: formData.get('manuscript') as File,
        authors: '', // FormData doesn't have this field yet
        corresponding_author: '',
        content: '',
        funding_information: formData.get('funding') as string,
        conflict_of_interest: formData.get('conflictOfInterest') as string,
        ethics_approval: formData.get('ethicsStatement') as string,
        data_availability: '',
      };
    }

    // Validate required fields
    if (!submissionData.title || !submissionData.abstract) {
      return NextResponse.json(
        { error: 'Missing required fields: title and abstract are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate file type (only for FormData submissions with files)
    let fileUrl = null;
    if (submissionData.file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(submissionData.file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Please upload a PDF or Word document.' },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Validate file size (10MB limit)
      if (submissionData.file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 10MB.' },
          { status: 400, headers: corsHeaders() }
        );
      }

      // For now, we'll store a placeholder file URL
      // In production, you'd upload to cloud storage (Cloudinary, AWS S3, etc.)
      fileUrl = `manuscripts/${Date.now()}-${submissionData.file.name}`;
    }

    // Parse keywords array
    let keywordsArray: string[] = [];
    try {
      if (submissionData.keywords) {
        if (typeof submissionData.keywords === 'string') {
          keywordsArray = submissionData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
        } else if (Array.isArray(submissionData.keywords)) {
          keywordsArray = submissionData.keywords;
        }
      }
    } catch (e) {
      keywordsArray = [];
    }

    // Create submission record
    const dbSubmissionData = {
      title: submissionData.title,
      abstract: submissionData.abstract,
      keywords: keywordsArray,
      manuscript_type: submissionData.manuscriptType || 'research_article',
      manuscript_file_url: fileUrl,
      author_id: '00000000-0000-0000-0000-000000000001', // Default for testing
      status: 'submitted',
      submission_date: new Date().toISOString(),
      co_authors: submissionData.authors ? submissionData.authors.split(',').map((a: string) => a.trim()) : [],
      submission_type: submissionData.manuscriptType || 'research',
      word_count: submissionData.content ? submissionData.content.split(' ').length : 0,
      corresponding_author: submissionData.corresponding_author || '',
      funding_statement: submissionData.funding_information || '',
      conflict_of_interest: submissionData.conflict_of_interest || '',
      ethics_statement: submissionData.ethics_approval || '',
      data_availability: submissionData.data_availability || ''
    };

    console.log('Saving submission to database:', dbSubmissionData);

    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert([dbSubmissionData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save submission to database', details: dbError.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    console.log('Submission saved successfully:', submission);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Manuscript submitted successfully!',
        submission: {
          id: submission.id,
          title: submission.title,
          status: submission.status,
          submission_date: submission.submission_date
        }
      },
      { status: 201, headers: corsHeaders() }
    );

  } catch (error) {
    console.error('POST submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error during submission' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
