import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '../../../lib/server/ReviewService';
import { verifyAuth } from '../../../lib/server/auth-middleware';

const reviewService = new ReviewService();

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submission_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let reviews;
    if (submissionId) {
      reviews = await reviewService.getReviewsBySubmission(submissionId);
    } else if (user.role === 'reviewer') {
      reviews = await reviewService.getReviewsByReviewer(user.id, page, limit);
    } else if (['admin', 'editor'].includes(user.role)) {
      reviews = await reviewService.getAllReviews(page, limit);
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
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

    if (user.role !== 'reviewer' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reviewData = await request.json();
    
    const review = await reviewService.assignReview({
      ...reviewData,
      reviewer_id: user.id
    });
    
    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
