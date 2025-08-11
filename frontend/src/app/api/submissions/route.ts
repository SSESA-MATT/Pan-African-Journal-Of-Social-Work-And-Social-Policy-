import { NextRequest, NextResponse } from 'next/server';
import { SubmissionService } from '@/lib/server/SubmissionService';
import { verifyAuth } from '@/lib/server/auth-middleware';

const submissionService = new SubmissionService();

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const submissions = await submissionService.getSubmissionsByAuthor(user.id, page, limit);
    
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'author' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const submissionData = await request.json();
    
    const submission = await submissionService.createSubmission({
      ...submissionData,
      author_id: user.id
    });
    
    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    console.error('Create submission error:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
