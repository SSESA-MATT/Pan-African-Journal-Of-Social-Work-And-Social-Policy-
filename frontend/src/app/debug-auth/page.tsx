'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';

export default function AuthTestPage() {
  const { user, isLoading } = useAuth();
  const [authDebugData, setAuthDebugData] = useState<any>(null);
  const [apiTestResults, setApiTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // Test the auth debug endpoint
      const response = await fetch('/api/auth-debug', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthDebugData(data);
      } else {
        setAuthDebugData({ error: `HTTP ${response.status}: ${response.statusText}` });
      }
    } catch (error) {
      setAuthDebugData({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testSubmissionsAPI = async () => {
    setLoading(true);
    const results: any = {};
    
    try {
      // Test GET submissions
      console.log('Testing GET /api/submissions...');
      const getResponse = await fetch('/api/submissions', {
        method: 'GET',
        credentials: 'include'
      });
      
      results.get = {
        status: getResponse.status,
        ok: getResponse.ok,
        data: getResponse.ok ? await getResponse.json() : await getResponse.text()
      };
      
      // Test POST submissions (minimal data)
      console.log('Testing POST /api/submissions...');
      const testPayload = {
        title: 'Test Submission',
        abstract: 'This is a test abstract',
        keywords: ['test', 'debugging'],
        authors: ['Test Author'],
        corresponding_author: 'test@example.com',
        manuscript_type: 'research',
        funding_information: 'No funding',
        conflict_of_interest: 'No conflicts',
        ethics_approval: 'Not applicable',
        data_availability: 'Available on request',
        research_areas: 'Testing',
        word_count: 100
      };
      
      const postResponse = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(testPayload)
      });
      
      results.post = {
        status: postResponse.status,
        ok: postResponse.ok,
        data: postResponse.ok ? await postResponse.json() : await postResponse.text()
      };
      
    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    setApiTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Authentication & API Debugging</h1>
          
          {/* Authentication Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Frontend Authentication State</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>User Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
              {user && (
                <div className="mt-2">
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* Backend Authentication Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Backend Authentication Status</h2>
            <button 
              onClick={checkAuthStatus}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {loading ? 'Checking...' : 'Check Backend Auth'}
            </button>
            
            {authDebugData && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(authDebugData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* API Tests */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">API Tests</h2>
            <div className="space-x-4 mb-4">
              <button 
                onClick={testSubmissionsAPI}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Submissions API'}
              </button>
            </div>
            
            {Object.keys(apiTestResults).length > 0 && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">API Test Results:</h3>
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(apiTestResults, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Troubleshooting Guide */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Troubleshooting Guide</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Common Issues & Solutions:</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li><strong>401 Errors:</strong> Authentication session expired or missing. Try logging out and back in.</li>
                <li><strong>404 Errors:</strong> API route not found. Check if the endpoint exists in production.</li>
                <li><strong>CORS Errors:</strong> Cross-origin issues. Check domain configuration.</li>
                <li><strong>Session Mismatch:</strong> Frontend auth state doesn't match backend session.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}