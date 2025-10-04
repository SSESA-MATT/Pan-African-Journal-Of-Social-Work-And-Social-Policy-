'use client';

import React, { useState } from 'react';
import { useAuth } from '../../components/AuthProvider';

export default function ReviewerDebugPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [backendAuth, setBackendAuth] = useState<any>(null);
  const [reviewerDashboard, setReviewerDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkBackendAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reviewer-auth-debug', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setBackendAuth(data);
    } catch (error) {
      setBackendAuth({ error: 'Failed to check backend auth' });
    }
    setLoading(false);
  };

  const testReviewerDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reviews/dashboard', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setReviewerDashboard({ 
        status: response.status, 
        data: data,
        ok: response.ok 
      });
    } catch (error) {
      setReviewerDashboard({ error: 'Failed to test reviewer dashboard' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reviewer Authentication Debug</h1>
        
        {/* Frontend Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Frontend Authentication State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>User Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
              </>
            )}
          </div>
        </div>

        {/* Backend Auth Check */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Backend Authentication Status</h2>
            <button
              onClick={checkBackendAuth}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Backend Auth'}
            </button>
          </div>
          
          {backendAuth && (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(backendAuth, null, 2)}
            </pre>
          )}
        </div>

        {/* Reviewer Dashboard Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Reviewer Dashboard API Test</h2>
            <button
              onClick={testReviewerDashboard}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Dashboard API'}
            </button>
          </div>
          
          {reviewerDashboard && (
            <div>
              <p className="mb-2">
                <strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  reviewerDashboard.status === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {reviewerDashboard.status}
                </span>
              </p>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(reviewerDashboard, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Troubleshooting Guide</h2>
          <div className="space-y-4 text-sm">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-medium">If backend auth shows "Missing" cookies:</p>
              <p>The session cookies are not being sent to API routes. This indicates a cookie domain or authentication setup issue.</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="font-medium">If user role is not "reviewer", "editor", or "admin":</p>
              <p>The current user doesn't have reviewer permissions. The role needs to be updated in the database.</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="font-medium">If dashboard API returns 500 error:</p>
              <p>There's likely a database schema issue or the API is trying to access non-existent tables/columns.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}