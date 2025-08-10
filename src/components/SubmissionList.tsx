'use client';

import React, { useState, useEffect } from 'react';
import { submissionApi } from '../lib/submissionApi';
import { Submission } from '../types/submission';
import { SubmissionStatus } from './SubmissionStatus';

interface SubmissionListProps {
  userId?: string;
  userRole?: string;
  showAuthorInfo?: boolean;
  onSubmissionClick?: (submission: Submission) => void;
}

export const SubmissionList: React.FC<SubmissionListProps> = ({
  userId,
  userRole,
  showAuthorInfo = false,
  onSubmissionClick
}) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadSubmissions();
  }, [userRole]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');

      let result;
      if (userRole === 'admin' || userRole === 'editor') {
        result = await submissionApi.getAllSubmissions();
      } else {
        result = await submissionApi.getMySubmissions();
      }

      setSubmissions(result.submissions);
    } catch (err: any) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubmissionClick = (submission: Submission) => {
    if (onSubmissionClick) {
      onSubmissionClick(submission);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div>
          <span className="ml-3 text-neutral-600">Loading submissions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-md p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-primary-800 font-medium">{error}</p>
          </div>
          <button
            onClick={loadSubmissions}
            className="mt-3 inline-flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12">
        <div className="text-center">
          <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No submissions found</h3>
          <p className="text-neutral-600">
            {userRole === 'admin' || userRole === 'editor' 
              ? 'No submissions have been made to the journal yet.' 
              : 'You haven\'t submitted any manuscripts yet. Click "New Submission" to get started.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-neutral-200">
      <div className="px-6 py-4 bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">
          {userRole === 'admin' || userRole === 'editor' ? 'All Submissions' : 'My Submissions'}
        </h3>
      </div>

      <div className="divide-y divide-neutral-200">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className={`px-6 py-5 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-transparent transition-all duration-200 ${
              onSubmissionClick ? 'cursor-pointer' : ''
            }`}
            onClick={() => handleSubmissionClick(submission)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-neutral-900 truncate mb-2">
                  {submission.title}
                </h4>
                
                {showAuthorInfo && submission.first_name && (
                  <p className="text-sm text-neutral-600 mb-2">
                    by {submission.first_name} {submission.last_name}
                    {submission.affiliation && (
                      <span className="text-neutral-500"> • {submission.affiliation}</span>
                    )}
                  </p>
                )}

                <p className="text-sm text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                  {submission.abstract}
                </p>

                <div className="flex flex-wrap items-center mt-3 gap-4 text-xs text-neutral-500">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Submitted: {formatDate(submission.submitted_at)}
                  </span>
                  {submission.updated_at !== submission.submitted_at && (
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Updated: {formatDate(submission.updated_at)}
                    </span>
                  )}
                  {submission.keywords && submission.keywords.length > 0 && (
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Keywords: {submission.keywords.slice(0, 3).join(', ')}
                      {submission.keywords.length > 3 && '...'}
                    </span>
                  )}
                </div>

                {submission.editor_comments && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-primary-50 to-primary-100 border-l-4 border-primary-500 rounded-r">
                    <p className="text-xs text-primary-800">
                      <strong className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                        </svg>
                        Editor Message:
                      </strong> {submission.editor_comments}
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-4 flex-shrink-0">
                <SubmissionStatus status={submission.status} />
              </div>
            </div>

            {submission.co_authors && submission.co_authors.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Co-authors: {submission.co_authors.join(', ')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};