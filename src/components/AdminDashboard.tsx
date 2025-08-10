'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { SubmissionOverview } from './admin/SubmissionOverview';
import { ReviewerAssignmentInterface } from './admin/ReviewerAssignmentInterface';
import { SubmissionStatusManager } from './admin/SubmissionStatusManager';
import { AdminUserManagement } from './admin/AdminUserManagement';
import { BulkOperations } from './admin/BulkOperations';
import { ArticlePublicationWorkflow } from './admin/ArticlePublicationWorkflow';
import { VolumeIssueManagement } from './admin/VolumeIssueManagement';
import { ArticleMetadataManager } from './admin/ArticleMetadataManager';

type AdminTab = 'overview' | 'submissions' | 'reviewers' | 'users' | 'bulk-ops' | 'publish-articles' | 'volumes-issues' | 'article-metadata';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  if (!user) {
    return null;
  }

  const tabs = [
    {
      id: 'overview' as AdminTab,
      name: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'submissions' as AdminTab,
      name: 'Submissions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'reviewers' as AdminTab,
      name: 'Reviewers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'users' as AdminTab,
      name: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      id: 'bulk-ops' as AdminTab,
      name: 'Bulk Operations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      id: 'publish-articles' as AdminTab,
      name: 'Publish Articles',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: 'volumes-issues' as AdminTab,
      name: 'Volumes & Issues',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'article-metadata' as AdminTab,
      name: 'Article Metadata',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with African-inspired design */}
        <div className="bg-gradient-to-r from-neutral-900 via-accent-black to-neutral-800 text-white">
          <div className="px-4 md:px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Editorial Dashboard
                </h1>
                <p className="text-neutral-200 text-lg mb-1">
                  Pan African Journal Of Social Work And Social Policy
                </p>
                <p className="text-neutral-300 text-sm">
                  Welcome, {user.first_name} {user.last_name} • {user.role === 'admin' ? 'Administrator' : 'Editor'}
                </p>
              </div>
              <div className="mt-6 lg:mt-0">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-accent-red rounded-full"></div>
                  <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation with African color scheme */}
          <div className="border-t border-neutral-700">
            <nav className="px-4 md:px-6">
              <div className="flex flex-wrap -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-4 md:px-6 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-accent-green text-accent-green bg-neutral-800/50'
                        : 'border-transparent text-neutral-300 hover:text-white hover:border-neutral-500'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {activeTab === 'overview' && <SubmissionOverview />}
          {activeTab === 'submissions' && <SubmissionStatusManager />}
          {activeTab === 'reviewers' && <ReviewerAssignmentInterface />}
          {activeTab === 'users' && <AdminUserManagement />}
          {activeTab === 'bulk-ops' && <BulkOperations />}
          {activeTab === 'publish-articles' && <ArticlePublicationWorkflow />}
          {activeTab === 'volumes-issues' && <VolumeIssueManagement />}
          {activeTab === 'article-metadata' && <ArticleMetadataManager />}
        </div>
      </div>
    </div>
  );
};