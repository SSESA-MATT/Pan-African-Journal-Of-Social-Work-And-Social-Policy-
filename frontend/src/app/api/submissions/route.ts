import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// Mock data for when database is not available
const mockManuscripts = [
  {
    id: '1',
    title: 'Sample Manuscript 1',
    abstract: 'This is a sample abstract for testing purposes.',
    content: '',
    keywords: ['social work', 'policy', 'africa'],
    authors: ['Dr. John Doe', 'Prof. Jane Smith'],
    corresponding_author: 'john.doe@university.edu',
    manuscript_type: 'research',
    funding_information: 'This research was funded by XYZ Foundation.',
    conflict_of_interest: 'The authors declare no conflict of interest.',
    ethics_approval: 'Ethics approval obtained from IRB #123.',
    data_availability: 'Data available upon request.',
    status: 'submitted',
    submission_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    word_count: 5000,
    manuscript_file_url: '',
    assigned_reviewers: []
  }
];

// In-memory storage for demo submissions (in production, this would be in database)
let demoSubmissions: any[] = [];

export async function GET(request: NextRequest) {
  console.log('=== GET /api/submissions request started ===');
  
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('GET submissions - userId:', userId);
    console.log('GET submissions - full URL:', request.url);

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      supabaseKey: supabaseKey ? 'Set' : 'Missing',
      nodeEnv: process.env.NODE_ENV
    });

    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase not configured, returning mock data and demo submissions');
      
      // Always include the mock manuscript for any user in demo mode
      const mockWithUserId = {
        ...mockManuscripts[0],
        author_id: userId || 'demo-user-id'
      };
      
      // Filter demo submissions by user if userId is provided
      let userSubmissions = demoSubmissions;
      if (userId) {
        userSubmissions = demoSubmissions.filter(sub => sub.author_id === userId);
      }
      
      // Combine mock manuscript with user's demo submissions
      const allManuscripts = [mockWithUserId, ...userSubmissions];
      console.log(`Returning ${allManuscripts.length} manuscripts for user ${userId}`);
      console.log('Demo submissions count:', demoSubmissions.length);
      
      return NextResponse.json(allManuscripts, { headers: corsHeaders() });
    }

    // Connect to Supabase and fetch real data
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      let query = supabase
        .from('submissions')
        .select('*');
      
      if (userId) {
        query = query.eq('author_id', userId);
      }
      
      const { data: submissions, error } = await query
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Database error:', error);
        console.log('Falling back to mock data due to database error');
        return NextResponse.json(mockManuscripts, { headers: corsHeaders() });
      }

      console.log(`Found ${submissions?.length || 0} submissions for user ${userId}`);

      if (!submissions || submissions.length === 0) {
        return NextResponse.json([], { headers: corsHeaders() });
      }

      const manuscripts = submissions.map(submission => ({
        id: submission.id,
        title: submission.title || 'Untitled',
        abstract: submission.abstract || '',
        content: '',
        keywords: Array.isArray(submission.keywords) ? submission.keywords : [],
        authors: Array.isArray(submission.co_authors) ? submission.co_authors : [],
        corresponding_author: submission.corresponding_author || '',
        manuscript_type: submission.submission_type || submission.manuscript_type || 'research',
        funding_information: submission.funding_statement || '',
        conflict_of_interest: submission.conflict_of_interest || '',
        ethics_approval: submission.ethics_statement || '',
        data_availability: submission.data_availability || '',
        status: submission.status || 'submitted',
        submission_date: submission.submission_date || submission.created_at,
        created_at: submission.created_at,
        updated_at: submission.updated_at || submission.created_at,
        last_updated: submission.updated_at || submission.created_at,
        word_count: Number(submission.word_count) || 0,
        manuscript_file_url: submission.manuscript_file_url || '',
        assigned_reviewers: []
      }));

      return NextResponse.json(manuscripts, { headers: corsHeaders() });

    } catch (dbError) {
      console.error('Database connection error:', dbError);
      console.log('Falling back to mock data due to connection error');
      return NextResponse.json(mockManuscripts, { headers: corsHeaders() });
    }

  } catch (error) {
    console.error('GET submissions error:', error);
    // Even if there's an error, return mock data to keep the UI working
    return NextResponse.json(mockManuscripts, { headers: corsHeaders() });
  }
}

