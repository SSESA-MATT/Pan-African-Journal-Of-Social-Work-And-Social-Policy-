'use client';

import React, { useState, useEffect } from 'react';
import { reviewApi } from '../lib/reviewApi';
import { submissionApi } from '../lib/submissionApi';
import { Reviewer } from '../types/review';
import { SubmissionWithAuthor } from '../types/submission';

interface ReviewerAssignmentProps {
  submissionId: string;
  onAssignmentSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewerAssignment({ 
  submissionId, 
  onAssignmentSuccess, 
  onCancel 
}: ReviewerAssignmentProps) {
  const [submission, setSubmission] = useState<SubmissionWithAuthor | null>(null);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [submissionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionData, reviewersData] = await Promise.all([
        submissionApi.getSubmissionById(submissionId),
        reviewApi.getAvailableReviewers(),
      ]);
      
      setSubmission(submissionData.submission);
      setReviewers(reviewersData.reviewers);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReviewerId) {
      setError('Please select a reviewer');
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      await reviewApi.assignReviewer({
        submissionId,
        reviewerId: selectedReviewerId,
      });

      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign reviewer');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-600">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-black">Assign Reviewer</h3>
        <p className="mt-1 text-sm text-gray-600">
          Select a reviewer for this manuscript submission
        </p>
      </div>

      <div className="p-6">
        {/* Submission Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-black mb-2">Submission Details</h4>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Title:</span> {submission.title}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Author:</span> {submission.first_name} {submission.last_name}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Status:</span> 
            <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {submission.status.replace('_', ' ').toUpperCase()}
            </span>
          </p>
        </div>

        {/* Assignment Form */}
        <form onSubmit={handleAssign}>
          <div className="mb-6">
            <label htmlFor="reviewer" className="block text-sm font-medium text-gray-700 mb-3">
              Select Reviewer *
            </label>
            
            {reviewers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">👥</div>
                <p className="text-gray-500">No reviewers available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                {reviewers.map((reviewer) => (
                  <label
                    key={reviewer.id}
                    className={`flex items-start p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedReviewerId === reviewer.id ? 'bg-red-50 border-red-200' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewer"
                      value={reviewer.id}
                      checked={selectedReviewerId === reviewer.id}
                      onChange={(e) => setSelectedReviewerId(e.target.value)}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-black">
                          {reviewer.first_name} {reviewer.last_name}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          reviewer.role === 'reviewer' 
                            ? 'bg-blue-100 text-blue-800'
                            : reviewer.role === 'editor'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {reviewer.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{reviewer.email}</p>
                      <p className="text-xs text-gray-500">{reviewer.affiliation}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="text-red-400">⚠️</div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                disabled={assigning}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={assigning || !selectedReviewerId || reviewers.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {assigning ? 'Assigning...' : 'Assign Reviewer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}