'use client';

import React, { useState, useEffect } from 'react';
import { submissionApi } from '@/lib/submissionApi';

interface SubmissionStats {
  total: number;
  submitted?: number;
  under_review?: number;
  revisions_required?: number;
  accepted?: number;
  rejected?: number;
}

export const SubmissionOverview: React.FC = () => {
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load statistics
      const statsResponse = await submissionApi.getSubmissionStatistics();
      if (statsResponse.statistics) {
        const stats = statsResponse.statistics;
        const total = (stats.submitted || 0) + (stats.under_review || 0) + (stats.revisions_required || 0) + (stats.accepted || 0) + (stats.rejected || 0);
        setStats({ total, ...stats });
      }

      // Load recent submissions
      const submissionsResponse = await submissionApi.getAllSubmissions();
      if (submissionsResponse.submissions) {
        // Sort by submission date and take the 5 most recent
        const sorted = submissionsResponse.submissions
          .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
          .slice(0, 5);
        setRecentSubmissions(sorted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'revisions_required':
        return 'bg-accent-red/10 text-red-800 border-red-200';
      case 'accepted':
        return 'bg-accent-green/10 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'under_review':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'revisions_required':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'accepted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        <span className="ml-3 text-neutral-600">Loading overview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards with African-inspired design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats && Object.entries(stats).map(([key, value]) => {
          const isTotal = key === 'total';
          const cardColor = isTotal 
            ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border-neutral-700' 
            : 'bg-white border-neutral-200';
          
          return (
            <div key={key} className={`rounded-lg border p-4 shadow-sm ${cardColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isTotal ? 'text-neutral-200' : 'text-neutral-600'} uppercase tracking-wide`}>
                    {key.replace('_', ' ')}
                  </p>
                  <p className={`text-2xl font-bold ${isTotal ? 'text-white' : 'text-neutral-900'} mt-1`}>
                    {value}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${isTotal ? 'bg-neutral-700' : 'bg-neutral-100'}`}>
                  {getStatusIcon(key)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Submissions
          </h3>
        </div>
        
        {recentSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-neutral-600">No submissions found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {recentSubmissions.map((submission, index) => (
              <div key={submission.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-neutral-900 truncate">
                      {submission.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mt-1">
                      by {submission.author_name || 'Unknown Author'}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-accent-green hover:bg-accent-green/5 transition-colors group">
              <div className="text-center">
                <svg className="w-8 h-8 text-neutral-400 group-hover:text-accent-green mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm font-medium text-neutral-600 group-hover:text-accent-green">Assign Reviewers</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-accent-red hover:bg-accent-red/5 transition-colors group">
              <div className="text-center">
                <svg className="w-8 h-8 text-neutral-400 group-hover:text-accent-red mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-neutral-600 group-hover:text-accent-red">Update Status</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-neutral-900 hover:bg-neutral-900/5 transition-colors group">
              <div className="text-center">
                <svg className="w-8 h-8 text-neutral-400 group-hover:text-neutral-900 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900">Manage Users</p>
              </div>
            </button>
            
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
              <div className="text-center">
                <svg className="w-8 h-8 text-neutral-400 group-hover:text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <p className="text-sm font-medium text-neutral-600 group-hover:text-blue-500">Bulk Operations</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};