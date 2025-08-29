'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import AuthorDashboard from './AuthorDashboard';
import ReviewerDashboard from './ReviewerDashboard';
import { User } from '../types/auth';

interface DashboardRouterProps {
  forcedRole?: 'author' | 'reviewer' | 'editor' | 'admin';
  onViewManuscript?: (manuscript: any) => void;
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ 
  forcedRole, 
  onViewManuscript 
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const userRole = forcedRole || user.role;

  // Role-based dashboard routing
  switch (userRole) {
    case 'author':
      return <AuthorDashboard onViewManuscript={onViewManuscript} />;
      
    case 'reviewer':
      return <ReviewerDashboard />;
      
    case 'editor':
    case 'admin':
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="mt-2 text-gray-600">
              Advanced administrative features are available through the navigation menu.
            </p>
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">📊 Analytics Dashboard</div>
                  <div className="text-blue-700 mt-1">Comprehensive journal metrics</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">📋 Review Management</div>
                  <div className="text-green-700 mt-1">Oversee peer review process</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900">📚 Publication Pipeline</div>
                  <div className="text-purple-700 mt-1">Manage publication workflow</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-orange-900">⚙️ System Settings</div>
                  <div className="text-orange-700 mt-1">Configure journal policies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Role Not Recognized</h2>
            <p className="mt-2 text-gray-600">
              Your account role ({userRole}) is not recognized. Please contact support.
            </p>
            <div className="mt-4 space-y-2">
              <div className="text-sm text-gray-500">
                <strong>User ID:</strong> {user.id}
              </div>
              <div className="text-sm text-gray-500">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="text-sm text-gray-500">
                <strong>Current Role:</strong> {user.role}
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default DashboardRouter;
