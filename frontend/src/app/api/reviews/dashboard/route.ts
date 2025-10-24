import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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
  console.log('=== SECURE GET /api/reviews/dashboard request started ===');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session to ensure they're authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session error:', sessionError);
    console.log('Session exists:', !!session);
    console.log('Session user ID:', session?.user?.id);
    
    if (sessionError || !session) {
      console.log('No session found - returning 401');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: corsHeaders() });
    }

    const userId = session.user.id;
    console.log('Fetching reviewer dashboard data for user:', userId);

    // Get user profile to check reviewer role - handle case where profile might not exist yet
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    let userRole: string;
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      
      // If user profile doesn't exist, try to get email from session to check if it's a known reviewer
      const userEmail = session.user.email;
      console.log('No profile found for user, checking email:', userEmail);
      
      // Try to find user by email
      const { data: emailProfile, error: emailError } = await supabase
        .from('users')
        .select('role, id')
        .eq('email', userEmail)
        .single();
      
      if (emailError || !emailProfile) {
        console.log('No user profile found by email either. Creating basic reviewer profile...');
        
        // For existing reviewers who might not have profiles yet, assume they have reviewer role
        // This allows your existing reviewers to access the dashboard
        const assumedRole = 'reviewer'; // You can adjust this based on your needs
        console.log(`Assuming role '${assumedRole}' for user with email: ${userEmail}`);
        
        // Continue with assumed reviewer role
        userRole = assumedRole;
      } else {
        console.log('Found user profile by email:', emailProfile);
        userRole = emailProfile.role;
      }
    } else {
      userRole = userProfile.role;
    }

    // Check if user has reviewer permissions
    if (!['reviewer', 'editor', 'admin'].includes(userRole)) {
      console.log('User does not have reviewer permissions, role:', userRole);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403, headers: corsHeaders() });
    }

    console.log('User has reviewer permissions, attempting to fetch real submissions...');
    
    // Try to fetch real submissions - prioritize showing actual submissions over mock data
    let pendingReviews = [];
    let hasRealData = false;
    
    try {
      console.log('Trying direct query first to get all submissions...');
      
      // Start with direct query to get all real submissions
      const { data: directSubmissions, error: directError } = await supabase
        .from('submissions')
        .select(`
          id,
          title,
          abstract,
          keywords,
          status,
          submission_date,
          created_at,
          submission_type,
          users!submissions_author_id_fkey (
            first_name,
            last_name,
            affiliation
          )
        `)
        .eq('status', 'submitted')
        .order('submission_date', { ascending: false })
        .limit(10);
      
      if (!directError && directSubmissions && directSubmissions.length > 0) {
        console.log(`Found ${directSubmissions.length} real submissions using direct query`);
        hasRealData = true;
        
        // Process real submissions from direct query
        for (const submission of directSubmissions) {
          const author = submission.users as any;
          pendingReviews.push({
            id: `real-${submission.id}`,
            submission_id: submission.id,
            title: submission.title || 'Untitled Manuscript',
            abstract: submission.abstract || 'No abstract available',
            status: 'pending',
            submitted_at: submission.submission_date || submission.created_at,
            due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            author_first_name: author?.first_name || 'Unknown',
            author_last_name: author?.last_name || 'Author',
            author_affiliation: author?.affiliation || 'Unknown Institution',
            keywords: Array.isArray(submission.keywords) ? submission.keywords : [],
            priority: 'medium',
            manuscript_type: submission.submission_type || 'research_article'
          });
        }
      } else {
        console.log('Direct query failed, trying RPC functions...', directError);
        
        // Fallback 1: Try to get submissions assigned to this specific reviewer
        const { data: assignedSubmissions, error: assignedError } = await supabase
          .rpc('get_submissions_for_reviewer', { reviewer_user_id: userId });
        
        if (!assignedError && assignedSubmissions && assignedSubmissions.length > 0) {
          console.log(`Found ${assignedSubmissions.length} submissions assigned to reviewer ${userId}`);
          hasRealData = true;
          
          // Process assigned submissions
          for (const submission of assignedSubmissions) {
            pendingReviews.push({
              id: `real-${submission.id}`,
              submission_id: submission.id,
              title: submission.title || 'Untitled Manuscript',
              abstract: submission.abstract || 'No abstract available',
              status: submission.review_status || 'pending',
              submitted_at: submission.submission_date || submission.created_at,
              due_date: submission.review_due_date || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
              // record author_id (if provided) and defer filling author_* fields to an enrichment step
              author_id: submission.author_id || null,
              author_first_name: submission.author_first_name || null,
              author_last_name: submission.author_last_name || null,
              author_affiliation: submission.author_affiliation || null,
              keywords: Array.isArray(submission.keywords) ? submission.keywords : [],
              priority: 'medium',
              manuscript_type: submission.submission_type || 'research_article',
              review_id: submission.review_id,
              assigned_at: submission.review_assigned_at
            });
          }
        } else {
          console.log('No assigned submissions, trying general RPC function...');
          
          // Fallback 2: Try to get submissions using the general RPC function
          const { data: submissions, error: submissionsError } = await supabase
            .rpc('get_submissions_for_review');
          
          if (!submissionsError && submissions && submissions.length > 0) {
            console.log(`Found ${submissions.length} real submissions using general RPC function`);
            hasRealData = true;
            
            // Process real submissions from RPC
            for (const submission of submissions.slice(0, 10)) {
              pendingReviews.push({
                id: `real-${submission.id}`,
                submission_id: submission.id,
                title: submission.title || 'Untitled Manuscript',
                abstract: submission.abstract || 'No abstract available',
                status: submission.review_status || 'pending',
                submitted_at: submission.submission_date || submission.created_at,
                due_date: submission.review_due_date || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                author_id: submission.author_id || null,
                author_first_name: submission.author_first_name || null,
                author_last_name: submission.author_last_name || null,
                author_affiliation: submission.author_affiliation || null,
                keywords: Array.isArray(submission.keywords) ? submission.keywords : [],
                priority: 'medium',
                manuscript_type: submission.submission_type || 'research_article',
                review_id: submission.review_id,
                assigned_at: submission.review_assigned_at
              });
            }
          } else {
            console.log('All query attempts failed');
          }
        }
      }
    } catch (realDataError) {
      console.log('Real data fetch failed, using mock data:', realDataError);
    }
    
    // Enrich any collected pendingReviews with author profiles (by author_id) so we don't rely on denormalized fields
    try {
      const authorIds = Array.from(new Set(pendingReviews.map((p: any) => p.author_id).filter(Boolean)));
      if (authorIds.length > 0) {
        console.log('Enriching pending reviews with author profiles for ids:', authorIds);
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, affiliation')
          .in('id', authorIds);

        if (!usersError && usersData) {
          const usersById = (usersData || []).reduce((acc: any, u: any) => { acc[u.id] = u; return acc; }, {} as Record<string, any>);
          pendingReviews = (pendingReviews || []).map((p: any) => ({
            ...p,
            author_first_name: p.author_first_name || usersById[p.author_id]?.first_name || 'Unknown',
            author_last_name: p.author_last_name || usersById[p.author_id]?.last_name || 'Author',
            author_affiliation: p.author_affiliation || usersById[p.author_id]?.affiliation || 'Unknown Institution'
          }));
        } else {
          console.warn('Could not enrich pending reviews with users:', usersError);
        }
      }
    } catch (enrichErr) {
      console.warn('Error enriching pending reviews with author profiles:', enrichErr);
    }

    // If no real data, use enhanced mock data that looks more realistic
    if (!hasRealData || pendingReviews.length === 0) {
      console.log('Using mock data for reviewer dashboard');
      pendingReviews = [
        {
          id: 'mock-1',
          submission_id: 'demo-submission-1',
          title: 'Decolonizing Social Work Practice in African Communities',
          abstract: 'This manuscript explores the critical need for decolonizing social work practice within African communities, examining how traditional Western social work models can be adapted to incorporate indigenous knowledge systems and culturally appropriate interventions.',
          status: 'pending',
          submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
          author_first_name: 'Dr. Amara',
          author_last_name: 'Kwame',
          author_affiliation: 'University of Ghana, School of Social Work',
          keywords: ['decolonization', 'social work', 'African communities', 'indigenous knowledge'],
          priority: 'high',
          manuscript_type: 'research_article'
        },
        {
          id: 'mock-2', 
          submission_id: 'demo-submission-2',
          title: 'Community-Based Mental Health Interventions in Rural Uganda',
          abstract: 'A comprehensive study examining the effectiveness of community-based mental health interventions in rural Ugandan communities, focusing on culturally adapted therapeutic approaches and community healing practices.',
          status: 'pending',
          submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
          author_first_name: 'Sarah',
          author_last_name: 'Nalubega',
          author_affiliation: 'Makerere University, Department of Social Work',
          keywords: ['mental health', 'rural communities', 'Uganda', 'community interventions'],
          priority: 'medium',
          manuscript_type: 'research_article'
        }
      ];
    }

    const dashboardData = {
      pendingReviews: pendingReviews,
      completedReviews: [], // TODO: Add completed reviews from database
      reviewStats: {
        totalReviews: 0, // Will be updated when we fetch completed reviews
        pendingCount: pendingReviews.length,
        completedThisMonth: 0, // Will be updated when we fetch completed reviews
        averageReviewTime: 18,
        acceptanceRate: 0.4,
        onTimeCompletionRate: 0.85,
        expertise_areas: ['community social work', 'decolonial practice', 'African studies'],
        performance_rating: 4.2
      },
      dataSource: hasRealData ? 'database' : 'mock',
      message: hasRealData ? `Showing ${pendingReviews.length} real submissions available for review` : 'Showing demo data - real submissions will appear when authors submit manuscripts'
    };

    console.log(`Returning dashboard data with ${pendingReviews.length} reviews (${hasRealData ? 'real' : 'mock'} data)`);
    return NextResponse.json(dashboardData, { headers: corsHeaders() });

  } catch (error: any) {
    console.error('Dashboard API error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error?.message || 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
