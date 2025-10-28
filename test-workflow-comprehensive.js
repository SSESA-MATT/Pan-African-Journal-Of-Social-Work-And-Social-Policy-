#!/usr/bin/env node

/**
 * Comprehensive Workflow Test for Pan-African Journal Platform
 * Tests the complete manuscript submission to publication pipeline
 */

const BASE_URL = 'http://localhost:3001';

// Test utilities
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`🔍 ${options.method || 'GET'} ${url}`);
  
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
    
    if (!response.ok) {
      console.log(`   ❌ ${response.status}: ${JSON.stringify(data).substring(0, 200)}...`);
      return { success: false, status: response.status, data, error: data };
    }
    
    console.log(`   ✅ ${response.status}: Success`);
    return { success: true, status: response.status, data };
    
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test functions
async function testBasicConnectivity() {
  console.log('\\n🌐 Testing Basic Connectivity...');
  
  const tests = [
    { name: 'Health Check', endpoint: '/api/health' },
    { name: 'Homepage', endpoint: '/' },
    { name: 'Login Page', endpoint: '/login' },
    { name: 'Register Page', endpoint: '/register' }
  ];
  
  const results = [];
  for (const test of tests) {
    console.log(`\\n  Testing ${test.name}:`);
    const result = await makeRequest(test.endpoint);
    results.push({ ...test, ...result });
  }
  
  return results;
}

async function testAPIEndpoints() {
  console.log('\\n🔌 Testing API Endpoints...');
  
  const endpoints = [
    { name: 'Submissions API', endpoint: '/api/submissions' },
    { name: 'Articles API', endpoint: '/api/articles' },
    { name: 'Users API', endpoint: '/api/users' },
    { name: 'Reviews API', endpoint: '/api/reviews' },
    { name: 'Search API', endpoint: '/api/search/articles?q=test' },
    { name: 'Upload API', endpoint: '/api/upload', method: 'POST' }
  ];
  
  const results = [];
  for (const endpoint of endpoints) {
    console.log(`\\n  Testing ${endpoint.name}:`);
    const result = await makeRequest(endpoint.endpoint, { method: endpoint.method });
    results.push({ ...endpoint, ...result });
  }
  
  return results;
}

async function testUserRolePages() {
  console.log('\\n👥 Testing User Role Pages...');
  
  const pages = [
    { name: 'Author Dashboard', endpoint: '/author' },
    { name: 'Reviewer Dashboard', endpoint: '/reviewer' },
    { name: 'Admin Dashboard', endpoint: '/admin' },
    { name: 'Articles Page', endpoint: '/articles' },
    { name: 'Search Page', endpoint: '/search' }
  ];
  
  const results = [];
  for (const page of pages) {
    console.log(`\\n  Testing ${page.name}:`);
    const result = await makeRequest(page.endpoint);
    results.push({ ...page, ...result });
  }
  
  return results;
}

async function testSubmissionWorkflow() {
  console.log('\\n📝 Testing Submission Workflow...');
  
  const tests = [
    {
      name: 'Get Submissions List',
      endpoint: '/api/submissions',
      method: 'GET'
    },
    {
      name: 'Get Submission Statistics',
      endpoint: '/api/submissions/statistics',
      method: 'GET'
    },
    {
      name: 'Test Submission Creation (Structure)',
      endpoint: '/api/submissions',
      method: 'POST',
      body: {
        title: 'Test Manuscript: Ubuntu Philosophy in Social Work',
        abstract: 'This is a test abstract for a manuscript about Ubuntu philosophy and its application in social work practice.',
        keywords: ['Ubuntu', 'social work', 'African philosophy'],
        content: 'This is the main content of the test manuscript.',
        manuscript_type: 'research_article',
        word_count: 5000
      }
    }
  ];
  
  const results = [];
  for (const test of tests) {
    console.log(`\\n  Testing ${test.name}:`);
    const options = { method: test.method };
    if (test.body) {
      options.body = JSON.stringify(test.body);
    }
    const result = await makeRequest(test.endpoint, options);
    results.push({ ...test, ...result });
  }
  
  return results;
}

async function testReviewWorkflow() {
  console.log('\\n👨‍🔬 Testing Review Workflow...');
  
  const tests = [
    {
      name: 'Get Reviewer Assignments',
      endpoint: '/api/reviewer/assignments',
      method: 'GET'
    },
    {
      name: 'Get Reviews List',
      endpoint: '/api/reviews',
      method: 'GET'
    },
    {
      name: 'Get Admin Submissions',
      endpoint: '/api/admin/submissions',
      method: 'GET'
    },
    {
      name: 'Get Admin Reviewers',
      endpoint: '/api/admin/reviewers',
      method: 'GET'
    }
  ];
  
  const results = [];
  for (const test of tests) {
    console.log(`\\n  Testing ${test.name}:`);
    const result = await makeRequest(test.endpoint, { method: test.method });
    results.push({ ...test, ...result });
  }
  
  return results;
}

