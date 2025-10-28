'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { reviewApi } from '../lib/reviewApi';
import { ReviewerAssignmentsTable } from './reviewer/ReviewerAssignmentsTable';
import { ReviewerEmptyState } from './reviewer/ReviewerEmptyState';
import { ReviewerDashboardData, PendingReview, CompletedReview, RECOMMENDATION_LABELS, RECOMMENDATION_COLORS } from '../types/review';

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<ReviewerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracker' | 'pending' | 'completed'>('tracker');
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getReviewerDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviewer dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if this is an empty state (no assignments) rather than an error
  const isEmptyState = error && (
    error.includes('Failed to load assignments') || 
    error.includes('No assignments found') ||
    error.includes('500') ||
    !dashboardData
  );

  // Show empty state for new reviewers or when there are no assignments
  if (isEmptyState && user) {
    const isFirstTime = !dashboardData || (
      dashboardData.reviewStats.totalReviews === 0 && 
      dashboardData.reviewStats.pendingCount === 0
    );
    
    return <ReviewerEmptyState reviewer={user} isFirstTime={isFirstTime} />;
  }

  // Show error state for actual errors
  if (error && !isEmptyState) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no dashboard data but user exists
  if (!dashboardData && user) {
    return <ReviewerEmptyState reviewer={user} isFirstTime={true} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Reviewer Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your manuscript reviews and track your review activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                <p className="text-2xl font-bold text-black">{dashboardData.reviewStats.pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Reviews</p>
                <p className="text-2xl font-bold text-black">{dashboardData.reviewStats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold text-black">
                  {dashboardData.reviewStats.totalReviews + dashboardData.reviewStats.pendingCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracker'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assignment Tracker
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Reviews ({dashboardData.reviewStats.pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed Reviews ({dashboardData.reviewStats.totalReviews})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'tracker' && (
          <ReviewerAssignmentsTable 
            onStartReview={(assignment) => {
              router.push(`/reviewer/review/${assignment.submission_id}`);
            }}
          />
        )}
        
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {dashboardData.pendingReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Reviews</h3>
                <p className="text-gray-500">You have no manuscripts waiting for review at this time.</p>
              </div>
            ) : (
              dashboardData.pendingReviews.map((review: any) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {review.submission_title || review.title || 'Untitled Submission'}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {review.abstract ? truncateText(review.abstract, 200) : 'No abstract available'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                        <span>Assigned: {formatDate(review.assigned_at)}</span>
                        <span>Due: {formatDate(review.due_date)}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          new Date(review.due_date) < new Date() 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {new Date(review.due_date) < new Date() ? 'Overdue' : 'Pending'}
                        </span>
                      </div>
                      {review.instructions && (
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
                          <p className="text-xs font-medium text-gray-600 mb-1">Review Instructions:</p>
                          <p className="text-sm text-gray-700">{review.instructions}</p>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>
                          Author: {review.author_first_name || 'Unknown'} {review.author_last_name || 'Author'}
                        </span>
                        <span>Submission ID: {review.submission_id}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          // Navigate to review form using Next router for correct basePath handling
                          router.push(`/reviewer/review/${review.submission_id}`);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        {review.status === 'pending' ? 'Start Review' : 'Continue Review'}
                      </button>
                      <button
                        onClick={() => window.open(`/submissions/${review.submission_id}/preview`, '_blank')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                      >
                        Quick Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-4">
            {dashboardData.completedReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Reviews</h3>
                <p className="text-gray-500">You haven't completed any reviews yet.</p>
              </div>
            ) : (
              dashboardData.completedReviews.map((review: CompletedReview) => (
                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black mb-2">{review.title}</h3>
                      <p className="text-gray-600 mb-3">{truncateText(review.abstract, 150)}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                        <span>
                          Author: {review.author_first_name} {review.author_last_name}
                        </span>
                        <span>Submitted: {formatDate(review.submission_date)}</span>
                        <span>Reviewed: {formatDate(review.submitted_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Recommendation:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          RECOMMENDATION_COLORS[review.recommendation]
                        }`}>
                          {RECOMMENDATION_LABELS[review.recommendation]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Review Comments:</h4>
                    <p className="text-sm text-gray-600">{truncateText(review.comments, 300)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}