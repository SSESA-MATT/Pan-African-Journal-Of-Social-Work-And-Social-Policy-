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

export async function POST(request: NextRequest) {
  try {
    console.log('Processing file upload...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const manuscriptId = formData.get('manuscriptId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
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

    // For now, store a placeholder file URL
    // In production, you'd upload to cloud storage (Cloudinary, AWS S3, etc.)
    const fileUrl = `manuscripts/${Date.now()}-${file.name}`;

    // If manuscriptId provided, update existing submission
    if (manuscriptId) {
      const { data: submission, error } = await supabase
        .from('submissions')
        .update({ 
          manuscript_file_url: fileUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', manuscriptId)
        .select()
        .single();

      if (error) {
        console.error('Error updating manuscript file:', error);
        return NextResponse.json(
          { error: 'Failed to update manuscript file' },
          { status: 500, headers: corsHeaders() }
        );
      }

      return NextResponse.json(
        { 
          message: 'File uploaded successfully',
          fileUrl,
          manuscript: submission
        },
        { headers: corsHeaders() }
      );
    }

    // Return file info for new submissions
    return NextResponse.json(
      { 
        message: 'File uploaded successfully',
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      },
      { headers: corsHeaders() }
    );

  } catch (error) {
    console.error('POST upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
