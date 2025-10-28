#!/usr/bin/env node

/**
 * Comprehensive Workflow Test Script
 * Tests the complete manuscript submission to publication pipeline
 */

const BASE_URL = 'http://localhost:3001';

// Test utilities
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`🔍 Testing: ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log(`   ❌ Error: ${JSON.stringify(data, null, 2)}`);
      return { success: false, status: response.status, data };
    }
    
    console.log(`   ✅ Success`);
    return { success: true, status: response.status, data };
    
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\\n🏥 Testing Health Check...');
  return await makeRequest('/api/health');
}

async function testDatabaseConnection() {
  console.log('\\n🗄️ Testing Database Connection...');
  return await makeRequest('/api/test-db');
}

async function testAuthEndpoints() {
  console.log('\\n🔐 Testing Authentication Endpoints...');
  
  const results = [];
  
  // Test registration endpoint structure
  results.push(await makeRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User'
    })
  }));
  
  // Test login endpoint structure
  results.push(await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword123'
    })
  }));
  
  return results;
}

async function testSubmissionEndpoints() {
  console.log('\\n📝 Testing Submission Endpoints...');
  
  const results = [];
  
  // Test submissions list endpoint
  results.push(await makeRequest('/api/submissions'));
  
  // Test submission statistics
  results.push(await makeRequest('/api/submissions/statistics'));
  
  // Test submissions for admin
  results.push(await makeRequest('/api/submissions/all'));
  
  return results;
}

async function testReviewEndpoints() {
  console.log('\\n👥 Testing Review Endpoints...');
  
  const results = [];
  
  // Test reviewer assignments
  results.push(await makeRequest('/api/reviewer/assignments'));
  
  // Test reviews endpoint
  results.push(await makeRequest('/api/reviews'));
  
  return results;
}

async function testArticleEndpoints() {
  console.log('\\n📚 Testing Article Endpoints...');
  
  const results = [];
  
  // Test articles list
  results.push(await makeRequest('/api/articles'));
  
  // Test search functionality
  results.push(await makeRequest('/api/search/articles?q=social work'));
  
  return results;
}

async function testFileUpload() {
  console.log('\\n📁 Testing File Upload Endpoint...');
  
  // Test upload endpoint structure (without actual file)
  return await makeRequest('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

async function testUserManagement() {
  console.log('\\n👤 Testing User Management...');
  
  const results = [];
  
  // Test users endpoint
  results.push(await makeRequest('/api/users'));
  
  // Test reviewers list
  results.push(await makeRequest('/api/users/reviewers'));
  
  // Test user statistics
  results.push(await makeRequest('/api/users/stats'));
  
  return results;
}

async function testAdminEndpoints() {
  console.log('\\n🔧 Testing Admin Endpoints...');
  
  const results = [];
  
  // Test admin submissions
  results.push(await makeRequest('/api/admin/submissions'));
  
  // Test admin reviewers
  results.push(await makeRequest('/api/admin/reviewers'));
  
  return results;
}

async function testPageRoutes() {
  console.log('\\n🌐 Testing Page Routes...');
  
  const routes = [
    '/',
    '/about',
    '/articles',
    '/search',
    '/login',
    '/register',
    '/author',
    '/reviewer',
    '/admin',
    '/contact',
    '/guidelines/authors',
    '/guidelines/reviewers'
  ];
  
  const results = [];
  
  for (const route of routes) {
    const result = await makeRequest(route);
    results.push({ route, ...result });
  }
  
  return results;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Workflow Tests');
  console.log('==========================================');
  
  const testResults = {
    health: await testHealthCheck(),
    database: await testDatabaseConnection(),
    auth: await testAuthEndpoints(),
    submissions: await testSubmissionEndpoints(),
    reviews: await testReviewEndpoints(),
    articles: await testArticleEndpoints(),
    fileUpload: await testFileUpload(),
    users: await testUserManagement(),
    admin: await testAdminEndpoints(),
    pages: await testPageRoutes()
  };
  
  console.log('\\n📊 Test Results Summary');
  console.log('========================');
  
  let totalTests = 0;
  let passedTests = 0;
  
  Object.entries(testResults).forEach(([category, results]) => {
    if (Array.isArray(results)) {
      results.forEach((result, index) => {
        totalTests++;
        if (result.success) passedTests++;
        console.log(`${category}[${index}]: ${result.success ? '✅' : '❌'} ${result.route || ''}`);
      });
    } else {
      totalTests++;
      if (results.success) passedTests++;
      console.log(`${category}: ${results.success ? '✅' : '❌'}`);
    }
  });
  
  console.log(`\\n🎯 Overall Results: ${passedTests}/${totalTests} tests passed`);
  console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\\n🎉 All tests passed! The workflow appears to be working correctly.');
  } else {
    console.log('\\n⚠️ Some tests failed. Check the detailed output above for issues.');
  }
  
  return testResults;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, makeRequest };