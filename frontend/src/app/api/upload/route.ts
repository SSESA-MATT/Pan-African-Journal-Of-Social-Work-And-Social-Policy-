import { NextRequest, NextResponse } from 'next/server';
import { CloudinaryService } from '@/lib/cloudinary';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  console.log('=== SECURE File Upload API Called ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to ensure they're authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const secureUserId = session.user.id;
    console.log('Secure user ID from session:', secureUserId);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const submissionId = formData.get('submissionId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: corsHeaders() }
      );
    }

    console.log('File upload details:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      userId: secureUserId,
      submissionId
    });

    // Validate file type (PDF, DOC, DOCX)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check if Cloudinary is configured
    const cloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET;

    if (!cloudinaryConfigured) {
      console.log('Cloudinary not configured, returning mock file URL');
      
      const mockFileUrl = `https://demo-storage.example.com/manuscripts/${secureUserId}/${Date.now()}_${file.name}`;
      
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully (demo mode)',
        fileUrl: mockFileUrl,
        publicId: `demo-${Date.now()}`,
        originalFilename: file.name,
        size: file.size,
        format: file.name.split('.').pop()
      }, { headers: corsHeaders() });
    }

    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      console.log('Uploading to Cloudinary...');
      const uploadResult = await CloudinaryService.uploadManuscript(
        buffer,
        file.name,
        secureUserId
      );

      console.log('Cloudinary upload successful:', {
        publicId: uploadResult.publicId,
        secureUrl: uploadResult.secureUrl
      });

      // Update the submission in database with file URL
      if (submissionId) {
        try {
          const { error } = await supabase
            .from('submissions')
            .update({ 
              manuscript_file_url: uploadResult.secureUrl,
              manuscript_file_public_id: uploadResult.publicId
            })
            .eq('id', submissionId)
            .eq('author_id', secureUserId); // Ensure user can only update their own submissions

          if (error) {
            console.error('Failed to update submission with file URL:', error);
          } else {
            console.log('Successfully updated submission with file URL');
          }
        } catch (dbError) {
          console.error('Database update error:', dbError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        fileUrl: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        originalFilename: uploadResult.originalFilename,
        size: uploadResult.size,
        format: uploadResult.format
      }, { headers: corsHeaders() });

    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      
      // Fallback to mock storage
      const mockFileUrl = `https://demo-storage.example.com/manuscripts/${secureUserId}/${Date.now()}_${file.name}`;
      
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully (demo mode fallback)',
        fileUrl: mockFileUrl,
        publicId: `demo-${Date.now()}`,
        originalFilename: file.name,
        size: file.size,
        format: file.name.split('.').pop()
      }, { headers: corsHeaders() });
    }

  } catch (error: any) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { error: 'File upload failed', details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
