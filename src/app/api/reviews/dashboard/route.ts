// Using standard Request/Response instead of Next.js types to avoid dependency issues

export async function GET(request: Request) {
  try {
    // For now, we'll make this more flexible for development
    // In production, you'd want proper token validation here.
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    // Log for debugging
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    // For development, we'll be more lenient with auth
    // Remove this check temporarily to allow testing
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return new Response(
    //     JSON.stringify({ error: 'Authorization header required' }),
    //     { status: 401, headers: { 'Content-Type': 'application/json' } }
    //   );
    // }

    // Mock reviewer dashboard data since the full review system isn't implemented yet
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
          reviewer_id: 'user-id-placeholder',
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
          reviewer_id: 'user-id-placeholder',
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

    return new Response(
      JSON.stringify(dashboardData),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Reviewer dashboard error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
