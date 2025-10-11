// 🧪 COMPREHENSIVE ADMIN & REVIEWER FUNCTIONALITY TESTER
// This script tests all critical functions for both admin and reviewer roles

class FunctionalityTester {
  constructor() {
    this.results = {
      admin: {},
      reviewer: {},
      overall: {}
    };
    this.currentUser = null;
  }

  async init() {
    console.log('🚀 STARTING COMPREHENSIVE FUNCTIONALITY TEST');
    console.log('='.repeat(60));
    
    // Get current user info
    await this.getCurrentUser();
    
    if (!this.currentUser) {
      console.error('❌ No authenticated user found. Please log in first.');
      return;
    }
    
    console.log(`👤 Testing as: ${this.currentUser.email} (Role: ${this.currentUser.role})`);
    
    // Run tests based on user role
    if (this.currentUser.role === 'admin') {
      await this.runAdminTests();
      await this.runReviewerTests(); // Admin can also be reviewer
    } else if (this.currentUser.role === 'reviewer') {
      await this.runReviewerTests();
    } else if (this.currentUser.role === 'editor') {
      await this.runAdminTests(); // Editors have admin-like permissions
      await this.runReviewerTests();
    } else {
      console.log('ℹ️ Current role has limited functionality. Showing available tests...');
    }
    
    this.showSummary();
  }

