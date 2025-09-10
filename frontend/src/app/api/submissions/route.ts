import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Fetch real submissions from database
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        users!inner(first_name, last_name, email, affiliation)
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const keywordsStr = formData.get('keywords') as string;
    const coAuthorsStr = formData.get('co_authors') as string;
    const manuscriptFile = formData.get('manuscript') as File;

    // Basic validation
    if (!title || !abstract || !manuscriptFile) {
      return NextResponse.json(
        { error: 'Missing required fields: title, abstract, and manuscript file are required' },
        { status: 400 }
      );
    }

    // Parse JSON fields
    let keywords = [];
    let coAuthors = [];
    
    try {
      keywords = keywordsStr ? JSON.parse(keywordsStr) : [];
      coAuthors = coAuthorsStr ? JSON.parse(coAuthorsStr) : [];
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in keywords or co_authors field' },
        { status: 400 }
      );
    }

    // Validate file type
    if (manuscriptFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are accepted for manuscripts' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (manuscriptFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be 10MB or less' },
        { status: 400 }
      );
    }

    // TODO: For now, we'll use a mock author ID
    // In production, get this from the JWT token
    const authorId = 'default-author-id';

    // TODO: Upload file to Supabase Storage
    // For now, we'll store a mock file URL
    const fileName = `manuscripts/${Date.now()}-${manuscriptFile.name}`;
    const manuscriptUrl = `https://your-supabase-storage.com/${fileName}`;

    // Insert submission into database
    const { data: newSubmission, error: insertError } = await supabase
      .from('submissions')
      .insert([{
        title,
        abstract,
        keywords,
        co_authors: coAuthors,
        author_id: authorId,
        status: 'submitted',
        manuscript_file_url: manuscriptUrl,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating submission:', insertError);
      return NextResponse.json(
        { error: 'Failed to create submission: ' + insertError.message },
        { status: 500 }
      );
    }

    console.log('Submission created in database:', {
      id: newSubmission.id,
      title: newSubmission.title,
      status: newSubmission.status
    });

    return NextResponse.json({
      message: 'Manuscript submitted successfully',
      submission: newSubmission
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
