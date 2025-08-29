'use client';

import React, { useState, useEffect } from 'react';
import { Manuscript } from '../types/manuscript';

interface ManuscriptWorkflowProps {
  manuscript: Manuscript;
  userRole: 'author' | 'reviewer' | 'editor' | 'admin';
  onStatusUpdate?: (manuscriptId: string, newStatus: string) => void;
  onCommentAdd?: (manuscriptId: string, comment: string) => void;
}

interface WorkflowStep {
  id: string;
  title: string;
  status: 'completed' | 'active' | 'pending' | 'skipped';
  date?: string;
  description?: string;
}

const ManuscriptWorkflow: React.FC<ManuscriptWorkflowProps> = ({
  manuscript,
  userRole,
  onStatusUpdate,
  onCommentAdd
}) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [newComment, setNewComment] = useState('');

  // Define the complete manuscript workflow
  const getWorkflowSteps = (manuscript: Manuscript): WorkflowStep[] => {
    const steps: WorkflowStep[] = [
      {
        id: 'submission',
        title: 'Manuscript Submitted',
        status: 'completed',
        date: manuscript.submission_date,
        description: 'Author submitted the manuscript for review'
      },
      {
        id: 'initial_review',
        title: 'Initial Editorial Review',
        status: manuscript.status === 'submitted' ? 'active' : 
               ['under-review', 'awaiting-revision', 'accepted', 'published'].includes(manuscript.status) ? 'completed' : 'pending',
        description: 'Editor performs initial quality and scope assessment'
      },
      {
        id: 'peer_review_assignment',
        title: 'Peer Review Assignment',
        status: manuscript.assigned_reviewers && manuscript.assigned_reviewers.length > 0 ? 'completed' : 
               manuscript.status === 'under-review' ? 'active' : 'pending',
        description: 'Editor assigns qualified peer reviewers'
      },
      {
        id: 'peer_review',
        title: 'Peer Review Process',
        status: manuscript.status === 'under-review' ? 'active' : 
               ['awaiting-revision', 'accepted', 'published'].includes(manuscript.status) ? 'completed' : 'pending',
        description: 'Peer reviewers evaluate the manuscript'
      },
      {
        id: 'review_decision',
        title: 'Editorial Decision',
        status: manuscript.status === 'awaiting-revision' ? 'completed' : 
               manuscript.status === 'rejected' ? 'completed' :
               manuscript.status === 'accepted' ? 'completed' : 'pending',
        description: 'Editor makes decision based on reviews'
      }
    ];

    // Add conditional steps based on status
    if (manuscript.status === 'awaiting-revision') {
      steps.push({
        id: 'revision_submission',
        title: 'Author Revisions',
        status: 'active',
        description: 'Author addresses reviewer feedback and resubmits'
      });
    }

    if (['accepted', 'published'].includes(manuscript.status)) {
      steps.push({
        id: 'copyediting',
        title: 'Copy Editing & Formatting',
        status: manuscript.status === 'published' ? 'completed' : 'active',
        description: 'Manuscript undergoes professional editing'
      });

      steps.push({
        id: 'publication',
        title: 'Publication',
        status: manuscript.status === 'published' ? 'completed' : 'pending',
        description: 'Manuscript is published in the journal'
      });
    }

    return steps;
  };

  useEffect(() => {
    setWorkflowSteps(getWorkflowSteps(manuscript));
  }, [manuscript]);

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'active':
        return (
          <svg className="w-5 h-5 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'awaiting-revision': return 'bg-orange-100 text-orange-800';
      case 'revised-submitted': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(manuscript.id, newStatus);
    }
  };

  const handleCommentSubmit = () => {
    if (newComment.trim() && onCommentAdd) {
      onCommentAdd(manuscript.id, newComment.trim());
      setNewComment('');
    }
  };

  const canModifyStatus = userRole === 'editor' || userRole === 'admin';
  const canAddComment = ['editor', 'admin', 'reviewer'].includes(userRole);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Manuscript Workflow</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(manuscript.status)}`}>
            {manuscript.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        <p className="text-gray-600 mt-1">Track the progress of manuscript through review and publication process</p>
      </div>

      {/* Workflow Timeline */}
      <div className="space-y-6">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="relative flex items-start">
            {/* Timeline Line */}
            {index < workflowSteps.length - 1 && (
              <div 
                className={`absolute left-2.5 top-8 w-0.5 h-12 ${
                  step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Step Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
              step.status === 'completed' 
                ? 'bg-green-100 border-green-300' 
                : step.status === 'active'
                ? 'bg-blue-100 border-blue-300'
                : 'bg-gray-100 border-gray-300'
            }`}>
              {getStepIcon(step.status)}
            </div>

            {/* Step Content */}
            <div className="ml-4 flex-grow">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${
                  step.status === 'completed' ? 'text-green-900' : 
                  step.status === 'active' ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {step.title}
                </h4>
                {step.date && (
                  <span className="text-sm text-gray-500">
                    {new Date(step.date).toLocaleDateString()}
                  </span>
                )}
              </div>
              {step.description && (
                <p className="text-gray-600 text-sm mt-1">{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Editorial Actions */}
      {canModifyStatus && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Editorial Actions</h4>
          <div className="flex flex-wrap gap-2">
            {manuscript.status === 'submitted' && (
              <>
                <button
                  onClick={() => handleStatusChange('under-review')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send for Review
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject Manuscript
                </button>
              </>
            )}
            
            {manuscript.status === 'under-review' && (
              <>
                <button
                  onClick={() => handleStatusChange('awaiting-revision')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Request Revisions
                </button>
                <button
                  onClick={() => handleStatusChange('accepted')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Accept Manuscript
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject Manuscript
                </button>
              </>
            )}

            {manuscript.status === 'accepted' && (
              <button
                onClick={() => handleStatusChange('published')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Mark as Published
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {canAddComment && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Editorial Comments</h4>
          
          {/* Existing Comments */}
          {manuscript.editor_comments && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900 mb-1">Editorial Comment</p>
                  <p className="text-gray-700">{manuscript.editor_comments}</p>
                </div>
              </div>
            </div>
          )}

          {/* Add New Comment */}
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add editorial comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Comment
            </button>
          </div>
        </div>
      )}

      {/* Manuscript Details */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Manuscript Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900">Submission Date:</span>
            <span className="ml-2 text-gray-600">
              {new Date(manuscript.submission_date).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Last Updated:</span>
            <span className="ml-2 text-gray-600">
              {new Date(manuscript.last_updated).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Word Count:</span>
            <span className="ml-2 text-gray-600">{manuscript.word_count || 'Not specified'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Assigned Reviewers:</span>
            <span className="ml-2 text-gray-600">
              {manuscript.assigned_reviewers?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManuscriptWorkflow;
