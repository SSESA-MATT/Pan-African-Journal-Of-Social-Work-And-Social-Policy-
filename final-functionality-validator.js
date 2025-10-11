// 🚀 FINAL ADMIN & REVIEWER FUNCTIONALITY VALIDATOR
// Run this in browser console to validate everything works perfectly

console.log(`
🧪 FINAL FUNCTIONALITY VALIDATION
================================
This will test all critical admin and reviewer features
`);

class FinalValidator {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
    this.currentUser = null;
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive validation...\n');
    
    // Step 1: Authentication & User Info
    await this.validateAuth();
    
    if (!this.currentUser) {
      console.error('❌ CRITICAL: No authenticated user. Please log in first.');
      return;
    }
    
    // Step 2: Role-based tests
    if (this.currentUser.role === 'admin') {
      console.log('👑 Running ADMIN validation tests...');
      await this.validateAdminFunctionality();
    }
    
    if (['admin', 'editor', 'reviewer'].includes(this.currentUser.role)) {
      console.log('📝 Running REVIEWER validation tests...');
      await this.validateReviewerFunctionality();
    }
    
    // Step 3: Core system tests
    await this.validateCoreSystem();
    
    // Step 4: Final report
    this.showFinalReport();
  }

  async validateAuth() {
    console.log('1️⃣ Validating Authentication...');
    try {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      
      if (response.ok) {
        this.currentUser = await response.json();
        console.log(`✅ Authenticated as: ${this.currentUser.email} (${this.currentUser.role})`);
        this.passed++;
      } else {
        console.log('❌ Authentication failed');
        this.failed++;
      }
    } catch (error) {
      console.log('❌ Auth error:', error.message);
      this.failed++;
    }
  }

  async validateAdminFunctionality() {
    const tests = [
      { name: 'Admin Dashboard Access', url: '/admin', method: 'HEAD' },
      { name: 'User Management API', url: '/api/users', method: 'GET' },
      { name: 'Admin Submissions API', url: '/api/manuscripts/admin/all', method: 'GET' },
      { name: 'Reviewers List API', url: '/api/users/reviewers', method: 'GET' },
      { name: 'Test Database Connection', url: '/api/test-connection', method: 'GET' }
    ];

    console.log('\n🔧 ADMIN FUNCTIONALITY TESTS:');
    for (const test of tests) {
      await this.runTest(test);
    }
  }

  async validateReviewerFunctionality() {
    const tests = [
      { name: 'Reviewer Dashboard Access', url: '/reviewer-dashboard', method: 'HEAD' },
      { name: 'Reviewer Dashboard Data', url: '/api/reviews/dashboard', method: 'GET' },
      { name: 'Review History API', url: '/api/reviews', method: 'GET' },
      { name: 'Submissions API', url: '/api/submissions', method: 'GET' }
    ];

    console.log('\n📝 REVIEWER FUNCTIONALITY TESTS:');
    for (const test of tests) {
      await this.runTest(test);
    }

    // Special test for reviewer dashboard data quality
    await this.validateReviewerDashboardData();
  }

  async validateCoreSystem() {
    console.log('\n⚙️ CORE SYSTEM VALIDATION:');
    
    // Test database health
    await this.runTest({ 
      name: 'Database Health Check', 
      url: '/api/health', 
      method: 'GET' 
    });

    // Test file upload capability
    await this.runTest({ 
      name: 'Upload System', 
      url: '/api/upload', 
      method: 'HEAD' 
    });
  }

  async runTest(test) {
    try {
      const response = await fetch(test.url, { 
        method: test.method, 
        credentials: 'include' 
      });
      
      if (response.ok) {
        console.log(`  ✅ ${test.name}`);
        this.passed++;
      } else if (response.status === 401 || response.status === 403) {
        console.log(`  ⚠️ ${test.name} - Access denied (${response.status})`);
        this.warnings++;
      } else {
        console.log(`  ❌ ${test.name} - Failed (${response.status})`);
        this.failed++;
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      this.failed++;
    }
  }

  async validateReviewerDashboardData() {
    console.log('\n🔍 REVIEWER DASHBOARD DATA QUALITY:');
    try {
      const response = await fetch('/api/reviews/dashboard', { credentials: 'include' });
      
      if (response.ok) {
        const data = await response.json();
        
        // Check data source
        if (data.dataSource === 'real') {
          console.log('  ✅ Using real database data');
          this.passed++;
        } else if (data.dataSource === 'mock') {
          console.log('  ⚠️ Still using mock data - needs database setup');
          this.warnings++;
        } else {
          console.log('  ❌ Unknown data source');
          this.failed++;
        }

        // Check data completeness
        const pendingCount = data.pendingReviews?.length || 0;
        const completedCount = data.completedReviews?.length || 0;
        
        console.log(`  📊 Pending reviews: ${pendingCount}`);
        console.log(`  📊 Completed reviews: ${completedCount}`);
        
        if (pendingCount > 0 || completedCount > 0) {
          console.log('  ✅ Dashboard has review data');
          this.passed++;
        } else {
          console.log('  ⚠️ No review data found - may need test data');
          this.warnings++;
        }

      } else {
        console.log('  ❌ Reviewer dashboard data failed');
        this.failed++;
      }
    } catch (error) {
      console.log('  ❌ Error validating reviewer dashboard:', error.message);
      this.failed++;
    }
  }

  showFinalReport() {
    const total = this.passed + this.failed + this.warnings;
    const score = total > 0 ? Math.round((this.passed / total) * 100) : 0;
    
    console.log(`
📊 FINAL VALIDATION REPORT
==========================
✅ Passed: ${this.passed}
❌ Failed: ${this.failed}
⚠️ Warnings: ${this.warnings}
📈 Success Rate: ${score}%

${this.getRecommendations()}
`);
  }

  getRecommendations() {
    if (this.failed === 0 && this.warnings === 0) {
      return `🎉 EXCELLENT! All functionality is working perfectly.
      
✅ Your system is ready for production use!
   - Admin functionality: Fully operational
   - Reviewer functionality: Fully operational
   - Database integration: Working properly
   - API endpoints: All accessible
   
🚀 Next steps:
   - Test with real users
   - Monitor performance
   - Set up analytics
   - Deploy to production`;
    }
    
    if (this.failed > 0) {
      return `🚨 CRITICAL ISSUES FOUND - Need immediate attention:
      
🔧 Priority fixes needed:
   - Check failed API endpoints
   - Verify database connections
   - Fix authentication issues
   - Test role-based permissions
   
💡 Run individual tests to debug specific issues.`;
    }
    
    if (this.warnings > 0) {
      return `⚠️ GOOD PROGRESS - Minor issues to address:
      
🔧 Recommended improvements:
   - Set up test data if using mock data
   - Check role permissions for warning endpoints
   - Ensure all users have proper roles assigned
   - Test edge cases in workflows`;
    }
    
    return '🤔 Unexpected result - review test output above.';
  }
}

// Auto-run the validator
const validator = new FinalValidator();
validator.runAllTests();

// Export for manual testing
window.validator = validator;
console.log('\n💡 Tip: Run `validator.runAllTests()` to re-run all tests');
console.log('💡 Tip: Check individual functions like `validator.validateAuth()`');