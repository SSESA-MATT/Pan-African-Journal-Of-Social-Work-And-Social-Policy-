'use client';

import React from 'react';
import { useAuth } from '../../components/AuthProvider';
import { tokenStorage } from '@/lib/storage';

export default function AuthTestPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();

  const handleClearStorage = () => {
    tokenStorage.clearAuth();
    window.location.reload();
  };

  const handleCheckStorage = () => {
    const storedUser = tokenStorage.getUser();
    const storedToken = tokenStorage.getAccessToken();
    console.log('Storage check:', {
      storedUser,
      storedToken: !!storedToken,
      contextUser: user,
      contextToken: !!token,
      isAuthenticated,
      isLoading
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Authentication Test Page
        </h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Has Token:</strong> {token ? 'Yes' : 'No'}</p>
            <p><strong>Has User:</strong> {user ? 'Yes' : 'No'}</p>
            {user && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold">User Details:</h3>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Affiliation:</strong> {user.affiliation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleCheckStorage}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Check Storage
            </button>
            <button
              onClick={handleClearStorage}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Auth & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
