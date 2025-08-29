'use client';

import React, { useState, useEffect } from 'react';
import { Manuscript } from '../types/manuscript';
import { User } from '../types/auth';

interface ReviewDashboardProps {
  currentUser: User;
}

interface ReviewMetrics {
  total_manuscripts: number;
  manuscripts_under_review: number;
  manuscripts_awaiting_assignment: number;
  manuscripts_requiring_decision: number;
  average_review_time: number;
  pending_revisions: number;
  manuscripts_published_this_month: number;
  active_reviewers: number;
}

interface ReviewerPerformance {
  id: string;
  name: string;
  email: string;
  institution: string;
  total_reviews: number;
  completed_reviews: number;
  average_days_to_complete: number;
  current_assignments: number;
  rating: number;
  last_activity: string;
}

interface ReviewAlert {
  id: string;
  type: 'overdue' | 'attention' | 'conflict' | 'warning';
  title: string;
  description: string;
  manuscript_id?: string;
  reviewer_id?: string;
  created_at: string;
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ currentUser }) => {
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [recentManuscripts, setRecentManuscripts] = useState<Manuscript[]>([]);
  const [reviewerPerformance, setReviewerPerformance] = useState<ReviewerPerformance[]>([]);
  const [alerts, setAlerts] = useState<ReviewAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviewers' | 'alerts' | 'analytics'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Simulate API calls - in real implementation these would be actual API calls
      const mockMetrics: ReviewMetrics = {
        total_manuscripts: 156,
        manuscripts_under_review: 23,
        manuscripts_awaiting_assignment: 8,
        manuscripts_requiring_decision: 12,
        average_review_time: 28,
        pending_revisions: 15,
        manuscripts_published_this_month: 7,
        active_reviewers: 45
      };

      const mockManuscripts: Manuscript[] = [
        {
          id: '1',
          title: 'Community-Based Social Work Interventions in Rural Africa',
          authors: ['Dr. Sarah Johnson', 'Prof. Michael Okafor'],
          corresponding_author: 'Dr. Sarah Johnson',
          author_id: 'author-1',
          content: 'Full manuscript content would be here...',
          status: 'under-review',
          submission_date: '2025-08-15T10:00:00Z',
          last_updated: '2025-08-25T14:30:00Z',
          keywords: ['Social Work', 'Rural Development', 'Community Intervention'],
          abstract: 'This study examines the effectiveness of community-based social work interventions...',
          manuscript_url: '/files/manuscript-1.pdf',
          assigned_reviewers: ['reviewer-1', 'reviewer-2']
        },
        {
          id: '2',
          title: 'Policy Analysis of Social Protection Programs in West Africa',
          authors: ['Prof. Aminata Traore'],
          corresponding_author: 'Prof. Aminata Traore',
          author_id: 'author-2',
          content: 'Full manuscript content would be here...',
          status: 'awaiting-revision',
          submission_date: '2025-08-10T09:15:00Z',
          last_updated: '2025-08-26T11:20:00Z',
          keywords: ['Social Policy', 'Social Protection', 'West Africa'],
          abstract: 'An analysis of social protection programs implemented across West African countries...',
          manuscript_url: '/files/manuscript-2.pdf',
          assigned_reviewers: ['reviewer-3', 'reviewer-4'],
          editor_comments: 'Please address the reviewers\' concerns about methodology.'
        }
      ];

      const mockReviewerPerformance: ReviewerPerformance[] = [
        {
          id: 'reviewer-1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@university.edu',
          institution: 'University of Cape Town',
          total_reviews: 12,
          completed_reviews: 11,
          average_days_to_complete: 18,
          current_assignments: 3,
          rating: 4.8,
          last_activity: '2025-08-28T16:45:00Z'
        },
        {
          id: 'reviewer-2',
          name: 'Prof. Michael Okafor',
          email: 'michael.okafor@university.ng',
          institution: 'University of Lagos',
          total_reviews: 8,
          completed_reviews: 7,
          average_days_to_complete: 22,
          current_assignments: 2,
          rating: 4.6,
          last_activity: '2025-08-27T09:30:00Z'
        },
        {
          id: 'reviewer-3',
          name: 'Dr. Fatima Al-Rashid',
          email: 'fatima.rashid@university.ma',
          institution: 'Mohammed V University',
          total_reviews: 15,
          completed_reviews: 14,
          average_days_to_complete: 25,
          current_assignments: 4,
          rating: 4.9,
          last_activity: '2025-08-26T14:15:00Z'
        }
      ];

      const mockAlerts: ReviewAlert[] = [
        {
          id: 'alert-1',
          type: 'overdue',
          title: 'Review Overdue',
          description: 'Dr. Smith\'s review for manuscript "Social Work Ethics" is 5 days overdue.',
          manuscript_id: '3',
          reviewer_id: 'reviewer-5',
          created_at: '2025-08-28T08:00:00Z'
        },
        {
          id: 'alert-2',
          type: 'attention',
          title: 'Decision Required',
          description: 'Manuscript "Community Health Interventions" has completed reviews and requires editorial decision.',
          manuscript_id: '4',
          created_at: '2025-08-27T15:30:00Z'
        },
        {
          id: 'alert-3',
          type: 'warning',
          title: 'High Reviewer Workload',
          description: 'Dr. Johnson has 5 active review assignments, consider redistributing.',
          reviewer_id: 'reviewer-1',
          created_at: '2025-08-26T12:00:00Z'
        }
      ];

      setMetrics(mockMetrics);
      setRecentManuscripts(mockManuscripts);
      setReviewerPerformance(mockReviewerPerformance);
      setAlerts(mockAlerts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'revisions_required': return 'bg-orange-100 text-orange-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: ReviewAlert['type']) => {
    switch (type) {
      case 'overdue':
        return <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'attention':
        return <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>;
      case 'warning':
        return <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>;
      default:
        return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage the peer review process across all manuscripts</p>
        </div>

        {/* Key Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Manuscripts</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.total_manuscripts}</p>
                </div>
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Under Review</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.manuscripts_under_review}</p>
                </div>
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Need Assignment</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.manuscripts_awaiting_assignment}</p>
                </div>
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Avg. Review Time</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.average_review_time}<span className="text-lg text-gray-600"> days</span></p>
                </div>
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { key: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a1 1 0 010 2H6v2a1 1 0 01-2 0V6zM14 6a1 1 0 011-1h2a2 2 0 012 2v2a1 1 0 11-2 0V6h-2a1 1 0 01-1-1zM4 16a1 1 0 011 1v2h2a1 1 0 110 2H6a2 2 0 01-2-2v-2a1 1 0 011-1zM20 16a1 1 0 011 1v2a2 2 0 01-2 2h-2a1 1 0 110-2h2v-2a1 1 0 011-1z' },
                { key: 'reviewers', label: 'Reviewers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                { key: 'alerts', label: 'Alerts', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z' },
                { key: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium ${
                    activeTab === tab.key
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Manuscript Activity</h3>
                  <div className="space-y-3">
                    {recentManuscripts.map(manuscript => (
                      <div key={manuscript.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900">{manuscript.title}</h4>
                          <p className="text-gray-600 text-sm">by {manuscript.authors.join(', ')}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Submitted: {new Date(manuscript.submission_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(manuscript.status)}`}>
                            {manuscript.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviewers Tab */}
            {activeTab === 'reviewers' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviewer Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Days</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Load</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reviewerPerformance.map(reviewer => (
                        <tr key={reviewer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{reviewer.name}</div>
                              <div className="text-sm text-gray-500">{reviewer.institution}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {Math.round((reviewer.completed_reviews / reviewer.total_reviews) * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {reviewer.completed_reviews}/{reviewer.total_reviews} reviews
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {reviewer.average_days_to_complete}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              reviewer.current_assignments > 3 ? 'bg-red-100 text-red-800' :
                              reviewer.current_assignments > 1 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {reviewer.current_assignments} active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getRatingStars(Math.floor(reviewer.rating))}
                              <span className="ml-2 text-sm text-gray-600">{reviewer.rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(reviewer.last_activity).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts ({alerts.length})</h3>
                <div className="space-y-4">
                  {alerts.map(alert => (
                    <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3 mt-0.5">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{alert.description}</p>
                          <p className="text-gray-400 text-xs mt-2">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        <button className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Review Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Monthly Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published this month</span>
                        <span className="font-semibold">{metrics?.manuscripts_published_this_month}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending revisions</span>
                        <span className="font-semibold">{metrics?.pending_revisions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active reviewers</span>
                        <span className="font-semibold">{metrics?.active_reviewers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average review time</span>
                        <span className="font-semibold">{metrics?.average_review_time} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">On-time completion rate</span>
                        <span className="font-semibold">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reviewer satisfaction</span>
                        <span className="font-semibold">4.6/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDashboard;
