'use client';

import React, { useState, useEffect } from 'react';
import { submissionApi } from '@/lib/submissionApi';
import { Submission } from '@/types/submission';

type SubmissionStatus = 'submitted' | 'under_review' | 'revisions_required' | 'accepted' | 'rejected';

export const SubmissionStatusManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<SubmissionStatus>('submitted');
  const [editorComments, setEditorComments] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, selectedStatus, searchTerm]);

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

  const filterSubmissions = () => {
    let filtered = submissions;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((sub as any).author_name && (sub as any).author_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubmission) return;

    try {
      setUpdatingStatus(selectedSubmission.id);
      
      const response = await submissionApi.updateSubmissionStatus(selectedSubmission.id, {
        status: newStatus,
        editor_comments: editorComments
      });

      if (response.message) {
        // Update the submission in the list
        setSubmissions(prev => prev.map(sub => 
          sub.id === selectedSubmission.id 
            ? { ...sub, status: newStatus, editor_comments: editorComments }
            : sub
        ));
        
        setStatusUpdateModal(false);
        setSelectedSubmission(null);
        setEditorComments('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openStatusModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setNewStatus(submission.status);
    setEditorComments(submission.editor_comments || '');
    setStatusUpdateModal(true);
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
        <span className="ml-3 text-neutral-600">Loading submissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-accent-red/5 to-white">
          <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Submission Status Management
          </h2>
          <p className="text-neutral-600 mt-1">Update submission statuses and manage the review process</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search Submissions</label>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as SubmissionStatus | 'all')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="revisions_required">Revisions Required</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Submissions List */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Submissions ({filteredSubmissions.length})
          </h3>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-neutral-600">No submissions found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-neutral-900 truncate">
                        {submission.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-3">
                      <span>by {(submission as any).author_name || 'Unknown Author'}</span>
                      <span>•</span>
                      <span>Submitted {new Date(submission.submitted_at).toLocaleDateString()}</span>
                      {submission.updated_at && submission.updated_at !== submission.submitted_at && (
                        <>
                          <span>•</span>
                          <span>Updated {new Date(submission.updated_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>

                    <p className="text-sm text-neutral-700 line-clamp-2 mb-3">
                      {submission.abstract}
                    </p>

                    {submission.editor_comments && (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 mb-3">
                        <p className="text-xs font-medium text-neutral-600 mb-1">Editor Comments:</p>
                        <p className="text-sm text-neutral-700">{submission.editor_comments}</p>
                      </div>
                    )}

                    {submission.keywords && submission.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {submission.keywords.slice(0, 5).map((keyword, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                            {keyword}
                          </span>
                        ))}
                        {submission.keywords.length > 5 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                            +{submission.keywords.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex-shrink-0 flex flex-col space-y-2">
                    <button
                      onClick={() => openStatusModal(submission)}
                      disabled={updatingStatus === submission.id}
                      className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {updatingStatus === submission.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        'Update Status'
                      )}
                    </button>

                    {submission.manuscript_url && (
                      <a
                        href={submission.manuscript_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors text-sm font-medium text-center"
                      >
                        View Manuscript
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusUpdateModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Update Submission Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Submission
                </label>
                <p className="text-sm text-neutral-600 bg-neutral-50 p-2 rounded border">
                  {selectedSubmission.title}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as SubmissionStatus)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="revisions_required">Revisions Required</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Editor Comments (Optional)
                </label>
                <textarea
                  value={editorComments}
                  onChange={(e) => setEditorComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  placeholder="Add comments for the author..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setStatusUpdateModal(false);
                  setSelectedSubmission(null);
                  setEditorComments('');
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus === selectedSubmission.id}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updatingStatus === selectedSubmission.id ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};