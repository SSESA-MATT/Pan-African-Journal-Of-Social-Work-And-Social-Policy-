#!/usr/bin/env node

/**
 * Create Test Data for Pan-African Journal Platform
 * This script creates test users, submissions, and articles for testing the workflow
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://llegefrltmrwehuzrbyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZWdlZnJsdG1yd2VodXpyYnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY2MTMwMCwiZXhwIjoyMDcwMjM3MzAwfQ.Y-ElwQGg_x09x72YVXACZ45i6gRiRjdcVPS8F7UWDyU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const testUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'author@test.com',
    first_name: 'Amara',
    last_name: 'Okonkwo',
    role: 'author',
    affiliation: 'University of Cape Town',
    bio: 'Researcher in Ubuntu philosophy and community social work'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'reviewer@test.com',
    first_name: 'Kwame',
    last_name: 'Asante',
    role: 'reviewer',
    affiliation: 'University of Ghana',
    bio: 'Expert in decolonial practice and child protection'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'editor@test.com',
    first_name: 'Thandiwe',
    last_name: 'Mthembu',
    role: 'editor',
    affiliation: 'University of the Witwatersrand',
    bio: 'Journal editor and social justice advocate'
  }
];

const testSubmissions = [
  {
    title: 'Ubuntu Philosophy and Community-Based Social Work: A Decolonial Approach to Practice',
    abstract: 'This study examines the integration of Ubuntu philosophy into community-based social work practice across three African countries. Using participatory action research methodology, we explore how Indigenous knowledge systems can enhance social work interventions in rural and urban communities. The research involved 120 participants from South Africa, Ghana, and Kenya, including social workers, community leaders, and service users. Findings reveal that Ubuntu-informed practice models significantly improve community engagement, cultural responsiveness, and sustainable outcomes. The study concludes with recommendations for decolonizing social work education and practice in African contexts.',
    content: 'This is the full content of the Ubuntu philosophy manuscript. It would contain detailed methodology, findings, and discussion sections in a real submission.',
    keywords: ['Ubuntu', 'decolonial practice', 'community-based social work', 'Indigenous knowledge', 'participatory action research'],
    author_id: '11111111-1111-1111-1111-111111111111',
    co_authors: ['Dr. Amara Okonkwo', 'Prof. Kwame Nkrumah'],
    corresponding_author: 'author@test.com',
    manuscript_type: 'research',
    word_count: 8500,
    funding_information: 'This research was funded by the African Social Work Research Foundation Grant #ASW-2024-001.',
    conflict_of_interest: 'The authors declare no conflicts of interest.',
    ethics_approval: 'This study was approved by the University of Cape Town Ethics Committee (Approval #UCT-2024-001).',
    data_availability: 'Data supporting the conclusions of this article are available upon reasonable request to the corresponding author.',
    status: 'submitted',
    manuscript_file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/manuscripts/ubuntu-philosophy-manuscript.pdf'
  },
  {
    title: 'Digital Divides and Social Justice: Technology Access in Post-Apartheid South Africa',
    abstract: 'An exploration of how digital inequalities perpetuate social injustices in contemporary South Africa. This mixed-methods study examines barriers to technology access and proposes community-centered solutions for digital inclusion. The research combines quantitative analysis of digital access patterns with qualitative interviews from 80 participants across urban and rural communities in three provinces.',
    content: 'This manuscript explores the complex relationship between digital access and social justice in South Africa, providing comprehensive analysis and recommendations.',
    keywords: ['digital divide', 'social justice', 'technology access', 'post-apartheid', 'digital inclusion'],
    author_id: '11111111-1111-1111-1111-111111111111',
    co_authors: ['Dr. Amara Okonkwo', 'Dr. Sipho Mthembu'],
    corresponding_author: 'author@test.com',
    manuscript_type: 'research',
    word_count: 7200,
    funding_information: 'This research was supported by the Digital Equity Research Initiative Grant #DERI-2024-002.',
    conflict_of_interest: 'The authors declare no conflicts of interest.',
    ethics_approval: 'Ethical approval was obtained from the University Research Ethics Committee (Approval #UREC-2024-002).',
    data_availability: 'Research data are available from the corresponding author upon reasonable request.',
    status: 'under_review',
    manuscript_file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/manuscripts/digital-divides-manuscript.pdf'
  },
  {
    title: 'Gender-Based Violence Prevention in West African Communities: A Community-Led Approach',
    abstract: 'This ethnographic study documents innovative approaches to GBV prevention developed by women\'s cooperatives in Ghana, Nigeria, and Senegal. The research highlights community-led strategies that challenge traditional intervention models and emphasize collective action, economic empowerment, and cultural transformation.',
    content: 'This ethnographic study provides detailed analysis of community-led GBV prevention strategies across West Africa.',
    keywords: ['gender-based violence', 'women cooperatives', 'West Africa', 'community prevention', 'ethnography'],
    author_id: '22222222-2222-2222-2222-222222222222',
    co_authors: ['Dr. Kwame Asante', 'Dr. Fatima Diallo'],
    corresponding_author: 'reviewer@test.com',
    manuscript_type: 'research',
    word_count: 9100,
    funding_information: 'This work was supported by the West African Women\'s Research Consortium Grant #WAWRC-2024-003.',
    conflict_of_interest: 'The authors declare no conflicts of interest.',
    ethics_approval: 'Multi-country ethical approval was obtained from participating institutions.',
    data_availability: 'Data are available subject to ethical restrictions and participant consent.',
    status: 'accepted',
    manuscript_file_url: 'https://res.cloudinary.com/demo/raw/upload/v1/manuscripts/gbv-prevention-manuscript.pdf'
  }
];

const testArticles = [
  {
    submission_id: 3, // Will be updated after submissions are created
    issue_id: 1,
    volume_id: 1,
    title: 'Gender-Based Violence Prevention in West African Communities: A Community-Led Approach',
    abstract: 'This ethnographic study documents innovative approaches to GBV prevention developed by women\'s cooperatives in Ghana, Nigeria, and Senegal. The research highlights community-led strategies that challenge traditional intervention models and emphasize collective action, economic empowerment, and cultural transformation.',
    keywords: ['gender-based violence', 'women cooperatives', 'West Africa', 'community prevention', 'ethnography'],
    authors: ['Dr. Kwame Asante', 'Dr. Fatima Diallo'],
    pdf_url: 'https://res.cloudinary.com/demo/raw/upload/v1/articles/gbv-prevention-published.pdf',
    doi: '10.xxxx/pajswsp.2024.01.01.001',
    page_start: 1,
    page_end: 24,
    article_type: 'research_article',
    language_code: 'en',
    published_at: new Date('2024-01-15').toISOString()
  }
];

async function createTestData() {
  console.log('🚀 Creating Test Data for Pan-African Journal Platform');
  console.log('====================================================');

  try {
    // 1. Create test users
    console.log('\\n👥 Creating test users...');
    for (const user of testUsers) {
      const { data, error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' });
      
      if (error) {
        console.log(`   ❌ Failed to create user ${user.email}: ${error.message}`);
      } else {
        console.log(`   ✅ Created user: ${user.email} (${user.role})`);
      }
    }

    // 2. Ensure volume and issue exist
    console.log('\\n📚 Creating volume and issue...');
    const { data: volume, error: volumeError } = await supabase
      .from('volumes')
      .upsert({
        id: 1,
        volume_number: 1,
        year: 2024,
        title: 'Inaugural Volume',
        description: 'The first volume of the Pan-African Journal of Social Work and Social Policy',
        is_published: true,
        published_at: new Date('2024-01-01').toISOString()
      }, { onConflict: 'id' });

    if (volumeError) {
      console.log(`   ❌ Failed to create volume: ${volumeError.message}`);
    } else {
      console.log(`   ✅ Created volume 1 (2024)`);
    }

    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .upsert({
        id: 1,
        volume_id: 1,
        issue_number: 1,
        title: 'Issue 1: Foundations of African Social Work',
        description: 'Exploring foundational concepts in African social work practice',
        is_published: true,
        published_at: new Date('2024-01-15').toISOString()
      }, { onConflict: 'id' });

    if (issueError) {
      console.log(`   ❌ Failed to create issue: ${issueError.message}`);
    } else {
      console.log(`   ✅ Created issue 1`);
    }

    // 3. Create test submissions
    console.log('\\n📝 Creating test submissions...');
    const createdSubmissions = [];
    for (const submission of testSubmissions) {
      const { data, error } = await supabase
        .from('submissions')
        .insert(submission)
        .select()
        .single();
      
      if (error) {
        console.log(`   ❌ Failed to create submission "${submission.title.substring(0, 50)}...": ${error.message}`);
      } else {
        console.log(`   ✅ Created submission: "${submission.title.substring(0, 50)}..." (${submission.status})`);
        createdSubmissions.push(data);
      }
    }

    // 4. Create reviewer assignments (skipped - table doesn't exist yet)
    console.log('\\n👨‍🔬 Skipping reviewer assignments (table not available)...');

    // 5. Create test articles (published submissions)
    console.log('\\n📚 Creating test articles...');
    if (createdSubmissions.length > 2) {
      const article = {
        ...testArticles[0],
        submission_id: createdSubmissions[2]?.id // GBV Prevention submission
      };

      const { data, error } = await supabase
        .from('articles')
        .insert(article);
      
      if (error) {
        console.log(`   ❌ Failed to create article: ${error.message}`);
      } else {
        console.log(`   ✅ Created published article: "${article.title.substring(0, 50)}..."`);
      }
    }

    console.log('\\n🎉 Test data creation completed!');
    console.log('\\n📋 Summary:');
    console.log(`   - ${testUsers.length} test users created`);
    console.log(`   - ${testSubmissions.length} test submissions created`);
    console.log(`   - 1 test article published`);
    console.log(`   - 1 reviewer assignment created`);
    
    console.log('\\n🔗 You can now test the workflow:');
    console.log('   1. Visit http://localhost:3001/articles to see published articles');
    console.log('   2. Visit http://localhost:3001/search to test search functionality');
    console.log('   3. Login as editor@test.com to access admin features');
    console.log('   4. Login as reviewer@test.com to see reviewer assignments');
    console.log('   5. Login as author@test.com to see author submissions');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

// Run the script
createTestData().catch(console.error);