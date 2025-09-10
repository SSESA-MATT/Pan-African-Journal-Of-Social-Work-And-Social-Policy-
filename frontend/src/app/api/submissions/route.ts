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
    // Fetch real submissions from database
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        users!inner(first_name, last_name, email, affiliation)
      `)
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
    
    const formData = await request.formData();
    
    // Extract form data
    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const keywords = formData.get('keywords') as string;
    const manuscriptType = formData.get('manuscriptType') as string;
    const file = formData.get('manuscript') as File;
    const authorStatement = formData.get('authorStatement') as string;
    const ethicsStatement = formData.get('ethicsStatement') as string;
    const conflictOfInterest = formData.get('conflictOfInterest') as string;
    const funding = formData.get('funding') as string;

    // Validate required fields
    if (!title || !abstract || !file) {
      return NextResponse.json(
        { error: 'Missing required fields: title, abstract, and manuscript file are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or Word document.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // For now, we'll store a placeholder file URL
    // In production, you'd upload to cloud storage (Cloudinary, AWS S3, etc.)
    const fileUrl = `manuscripts/${Date.now()}-${file.name}`;

    // Parse keywords array
    let keywordsArray: string[] = [];
    try {
      keywordsArray = keywords ? keywords.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];
    } catch (e) {
      keywordsArray = [];
    }

    // Create submission record
    const submissionData = {
      title,
      abstract,
      keywords: keywordsArray,
      manuscript_type: manuscriptType || 'research_article',
      manuscript_file_url: fileUrl,
      author_id: '00000000-0000-0000-0000-000000000001', // Default for testing
      status: 'submitted',
      submission_date: new Date().toISOString(),
      author_statement: authorStatement,
      ethics_statement: ethicsStatement,
      conflict_of_interest: conflictOfInterest,
      funding_statement: funding
    };

    console.log('Saving submission to database:', submissionData);

    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert([submissionData])
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
