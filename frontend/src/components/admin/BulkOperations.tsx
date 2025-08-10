'use client';

import React, { useState, useEffect } from 'react';
import { submissionApi } from '@/lib/submissionApi';
import { Submission } from '@/types/submission';

interface BulkAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: (selectedIds: string[]) => Promise<void>;
}

export const BulkOperations: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);

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

  const handleBulkStatusUpdate = async (status: 'submitted' | 'under_review' | 'revisions_required' | 'accepted' | 'rejected') => {
    try {
      setIsProcessing(true);
      setProcessingAction(`update-status-${status}`);

      // This would be implemented in the backend API
      for (const submissionId of selectedSubmissions) {
        await submissionApi.updateSubmissionStatus(submissionId, { status });
      }

      // Refresh submissions
      await loadSubmissions();
      setSelectedSubmissions([]);
      setShowConfirmModal(false);
      setPendingAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submissions');
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsProcessing(true);
      setProcessingAction('delete');

      // This would be implemented in the backend API
      for (const submissionId of selectedSubmissions) {
        await submissionApi.deleteSubmission(submissionId);
      }

      // Refresh submissions
      await loadSubmissions();
      setSelectedSubmissions([]);
      setShowConfirmModal(false);
      setPendingAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submissions');
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleBulkExport = async () => {
    try {
      setIsProcessing(true);
      setProcessingAction('export');

      // Create CSV content
      const selectedSubmissionData = submissions.filter(sub => selectedSubmissions.includes(sub.id));
      const csvContent = [
        ['Title', 'Author', 'Status', 'Submitted Date', 'Keywords'].join(','),
        ...selectedSubmissionData.map(sub => [
          `"${sub.title}"`,
          `"${(sub as any).author_name || 'Unknown'}"`,
          sub.status,
          new Date(sub.submitted_at).toLocaleDateString(),
          `"${sub.keywords?.join('; ') || ''}"`
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSelectedSubmissions([]);
      setShowConfirmModal(false);
      setPendingAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export submissions');
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'accept',
      name: 'Accept Selected',
      description: 'Mark selected submissions as accepted',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'bg-accent-green text-white hover:bg-accent-green/80',
      action: () => handleBulkStatusUpdate('accepted')
    },
    {
      id: 'reject',
      name: 'Reject Selected',
      description: 'Mark selected submissions as rejected',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      color: 'bg-accent-red text-white hover:bg-accent-red/80',
      action: () => handleBulkStatusUpdate('rejected')
    },
    {
      id: 'under-review',
      name: 'Set Under Review',
      description: 'Mark selected submissions as under review',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-blue-500 text-white hover:bg-blue-600',
      action: () => handleBulkStatusUpdate('under_review')
    },
    {
      id: 'revisions',
      name: 'Request Revisions',
      description: 'Mark selected submissions as requiring revisions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500 text-white hover:bg-yellow-600',
      action: () => handleBulkStatusUpdate('revisions_required')
    },
    {
      id: 'export',
      name: 'Export Selected',
      description: 'Export selected submissions to CSV',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-neutral-600 text-white hover:bg-neutral-700',
      action: handleBulkExport
    },
    {
      id: 'delete',
      name: 'Delete Selected',
      description: 'Permanently delete selected submissions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      color: 'bg-red-600 text-white hover:bg-red-700',
      action: handleBulkDelete
    }
  ];

  const handleSelectAll = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissions.map(sub => sub.id));
    }
  };

  const handleSelectSubmission = (submissionId: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const executeBulkAction = (action: BulkAction) => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const confirmBulkAction = async () => {
    if (pendingAction) {
      await pendingAction.action(selectedSubmissions);
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

      {/* Selection Summary */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-accent-green focus:ring-accent-green border-neutral-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-neutral-700">
                Select All ({submissions.length})
              </label>
            </div>
            <div className="text-sm text-neutral-600">
              {selectedSubmissions.length} of {submissions.length} submissions selected
            </div>
          </div>
          
          {selectedSubmissions.length > 0 && (
            <div className="text-sm font-medium text-accent-green">
              {selectedSubmissions.length} submission{selectedSubmissions.length !== 1 ? 's' : ''} ready for bulk operations
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Available Actions</h3>
            <p className="text-sm text-neutral-600 mt-1">
              Choose an action to perform on {selectedSubmissions.length} selected submission{selectedSubmissions.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bulkActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => executeBulkAction(action)}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-solid transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isProcessing && processingAction === action.id
                      ? 'border-solid bg-neutral-100'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className={`p-3 rounded-full ${action.color.split(' ')[0]}/10`}>
                      <div className={`${action.color.split(' ')[1]}`}>
                        {action.icon}
                      </div>
                    </div>
                  </div>
                  <h4 className="font-medium text-neutral-900 mb-1">{action.name}</h4>
                  <p className="text-sm text-neutral-600">{action.description}</p>
                  
                  {isProcessing && processingAction === action.id && (
                    <div className="mt-3 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-green"></div>
                      <span className="ml-2 text-sm text-neutral-600">Processing...</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
              <div key={submission.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission.id)}
                      onChange={() => handleSelectSubmission(submission.id)}
                      className="h-4 w-4 text-accent-green focus:ring-accent-green border-neutral-300 rounded"
                    />
                  </div>
                  
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

                    {submission.keywords && submission.keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
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
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Confirm Bulk Action
            </h3>
            
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-full ${pendingAction.color.split(' ')[0]}/10`}>
                  <div className={`${pendingAction.color.split(' ')[1]}`}>
                    {pendingAction.icon}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">{pendingAction.name}</h4>
                  <p className="text-sm text-neutral-600">{pendingAction.description}</p>
                </div>
              </div>
              
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <p className="text-sm text-neutral-700">
                  This action will affect <strong>{selectedSubmissions.length}</strong> submission{selectedSubmissions.length !== 1 ? 's' : ''}.
                </p>
                {pendingAction.id === 'delete' && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    ⚠️ This action cannot be undone.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingAction(null);
                }}
                disabled={isProcessing}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkAction}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${pendingAction.color}`}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Confirm ${pendingAction.name}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};