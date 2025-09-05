import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user is a reviewer, editor, or admin
    if (!['reviewer', 'editor', 'admin'].includes(userProfile.role)) {
      return NextResponse.json(
        { error: 'Access denied. Reviewer role required.' },
        { status: 403 }
      );
    }

    // For now, return mock data since the submissions/reviews system isn't fully implemented
    // In a real implementation, you'd query the submissions and reviews tables
    const dashboardData = {
      pendingReviews: [
        {
          id: 'mock-1',
          title: 'Impact of Social Work Interventions in Rural Communities',
          abstract: 'This study examines the effectiveness of social work interventions in rural community settings, focusing on community engagement and sustainable development outcomes.',
          status: 'pending',
          submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          author_first_name: 'Jane',
          author_last_name: 'Smith'
        },
        {
          id: 'mock-2',
          title: 'Digital Inclusion and Social Work Practice',
          abstract: 'An exploration of how digital technologies can be integrated into social work practice to improve service delivery and client outcomes.',
          status: 'pending',
          submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          author_first_name: 'Michael',
          author_last_name: 'Johnson'
        }
      ],
      completedReviews: [
        {
          id: 'review-1',
          submission_id: 'sub-completed-1',
          reviewer_id: user.id,
          title: 'Community-Based Social Work Practice in Urban Settings',
          abstract: 'This research investigates community-based approaches to social work in urban environments, with particular attention to multicultural contexts.',
          status: 'completed',
          submission_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
          author_first_name: 'John',
          author_last_name: 'Doe',
          comments: 'This is a well-researched paper with strong methodology and clear findings.',
          recommendation: 'accept' as const,
          submitted_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
        },
        {
          id: 'review-2',
          submission_id: 'sub-completed-2',
          reviewer_id: user.id,
          title: 'Mental Health Services for Youth in Care',
          abstract: 'An analysis of mental health service provision for youth in care systems across different jurisdictions.',
          status: 'completed',
          submission_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          author_first_name: 'Sarah',
          author_last_name: 'Wilson',
          comments: 'The paper requires some minor revisions to strengthen the theoretical framework.',
          recommendation: 'minor_revisions' as const,
          submitted_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() // 50 days ago
        }
      ],
      reviewStats: {
        totalReviews: 8,
        pendingCount: 2
      }
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Reviewer dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
