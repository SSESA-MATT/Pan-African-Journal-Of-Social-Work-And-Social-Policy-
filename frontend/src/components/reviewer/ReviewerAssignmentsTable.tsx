'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  FileText,
  User,
  Play,
  CheckSquare
} from 'lucide-react';

interface ReviewerAssignment {
  id: string;
  submission_id: string;
  assigned_at: string;
  due_date: string;
  status: string;
  submission: {
    id: string;
    title: string;
    abstract: string;
    author_name: string;
    author_email: string;
    status: string;
    created_at: string;
    manuscript_type: string;
    word_count: number;
  };
  is_overdue: boolean;
  days_until_due: number | null;
  has_review: boolean;
  review_status: string | null;
  can_review: boolean;
}

interface ReviewerAssignmentsTableProps {
  className?: string;
  onStartReview?: (assignment: ReviewerAssignment) => void;
}

export const ReviewerAssignmentsTable: React.FC<ReviewerAssignmentsTableProps> = ({
  className = '',
  onStartReview
}) => {
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/reviewer/assignments');
      
      if (!response.ok) {
        throw new Error('Failed to load assignments');
      }

      const data = await response.json();
      setAssignments(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: string) => {
    try {
      const response = await fetch('/api/reviewer/assignments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment status');
      }

      // Refresh assignments
      loadAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIndicator = (assignment: ReviewerAssignment) => {
    if (assignment.is_overdue) {
      return (
        <div className="flex items-center text-red-600">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span className="text-xs font-medium">Overdue</span>
        </div>
      );
    }
    
    if (assignment.days_until_due !== null && assignment.days_until_due <= 3) {
      return (
        <div className="flex items-center text-orange-600">
          <Clock className="w-4 h-4 mr-1" />
          <span className="text-xs font-medium">
            {assignment.days_until_due <= 0 ? 'Due today' : `${assignment.days_until_due} days left`}
          </span>
        </div>
      );
    }

    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAssignments = assignments.filter(assignment => {
    switch (filter) {
      case 'pending':
        return assignment.status === 'assigned';
      case 'in_progress':
        return assignment.status === 'in_progress';
      case 'completed':
        return assignment.status === 'completed';
      default:
        return true;
    }
  });

  const getFilterCounts = () => {
    return {
      all: assignments.length,
      pending: assignments.filter(a => a.status === 'assigned').length,
      in_progress: assignments.filter(a => a.status === 'in_progress').length,
      completed: assignments.filter(a => a.status === 'completed').length
    };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Review Assignments</h2>
          <div className="text-sm text-gray-600">
            {assignments.length} total assignments
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'in_progress', label: 'In Progress', count: counts.in_progress },
            { key: 'completed', label: 'Completed', count: counts.completed }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="text-blue-800 font-medium">No assignments available</p>
                <p className="text-blue-600 text-sm">You haven't been assigned any manuscripts to review yet. New assignments will appear here when available.</p>
              </div>
            </div>
            <button
              onClick={loadAssignments}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="divide-y divide-gray-200">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Title and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {assignment.submission.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                        {assignment.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {assignment.submission.manuscript_type?.replace('_', ' ')}
                      </span>
                      {assignment.submission.word_count && (
                        <span className="text-xs text-gray-500">
                          {assignment.submission.word_count.toLocaleString()} words
                        </span>
                      )}
                    </div>
                  </div>
                  {getUrgencyIndicator(assignment)}
                </div>

                {/* Author and Submission Info */}
                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{assignment.submission.author_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Submitted {formatDate(assignment.submission.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Due {formatDate(assignment.due_date)}</span>
                  </div>
                </div>

                {/* Abstract Preview */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {assignment.submission.abstract}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.open(`/manuscripts/${assignment.submission_id}`, '_blank')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Submission
                  </button>

                  {assignment.can_review && (
                    <>
                      {assignment.status === 'assigned' && (
                        <button
                          onClick={() => updateAssignmentStatus(assignment.id, 'in_progress')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Review
                        </button>
                      )}

                      {assignment.status === 'in_progress' && (
                        <button
                          onClick={() => onStartReview?.(assignment)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Continue Review
                        </button>
                      )}
                    </>
                  )}

                  {assignment.has_review && (
                    <div className="inline-flex items-center px-3 py-2 text-sm text-green-700 bg-green-50 rounded-md">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Review Submitted
                    </div>
                  )}

                  {assignment.status === 'assigned' && (
                    <button
                      onClick={() => updateAssignmentStatus(assignment.id, 'declined')}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Decline
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No assignments yet' : `No ${filter.replace('_', ' ')} assignments`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'You haven\'t been assigned any manuscripts to review yet.'
                : `You don't have any ${filter.replace('_', ' ')} assignments at the moment.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};