async function testPublicationWorkflow() {
  console.log('\\n📚 Testing Publication Workflow...');
  
  const tests = [
    {
      name: 'Get Published Articles',
      endpoint: '/api/articles',
      method: 'GET'
    },
    {
      name: 'Search Articles',
      endpoint: '/api/search/articles?q=social work',
      method: 'GET'
    },
    {
      name: 'Get Volumes',
      endpoint: '/api/volumes',
      method: 'GET'
    }
  ];
  
  const results = [];
  for (const test of tests) {
    console.log(`\\n  Testing ${test.name}:`);
    const result = await makeRequest(test.endpoint, { method: test.method });
    results.push({ ...test, ...result });
  }
  
  return results;
}

async function testFileHandling() {
  console.log('\\n📁 Testing File Handling...');
  
  const tests = [
    {
      name: 'Upload Endpoint Structure',
      endpoint: '/api/upload',
      method: 'POST'
    },
    {
      name: 'Manuscript Files Endpoint',
      endpoint: '/api/manuscripts/files',
      method: 'GET'
    }
  ];
  
  const results = [];
  for (const test of tests) {
    console.log(`\\n  Testing ${test.name}:`);
    const result = await makeRequest(test.endpoint, { method: test.method });
    results.push({ ...test, ...result });
  }
  
  return results;
}

function analyzeResults(results) {
  console.log('\\n📊 Analyzing Results...');
  
  let totalTests = 0;
  let passedTests = 0;
  let criticalFailures = [];
  let warnings = [];
  
  Object.entries(results).forEach(([category, tests]) => {
    console.log(`\\n${category.toUpperCase()}:`);
    
    tests.forEach(test => {
      totalTests++;
      const status = test.success ? '✅' : '❌';
      console.log(`  ${status} ${test.name} (${test.status || 'N/A'})`);
      
      if (test.success) {
        passedTests++;
      } else {
        // Categorize failures
        if (test.status >= 500) {
          criticalFailures.push(`${category}: ${test.name} - Server Error`);
        } else if (test.status === 404) {
          warnings.push(`${category}: ${test.name} - Not Found (might be expected)`);
        } else if (test.status === 401 || test.status === 403) {
          warnings.push(`${category}: ${test.name} - Auth Required (expected)`);
        } else {
          criticalFailures.push(`${category}: ${test.name} - ${test.error || 'Unknown error'}`);
        }
      }
    });
  });
  
  return {
    totalTests,
    passedTests,
    successRate: ((passedTests / totalTests) * 100).toFixed(1),
    criticalFailures,
    warnings
  };
}

async function runComprehensiveTest() {
  console.log('🚀 Pan-African Journal Platform - Comprehensive Workflow Test');
  console.log('==============================================================');
  
  const results = {
    connectivity: await testBasicConnectivity(),
    apiEndpoints: await testAPIEndpoints(),
    userPages: await testUserRolePages(),
    submissions: await testSubmissionWorkflow(),
    reviews: await testReviewWorkflow(),
    publications: await testPublicationWorkflow(),
    fileHandling: await testFileHandling()
  };
  
  const analysis = analyzeResults(results);
  
  console.log('\\n🎯 FINAL RESULTS');
  console.log('================');
  console.log(`Total Tests: ${analysis.totalTests}`);
  console.log(`Passed: ${analysis.passedTests}`);
  console.log(`Success Rate: ${analysis.successRate}%`);
  
  if (analysis.criticalFailures.length > 0) {
    console.log('\\n🚨 CRITICAL FAILURES:');
    analysis.criticalFailures.forEach(failure => console.log(`  ❌ ${failure}`));
  }
  
  if (analysis.warnings.length > 0) {
    console.log('\\n⚠️ WARNINGS (may be expected):');
    analysis.warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
  }
  
  if (analysis.criticalFailures.length === 0) {
    console.log('\\n🎉 No critical failures detected!');
    console.log('The core workflow appears to be functional.');
  } else {
    console.log('\\n🔧 Issues detected that need attention.');
  }
  
  console.log('\\n📋 NEXT STEPS:');
  console.log('1. Fix any critical failures listed above');
  console.log('2. Test with real user authentication');
  console.log('3. Test file upload functionality with actual files');
  console.log('4. Verify database data persistence');
  console.log('5. Test the complete user journey manually');
  
  return { results, analysis };
}

// Run the comprehensive test
if (require.main === module) {
  runComprehensiveTest().catch(console.error);
}

module.exports = { runComprehensiveTest };