// Using standard Request/Response instead of Next.js types to avoid dependency issues

export async function GET(request: Request) {
  try {
    // Mock submissions data for now
    const submissions = [
      {
        id: 'sub-1',
        title: 'Ubuntu Philosophy in Social Work Practice',
        abstract: 'This paper explores the integration of Ubuntu philosophy into contemporary social work practice...',
        author_id: 'user-123',
        status: 'under_review',
        submitted_at: new Date().toISOString(),
        keywords: ['Ubuntu', 'social work', 'philosophy']
      }
    ];

    return new Response(
      JSON.stringify({ submissions }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch submissions' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(request: Request) {
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
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, abstract, and manuscript file are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse JSON fields
    let keywords = [];
    let coAuthors = [];
    
    try {
      keywords = keywordsStr ? JSON.parse(keywordsStr) : [];
      coAuthors = coAuthorsStr ? JSON.parse(coAuthorsStr) : [];
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in keywords or co_authors field' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file type
    if (manuscriptFile.type !== 'application/pdf') {
      return new Response(
        JSON.stringify({ error: 'Only PDF files are accepted for manuscripts' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (manuscriptFile.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size must be 10MB or less' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // For now, we'll create a mock submission since we don't have database connection
    // In production, you would:
    // 1. Save the file to cloud storage (S3, Cloudinary, etc.)
    // 2. Save submission data to database
    // 3. Send notification emails
    
    const newSubmission = {
      id: `sub-${Date.now()}`,
      title,
      abstract,
      keywords,
      co_authors: coAuthors,
      author_id: 'current-user-id', // This should come from auth token
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      manuscript_url: `uploads/${manuscriptFile.name}`, // Mock URL
      updated_at: new Date().toISOString()
    };

    console.log('Submission created:', {
      id: newSubmission.id,
      title: newSubmission.title,
      fileSize: manuscriptFile.size,
      fileName: manuscriptFile.name
    });

    return new Response(
      JSON.stringify({
        message: 'Manuscript submitted successfully',
        submission: newSubmission
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating submission:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create submission' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
