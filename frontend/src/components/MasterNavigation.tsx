'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { User } from '../types/auth';
import DashboardRouter from './DashboardRouter';
import ManuscriptWorkflow from './ManuscriptWorkflow';
import ReviewerAssignmentAdvanced from './ReviewerAssignmentAdvanced';
import ReviewDashboard from './ReviewDashboard';
import PublicationManager from './PublicationManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import EditorialBoardManager from './EditorialBoardManager';
import SystemSettings from './SystemSettings';

type NavigationView = 
  | 'dashboard' 
  | 'workflow' 
  | 'reviewer-assignment' 
  | 'review-management' 
  | 'publication' 
  | 'analytics' 
  | 'editorial-board' 
  | 'settings';

interface NavigationItem {
  id: NavigationView;
  name: string;
  icon: string;
  roles: Array<'author' | 'reviewer' | 'editor' | 'admin'>;
  description: string;
}

const MasterNavigation: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard');
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '🏠',
      roles: ['author', 'reviewer', 'editor', 'admin'],
      description: 'Your main workspace overview'
    },
    {
      id: 'workflow',
      name: 'Manuscript Workflow',
      icon: '📋',
      roles: ['author', 'editor', 'admin'],
      description: 'Track manuscript progress through review stages'
    },
    {
      id: 'reviewer-assignment',
      name: 'Reviewer Assignment',
      icon: '👥',
      roles: ['editor', 'admin'],
      description: 'Advanced reviewer matching and assignment'
    },
    {
      id: 'review-management',
      name: 'Review Management',
      icon: '📝',
      roles: ['editor', 'admin'],
      description: 'Comprehensive review process oversight'
    },
    {
      id: 'publication',
      name: 'Publication Pipeline',
      icon: '📚',
      roles: ['editor', 'admin'],
      description: 'Manage production from acceptance to publication'
    },
    {
      id: 'analytics',
      name: 'Analytics & Insights',
      icon: '📊',
      roles: ['editor', 'admin'],
      description: 'Performance metrics and journal insights'
    },
    {
      id: 'editorial-board',
      name: 'Editorial Board',
      icon: '👨‍💼',
      roles: ['admin'],
      description: 'Manage editorial board members and governance'
    },
    {
      id: 'settings',
      name: 'System Settings',
      icon: '⚙️',
      roles: ['admin'],
      description: 'Configure journal settings and policies'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const availableItems = navigationItems.filter(item => 
    item.roles.includes(user.role as any)
  );

  const handleViewManuscript = (manuscript: any) => {
    setSelectedManuscript(manuscript);
    setCurrentView('workflow');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardRouter onViewManuscript={handleViewManuscript} />;
        
      case 'workflow':
        if (!selectedManuscript) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">No Manuscript Selected</h2>
                <p className="mt-2 text-gray-600">Please select a manuscript to view its workflow.</p>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <ManuscriptWorkflow 
                manuscript={selectedManuscript}
                userRole={user.role as any}
                onStatusUpdate={(id, status) => {
                  // Handle status update
                }}
                onCommentAdd={(id, comment) => {
                  // Handle comment addition
                }}
              />
            </div>
          </div>
        );
        
      case 'reviewer-assignment':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Reviewer Assignment</h1>
              <p className="text-gray-600 mb-8">Advanced reviewer matching and assignment system coming soon. This would integrate with manuscript data to provide intelligent reviewer suggestions.</p>
              
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Reviewer Assignment Hub</h2>
                <p className="text-gray-600 mb-4">
                  This advanced system would provide intelligent reviewer matching based on expertise, availability, and workload distribution.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Smart Matching</h3>
                    <p className="text-sm text-gray-600 mt-1">AI-powered reviewer suggestions</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Workload Balance</h3>
                    <p className="text-sm text-gray-600 mt-1">Automatic workload distribution</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Performance Tracking</h3>
                    <p className="text-sm text-gray-600 mt-1">Reviewer performance analytics</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'review-management':
        return (
          <div className="min-h-screen bg-gray-50">
            <ReviewDashboard currentUser={user} />
          </div>
        );
        
      case 'publication':
        return (
          <div className="min-h-screen bg-gray-50">
            <PublicationManager currentUser={user} />
          </div>
        );
        
      case 'analytics':
        return (
          <div className="min-h-screen bg-gray-50">
            <AnalyticsDashboard currentUser={user} />
          </div>
        );
        
      case 'editorial-board':
        return (
          <div className="min-h-screen bg-gray-50">
            <EditorialBoardManager currentUser={user} />
          </div>
        );
        
      case 'settings':
        return (
          <div className="min-h-screen bg-gray-50">
            <SystemSettings currentUser={user} />
          </div>
        );
        
      default:
        return <DashboardRouter onViewManuscript={handleViewManuscript} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PJ</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Pan-African Journal</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6">
          <div className="px-3">
            {availableItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <div className="flex-grow">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Pan-African Journal System</p>
            <p className="mt-1">v2.1.0 - August 2025</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default MasterNavigation;