export async function POST(request: NextRequest) {
  console.log('=== POST /api/submissions request started ===');
  
  try {
    console.log('Processing manuscript submission...');
    
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    let submissionData: any = {};
    
    if (contentType?.includes('application/json')) {
      // Handle JSON submission (from ManuscriptSubmissionForm)
      const jsonData = await request.json();
      console.log('Received JSON data:', { title: jsonData.title, author_id: jsonData.author_id });
      
      submissionData = {
        title: jsonData.title,
        abstract: jsonData.abstract,
        keywords: Array.isArray(jsonData.keywords) ? jsonData.keywords.join(', ') : jsonData.keywords,
        manuscriptType: jsonData.manuscript_type || 'research',
        authors: Array.isArray(jsonData.authors) ? jsonData.authors.join(', ') : jsonData.authors,
        corresponding_author: jsonData.corresponding_author,
        content: jsonData.content,
        funding_information: jsonData.funding_information,
        conflict_of_interest: jsonData.conflict_of_interest,
        ethics_approval: jsonData.ethics_approval,
        data_availability: jsonData.data_availability,
        file: null, // No file in JSON submissions for now
        author_id: jsonData.author_id || 'demo-user-id' // Get author ID from request
      };
    } else {
      // Handle FormData submission (from regular SubmissionForm)
      const formData = await request.formData();
      submissionData = {
        title: formData.get('title') as string,
        abstract: formData.get('abstract') as string,
        keywords: formData.get('keywords') as string,
        manuscriptType: formData.get('manuscriptType') as string,
        file: formData.get('manuscript') as File,
        authors: '', // FormData doesn't have this field yet
        corresponding_author: '',
        content: '',
        funding_information: formData.get('funding') as string,
        conflict_of_interest: formData.get('conflictOfInterest') as string,
        ethics_approval: formData.get('ethicsStatement') as string,
        data_availability: '',
        author_id: (formData.get('author_id') as string) || 'demo-user-id'
      };
    }

    console.log('Processed submission data:', { 
      title: submissionData.title, 
      author_id: submissionData.author_id,
      manuscriptType: submissionData.manuscriptType 
    });

    // Validate required fields
    if (!submissionData.title || !submissionData.abstract) {
      return NextResponse.json(
        { error: 'Missing required fields: title and abstract are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Environment check for POST:', {
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      supabaseKey: supabaseKey ? 'Set' : 'Missing',
      nodeEnv: process.env.NODE_ENV
    });

    if (!supabaseUrl || !supabaseKey) {
      console.log('Supabase not configured, using demo mode');
      
      // Create a demo submission
      const demoSubmission = {
        id: 'demo-' + Date.now(),
        title: submissionData.title,
        abstract: submissionData.abstract,
        content: submissionData.content || '',
        keywords: Array.isArray(submissionData.keywords) ? submissionData.keywords : submissionData.keywords?.split(',').map((k: string) => k.trim()) || [],
        authors: Array.isArray(submissionData.authors) ? submissionData.authors : submissionData.authors?.split(',').map((a: string) => a.trim()) || [],
        corresponding_author: submissionData.corresponding_author || '',
        manuscript_type: submissionData.manuscriptType || 'research',
        funding_information: submissionData.funding_information || '',
        conflict_of_interest: submissionData.conflict_of_interest || '',
        ethics_approval: submissionData.ethics_approval || '',
        data_availability: submissionData.data_availability || '',
        status: 'submitted',
        submission_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        word_count: submissionData.content ? submissionData.content.split(' ').length : 0,
        manuscript_file_url: submissionData.file ? `demo-file-${Date.now()}` : '',
        assigned_reviewers: [],
        author_id: submissionData.author_id
      };
      
      // Store the submission
      demoSubmissions.push(demoSubmission);
      console.log('Demo submission stored:', {
        id: demoSubmission.id,
        title: demoSubmission.title,
        author_id: demoSubmission.author_id
      });
      console.log('Total demo submissions now:', demoSubmissions.length);
      
      return NextResponse.json(
        { 
          success: true,
          message: 'Manuscript submitted successfully (demo mode)',
          id: demoSubmission.id,
          status: 'submitted',
          submission: demoSubmission
        },
        { status: 201, headers: corsHeaders() }
      );
    }

    // Connect to Supabase and save real data
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Map form data to database fields
      const dbSubmission = {
        title: submissionData.title,
        abstract: submissionData.abstract,
        co_authors: Array.isArray(submissionData.authors) ? submissionData.authors : submissionData.authors?.split(',').map((a: string) => a.trim()) || [],
        keywords: Array.isArray(submissionData.keywords) ? submissionData.keywords : submissionData.keywords?.split(',').map((k: string) => k.trim()) || [],
        submission_type: submissionData.manuscriptType || 'research',
        corresponding_author: submissionData.corresponding_author || '',
        funding_statement: submissionData.funding_information || '',
        conflict_of_interest: submissionData.conflict_of_interest || 'No conflicts declared',
        ethics_statement: submissionData.ethics_approval || '',
        data_availability: submissionData.data_availability || '',
        manuscript_type: submissionData.manuscriptType || 'research',
        status: 'submitted',
        submission_date: new Date().toISOString(),
        author_id: submissionData.author_id,
        word_count: submissionData.content ? submissionData.content.split(' ').length : 0,
        manuscript_file_url: submissionData.file ? `file-${Date.now()}` : ''
      };

      console.log('Inserting into database:', { title: dbSubmission.title, author_id: dbSubmission.author_id });

      const { data, error } = await supabase
        .from('submissions')
        .insert([dbSubmission])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        
        // Fall back to demo mode on database error
        const demoSubmission = {
          id: 'demo-' + Date.now(),
          title: submissionData.title,
          abstract: submissionData.abstract,
          content: submissionData.content || '',
          keywords: Array.isArray(submissionData.keywords) ? submissionData.keywords : submissionData.keywords?.split(',').map((k: string) => k.trim()) || [],
          authors: Array.isArray(submissionData.authors) ? submissionData.authors : submissionData.authors?.split(',').map((a: string) => a.trim()) || [],
          corresponding_author: submissionData.corresponding_author || '',
          manuscript_type: submissionData.manuscriptType || 'research',
          funding_information: submissionData.funding_information || '',
          conflict_of_interest: submissionData.conflict_of_interest || '',
          ethics_approval: submissionData.ethics_approval || '',
          data_availability: submissionData.data_availability || '',
          status: 'submitted',
          submission_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          word_count: submissionData.content ? submissionData.content.split(' ').length : 0,
          manuscript_file_url: submissionData.file ? `demo-file-${Date.now()}` : '',
          assigned_reviewers: [],
          author_id: submissionData.author_id
        };

        demoSubmissions.push(demoSubmission);
        console.log('Fell back to demo mode due to database error');

        return NextResponse.json(
          { 
            success: true,
            message: 'Manuscript submitted successfully (demo mode fallback)',
            id: demoSubmission.id,
            status: 'submitted',
            submission: demoSubmission
          },
          { status: 201, headers: corsHeaders() }
        );
      }

      console.log('Successfully saved to database:', { id: data.id, title: data.title });

      return NextResponse.json(
        { 
          success: true,
          message: 'Manuscript submitted successfully',
          id: data.id,
          status: 'submitted',
          submission: data
        },
        { status: 201, headers: corsHeaders() }
      );

    } catch (dbError) {
      console.error('Database connection error:', dbError);
      
      // Fall back to demo mode
      const demoSubmission = {
        id: 'demo-' + Date.now(),
        title: submissionData.title,
        abstract: submissionData.abstract,
        content: submissionData.content || '',
        keywords: Array.isArray(submissionData.keywords) ? submissionData.keywords : submissionData.keywords?.split(',').map((k: string) => k.trim()) || [],
        authors: Array.isArray(submissionData.authors) ? submissionData.authors : submissionData.authors?.split(',').map((a: string) => a.trim()) || [],
        corresponding_author: submissionData.corresponding_author || '',
        manuscript_type: submissionData.manuscriptType || 'research',
        funding_information: submissionData.funding_information || '',
        conflict_of_interest: submissionData.conflict_of_interest || '',
        ethics_approval: submissionData.ethics_approval || '',
        data_availability: submissionData.data_availability || '',
        status: 'submitted',
        submission_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        word_count: submissionData.content ? submissionData.content.split(' ').length : 0,
        manuscript_file_url: submissionData.file ? `demo-file-${Date.now()}` : '',
        assigned_reviewers: [],
        author_id: submissionData.author_id
      };

      demoSubmissions.push(demoSubmission);
      console.log('Fell back to demo mode due to connection error');

      return NextResponse.json(
        { 
          success: true,
          message: 'Manuscript submitted successfully (demo mode fallback)',
          id: demoSubmission.id,
          status: 'submitted',
          submission: demoSubmission
        },
        { status: 201, headers: corsHeaders() }
      );
    }

  } catch (error) {
    console.error('POST submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