  async getCurrentUser() {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        this.currentUser = await response.json();
        console.log('✅ User authentication verified');
      } else {
        console.log('❌ User authentication failed');
      }
    } catch (error) {
      console.error('❌ Error getting current user:', error);
    }
  }

  async runAdminTests() {
    console.log('\n🔧 ADMIN FUNCTIONALITY TESTS');
    console.log('-'.repeat(40));
    
    await this.testAdminDashboardAccess();
    await this.testUserManagement();
    await this.testSubmissionManagement();
    await this.testReviewerAssignment();
    await this.testVolumeIssueManagement();
    await this.testBulkOperations();
    await this.testPublicationWorkflow();
  }

  async runReviewerTests() {
    console.log('\n📝 REVIEWER FUNCTIONALITY TESTS');
    console.log('-'.repeat(40));
    
    await this.testReviewerDashboardAccess();
    await this.testReviewerDashboardData();
    await this.testReviewSubmission();
    await this.testReviewHistory();
  }

  async testAdminDashboardAccess() {
    console.log('\n1️⃣ Testing Admin Dashboard Access...');
    try {
      const response = await fetch('/admin', {
        method: 'HEAD',
        credentials: 'include'
      });
      
      this.results.admin.dashboardAccess = response.ok;
      console.log(response.ok ? '✅ Admin dashboard accessible' : '❌ Admin dashboard not accessible');
    } catch (error) {
      this.results.admin.dashboardAccess = false;
      console.log('❌ Error accessing admin dashboard:', error.message);
    }
  }

  async testUserManagement() {
    console.log('\n2️⃣ Testing User Management...');
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const users = await response.json();
        this.results.admin.userManagement = true;
        console.log(`✅ User management working - Found ${users.length} users`);
        
        // Test user role update (dry run)
        console.log('📋 User roles found:', 
          users.map(u => `${u.email}: ${u.role}`).slice(0, 3)
        );
      } else {
        this.results.admin.userManagement = false;
        console.log('❌ User management API failed:', response.status);
      }
    } catch (error) {
      this.results.admin.userManagement = false;
      console.log('❌ Error testing user management:', error.message);
    }
  }

  async testSubmissionManagement() {
    console.log('\n3️⃣ Testing Submission Management...');
    try {
      const response = await fetch('/api/manuscripts/admin/all', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const submissions = await response.json();
        this.results.admin.submissionManagement = true;
        console.log(`✅ Submission management working - Found ${submissions.length} submissions`);
        
        if (submissions.length > 0) {
          console.log('📋 Recent submissions:', 
            submissions.slice(0, 3).map(s => `${s.title} (${s.status})`)
          );
        }
      } else {
        this.results.admin.submissionManagement = false;
        console.log('❌ Submission management API failed:', response.status);
      }
    } catch (error) {
      this.results.admin.submissionManagement = false;
      console.log('❌ Error testing submission management:', error.message);
    }
  }

  async testReviewerAssignment() {
    console.log('\n4️⃣ Testing Reviewer Assignment...');
    try {
      // Test getting available reviewers
      const reviewersResponse = await fetch('/api/admin/reviewers', {
        credentials: 'include'
      });
      
      if (reviewersResponse.ok) {
        const reviewers = await reviewersResponse.json();
        this.results.admin.reviewerAssignment = true;
        console.log(`✅ Reviewer assignment working - Found ${reviewers.length} reviewers`);
      } else {
        this.results.admin.reviewerAssignment = false;
        console.log('❌ Reviewer assignment API failed:', reviewersResponse.status);
      }
    } catch (error) {
      this.results.admin.reviewerAssignment = false;
      console.log('❌ Error testing reviewer assignment:', error.message);
    }
  }

  async testVolumeIssueManagement() {
    console.log('\n5️⃣ Testing Volume/Issue Management...');
    try {
      const volumesResponse = await fetch('/api/admin/volumes', {
        credentials: 'include'
      });
      
      if (volumesResponse.ok) {
        const volumes = await volumesResponse.json();
        this.results.admin.volumeManagement = true;
        console.log(`✅ Volume management working - Found ${volumes.length} volumes`);
      } else {
        this.results.admin.volumeManagement = false;
        console.log('❌ Volume management API failed:', volumesResponse.status);
      }
    } catch (error) {
      this.results.admin.volumeManagement = false;
      console.log('❌ Error testing volume management:', error.message);
    }
  }

  async testBulkOperations() {
    console.log('\n6️⃣ Testing Bulk Operations...');
    try {
      // Test bulk status check (safe operation)
      const bulkResponse = await fetch('/api/admin/bulk/status-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionIds: [] }),
        credentials: 'include'
      });
      
      this.results.admin.bulkOperations = bulkResponse.status !== 404;
      console.log(this.results.admin.bulkOperations ? 
        '✅ Bulk operations endpoint exists' : 
        '❌ Bulk operations not implemented'
      );
    } catch (error) {
      this.results.admin.bulkOperations = false;
      console.log('❌ Error testing bulk operations:', error.message);
    }
  }

  async testPublicationWorkflow() {
    console.log('\n7️⃣ Testing Publication Workflow...');
    try {
      const articlesResponse = await fetch('/api/admin/articles', {
        credentials: 'include'
      });
      
      if (articlesResponse.ok) {
        const articles = await articlesResponse.json();
        this.results.admin.publicationWorkflow = true;
        console.log(`✅ Publication workflow working - Found ${articles.length} articles`);
      } else {
        this.results.admin.publicationWorkflow = false;
        console.log('❌ Publication workflow API failed:', articlesResponse.status);
      }
    } catch (error) {
      this.results.admin.publicationWorkflow = false;
      console.log('❌ Error testing publication workflow:', error.message);
    }
  }

  async testReviewerDashboardAccess() {
    console.log('\n1️⃣ Testing Reviewer Dashboard Access...');
    try {
      const response = await fetch('/reviewer-dashboard', {
        method: 'HEAD',
        credentials: 'include'
      });
      
      this.results.reviewer.dashboardAccess = response.ok;
      console.log(response.ok ? 
        '✅ Reviewer dashboard accessible' : 
        '❌ Reviewer dashboard not accessible'
      );
    } catch (error) {
      this.results.reviewer.dashboardAccess = false;
      console.log('❌ Error accessing reviewer dashboard:', error.message);
    }
  }

  async testReviewerDashboardData() {
    console.log('\n2️⃣ Testing Reviewer Dashboard Data...');
    try {
      const response = await fetch('/api/reviews/dashboard', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const dashboardData = await response.json();
        this.results.reviewer.dashboardData = true;
        
        console.log('✅ Reviewer dashboard data loaded');
        console.log(`📊 Data source: ${dashboardData.dataSource}`);
        console.log(`📝 Pending reviews: ${dashboardData.pendingReviews?.length || 0}`);
        console.log(`✅ Completed reviews: ${dashboardData.completedReviews?.length || 0}`);
        
        if (dashboardData.pendingReviews?.length > 0) {
          console.log('📋 Sample pending review:', {
            title: dashboardData.pendingReviews[0].title,
            author: `${dashboardData.pendingReviews[0].author_first_name} ${dashboardData.pendingReviews[0].author_last_name}`,
            deadline: dashboardData.pendingReviews[0].review_deadline
          });
        }
        
        // Check for mock vs real data
        const hasMockData = dashboardData.pendingReviews?.some(r => r.id.startsWith('mock-'));
        if (hasMockData) {
          console.log('⚠️ WARNING: Still using mock data - check database setup');
        } else {
          console.log('✅ Using real database data');
        }
        
      } else {
        this.results.reviewer.dashboardData = false;
        console.log('❌ Reviewer dashboard data failed:', response.status);
        const errorText = await response.text();
        console.log('Error details:', errorText);
      }
    } catch (error) {
      this.results.reviewer.dashboardData = false;
      console.log('❌ Error testing reviewer dashboard data:', error.message);
    }
  }

  async testReviewSubmission() {
    console.log('\n3️⃣ Testing Review Submission...');
    try {
      // First get a review ID to test with
      const dashboardResponse = await fetch('/api/reviews/dashboard', {
        credentials: 'include'
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        
        if (dashboardData.pendingReviews?.length > 0) {
          const reviewId = dashboardData.pendingReviews[0].id;
          
          // Test review form access
          const reviewFormResponse = await fetch(`/api/reviews/${reviewId}`, {
            credentials: 'include'
          });
          
          this.results.reviewer.reviewSubmission = reviewFormResponse.ok;
          console.log(reviewFormResponse.ok ? 
            '✅ Review submission form accessible' : 
            '❌ Review submission form not accessible'
          );
        } else {
          this.results.reviewer.reviewSubmission = null;
          console.log('ℹ️ No pending reviews to test submission with');
        }
      }
    } catch (error) {
      this.results.reviewer.reviewSubmission = false;
      console.log('❌ Error testing review submission:', error.message);
    }
  }

  async testReviewHistory() {
    console.log('\n4️⃣ Testing Review History...');
    try {
      const response = await fetch('/api/reviews/history', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const history = await response.json();
        this.results.reviewer.reviewHistory = true;
        console.log(`✅ Review history working - Found ${history.length} past reviews`);
      } else {
        this.results.reviewer.reviewHistory = false;
        console.log('❌ Review history API failed:', response.status);
      }
    } catch (error) {
      this.results.reviewer.reviewHistory = false;
      console.log('❌ Error testing review history:', error.message);
    }
  }

  showSummary() {
    console.log('\n📊 FUNCTIONALITY TEST SUMMARY');
    console.log('='.repeat(60));
    
    // Admin results
    if (Object.keys(this.results.admin).length > 0) {
      console.log('\n🔧 ADMIN FUNCTIONALITY:');
      Object.entries(this.results.admin).forEach(([test, result]) => {
        const status = result === true ? '✅' : result === false ? '❌' : '⚠️';
        console.log(`  ${status} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      });
    }
    
    // Reviewer results  
    if (Object.keys(this.results.reviewer).length > 0) {
      console.log('\n📝 REVIEWER FUNCTIONALITY:');
      Object.entries(this.results.reviewer).forEach(([test, result]) => {
        const status = result === true ? '✅' : result === false ? '❌' : '⚠️';
        console.log(`  ${status} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      });
    }
    
    // Overall score
    const allResults = [...Object.values(this.results.admin), ...Object.values(this.results.reviewer)];
    const passed = allResults.filter(r => r === true).length;
    const total = allResults.filter(r => r !== null).length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    console.log(`\n🎯 OVERALL SCORE: ${score}% (${passed}/${total} tests passed)`);
    
    if (score >= 80) {
      console.log('🎉 Excellent! Most functionality is working properly.');
    } else if (score >= 60) {
      console.log('⚠️ Good progress, but some issues need attention.');
    } else {
      console.log('🚨 Several critical issues need to be fixed.');
    }
    
    this.showRecommendations();
  }

  showRecommendations() {
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-'.repeat(30));
    
    // Check for common issues
    if (this.results.reviewer.dashboardData === false) {
      console.log('🔧 Fix reviewer dashboard API endpoint');
      console.log('   - Check /api/reviews/dashboard route');
      console.log('   - Verify database connection');
      console.log('   - Test authentication middleware');
    }
    
    if (this.results.admin.dashboardAccess === false) {
      console.log('🔧 Fix admin dashboard access');
      console.log('   - Verify user role in database');
      console.log('   - Check ProtectedRoute component');
      console.log('   - Test role-based permissions');
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Fix any failing tests above');
    console.log('2. Test with real submission data');
    console.log('3. Verify role-based access controls');
    console.log('4. Test end-to-end workflows');
  }
}

// Run the comprehensive test
const tester = new FunctionalityTester();
tester.init();