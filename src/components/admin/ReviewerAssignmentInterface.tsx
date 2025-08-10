'use client';

import React, { useState, useEffect } from 'react';
import { submissionApi } from '@/lib/submissionApi';
import { userApi } from '@/lib/userApi';
import { User } from '@/types/auth';
import { Submission } from '@/types/submission';

interface ReviewerAssignment {
  submissionId: string;
  reviewerId: string;
  assignedAt: string;
}

export const ReviewerAssignmentInterface: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignmentLoading, setAssignmentLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load submissions that need reviewer assignment
      const submissionsResponse = await submissionApi.getSubmissionsPendingReview();
      if (submissionsResponse.submissions) {
        setSubmissions(submissionsResponse.submissions);
      }

      // Load available reviewers
      const reviewersResponse = await userApi.getUsersByRole('reviewer');
      if (reviewersResponse.data) {
        setReviewers(reviewersResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignReviewer = async (submissionId: string, reviewerId: string) => {
    try {
      setAssignmentLoading(submissionId);
      // This would be implemented in the backend API
      // await submissionApi.assignReviewer(submissionId, reviewerId);
      
      // For now, we'll simulate the assignment
      console.log(`Assigning reviewer ${reviewerId} to submission ${submissionId}`);
      
      // Refresh data after assignment
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign reviewer');
    } finally {
      setAssignmentLoading(null);
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        <span className="ml-3 text-neutral-600">Loading reviewer assignments...</span>
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
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-accent-green/5 to-white">
          <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Reviewer Assignment
          </h2>
          <p className="text-neutral-600 mt-1">Assign reviewers to submissions pending review</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-accent-red/10 rounded-full">
              <svg className="w-6 h-6 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Pending Assignment</p>
              <p className="text-2xl font-bold text-neutral-900">{submissions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-accent-green/10 rounded-full">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Available Reviewers</p>
              <p className="text-2xl font-bold text-neutral-900">{reviewers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-neutral-100 rounded-full">
              <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Avg. Reviews per Reviewer</p>
              <p className="text-2xl font-bold text-neutral-900">2.3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Submissions Pending Review Assignment</h3>
        </div>

        {submissions.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-neutral-600">No submissions pending reviewer assignment</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-neutral-900 truncate">
                        {submission.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSubmissionStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">
                      by {(submission as any).author_name || 'Unknown Author'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                    
                    {/* Abstract preview */}
                    <div className="mt-3">
                      <p className="text-sm text-neutral-700 line-clamp-2">
                        {submission.abstract}
                      </p>
                    </div>

                    {/* Keywords */}
                    {submission.keywords && submission.keywords.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {submission.keywords.slice(0, 3).map((keyword, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                              {keyword}
                            </span>
                          ))}
                          {submission.keywords.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                              +{submission.keywords.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reviewer Assignment */}
                  <div className="ml-6 flex-shrink-0 w-80">
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                      <h5 className="text-sm font-medium text-neutral-900 mb-3">Assign Reviewers</h5>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {reviewers.map((reviewer) => (
                          <div key={reviewer.id} className="flex items-center justify-between p-2 bg-white rounded border border-neutral-200">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {reviewer.first_name} {reviewer.last_name}
                              </p>
                              <p className="text-xs text-neutral-500 truncate">
                                {reviewer.affiliation}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAssignReviewer(submission.id, reviewer.id)}
                              disabled={assignmentLoading === submission.id}
                              className="ml-2 px-3 py-1 text-xs font-medium bg-accent-green text-white rounded hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {assignmentLoading === submission.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                              ) : (
                                'Assign'
                              )}
                            </button>
                          </div>
                        ))}
                      </div>

                      {reviewers.length === 0 && (
                        <p className="text-sm text-neutral-500 text-center py-4">
                          No reviewers available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};