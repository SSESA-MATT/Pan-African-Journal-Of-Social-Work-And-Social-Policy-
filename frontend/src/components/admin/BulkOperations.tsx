'use client';

import React, { useState, useEffect } from 'react';
import { submissionApi } from '@/lib/submissionApi';
import { Submission } from '@/types/submission';

export const BulkOperations: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await submissionApi.getAllSubmissions();
      if (response.submissions) {
        setSubmissions(response.submissions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissions.map(s => s.id));
    }
  };

  const handleSelectSubmission = (submissionId: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSubmissions.length === 0) return;

    try {
      setIsProcessing(true);
      setError(null);
      setSuccessMessage(null);

      // Process each selected submission
      const promises = selectedSubmissions.map(async (submissionId) => {
        switch (bulkAction) {
          case 'accept':
            return submissionApi.updateSubmissionStatus(submissionId, { status: 'accepted' });
          case 'reject':
            return submissionApi.updateSubmissionStatus(submissionId, { status: 'rejected' });
          case 'under_review':
            return submissionApi.updateSubmissionStatus(submissionId, { status: 'under_review' });
          case 'revisions_required':
            return submissionApi.updateSubmissionStatus(submissionId, { status: 'revisions_required' });
          default:
            throw new Error('Invalid bulk action');
        }
      });

      await Promise.all(promises);
      
      setSuccessMessage(`Successfully updated ${selectedSubmissions.length} submissions`);
      setSelectedSubmissions([]);
      setBulkAction('');
      await loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action');
    } finally {
      setIsProcessing(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        <span className="ml-3 text-neutral-600">Loading submissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Bulk Operations
          </h2>
          <p className="text-neutral-600 mt-1">Perform actions on multiple submissions at once</p>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-neutral-700">
              {selectedSubmissions.length} of {submissions.length} selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm text-accent-green hover:text-accent-green/80 font-medium"
            >
              {selectedSubmissions.length === submissions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            >
              <option value="">Choose action...</option>
              <option value="accept">Accept</option>
              <option value="reject">Reject</option>
              <option value="under_review">Set Under Review</option>
              <option value="revisions_required">Request Revisions</option>
            </select>
            
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedSubmissions.length === 0 || isProcessing}
              className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Apply Action'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            All Submissions ({submissions.length})
          </h3>
        </div>

        {submissions.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-neutral-600">No submissions found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.includes(submission.id)}
                    onChange={() => handleSelectSubmission(submission.id)}
                    className="mt-1 h-4 w-4 text-accent-green focus:ring-accent-green border-neutral-300 rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-neutral-900 truncate">
                        {submission.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-2">
                      <span>by {(submission as any).author_name || 'Unknown Author'}</span>
                      <span>•</span>
                      <span>Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
                    </div>

                    <p className="text-sm text-neutral-700 line-clamp-2">
                      {submission.abstract}
                    </p>
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