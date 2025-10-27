'use client';

import React from 'react';
import { UserProfileDetails } from '../../../../../components/UserProfileDetails';
import { ProtectedRoute } from '../../../../../components/ProtectedRoute';

interface UserProfilePageProps {
  params: {
    userId: string;
  };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-accent-green hover:text-accent-green/80 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to User Management
              </button>
            </div>
          </div>
          
          <UserProfileDetails 
            userId={params.userId}
            showEditActions={true}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}