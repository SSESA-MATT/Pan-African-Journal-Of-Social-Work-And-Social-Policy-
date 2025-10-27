'use client';

import React, { useState, useEffect } from 'react';
import { reviewApi } from '../lib/reviewApi';

interface ReviewAssignment {
  id: string;
  submission_id: string;
  submission_title: string;
  author_name: string;
  assigned_at: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  instructions?: string;
  progress_percentage: number;
  estimated_time_remaining: string;
}

export const ReviewerAssignmentTracker: React.FC = () => {
  const [assignments, setAssignments] = useState<ReviewAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<ReviewAssignment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await reviewApi.getAssignedSubmissions();
      if (response.reviews) {
        // Transform and enhance the data
        const enhancedAssignments = response.reviews.map((review: any) => ({
          ...review,
          progress_percentage: calculateProgress(review),
          estimated_time_remaining: calculateTimeRemaining(review),
          status: determineStatus(review)
        }));
        setAssignments(enhancedAssignments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (review: any) => {
    // Check if there's saved progress in localStorage
    const savedProgress = localStorage.getItem(`review_progress_${review.submission_id}`);
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        const totalQuestions = 25; // Approximate total questions in enhanced form
        const completedQuestions = Object.keys(data.responses || {}).length;
        return Math.round((completedQuestions / totalQuestions) * 100);
      } catch (err) {
        return 0;
      }
    }
    return 0;
  };

  const calculateTimeRemaining = (review: any) => {
    const dueDate = new Date(review.due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
  };

  const determineStatus = (review: any) => {
    const dueDate = new Date(review.due_date);
    const now = new Date();
    const progress = calculateProgress(review);
    
    if (dueDate < now) return 'overdue';
    if (progress > 0) return 'in_progress';
    if (review.status === 'completed') return 'completed';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '⏳';
      case 'overdue':
        return '🚨';
      case 'pending':
        return '📋';
      default:
        return '📋';
    }
  };

  const getPriorityLevel = (assignment: ReviewAssignment) => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return { level: 'critical', label: 'Overdue', color: 'text-red-600' };
    if (daysUntilDue <= 2) return { level: 'high', label: 'Due Soon', color: 'text-orange-600' };
    if (daysUntilDue <= 7) return { level: 'medium', label: 'This Week', color: 'text-blue-600' };
    return { level: 'low', label: 'Upcoming', color: 'text-green-600' };
  };

  const openAssignmentDetails = (assignment: ReviewAssignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        <span className="ml-3 text-neutral-600">Loading assignments...</span>
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
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Review Assignments Tracker
          </h2>
          <p className="text-neutral-600 mt-1">Track your review progress and manage deadlines</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-600">Total Assignments</p>
              <p className="text-xl font-bold text-neutral-900">{assignments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-full">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-600">In Progress</p>
              <p className="text-xl font-bold text-neutral-900">
                {assignments.filter(a => a.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-600">Overdue</p>
              <p className="text-xl font-bold text-neutral-900">
                {assignments.filter(a => a.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-600">Completed</p>
              <p className="text-xl font-bold text-neutral-900">
                {assignments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Current Assignments</h3>
        </div>

        {assignments.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-neutral-600">No review assignments at this time</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {assignments
              .sort((a, b) => {
                // Sort by priority: overdue first, then by due date
                if (a.status === 'overdue' && b.status !== 'overdue') return -1;
                if (b.status === 'overdue' && a.status !== 'overdue') return 1;
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
              })
              .map((assignment) => {
                const priority = getPriorityLevel(assignment);
                return (
                  <div key={assignment.id} className="p-6 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-neutral-900 truncate">
                            {assignment.submission_title}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                            {getStatusIcon(assignment.status)}
                            <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`text-xs font-medium ${priority.color}`}>
                            {priority.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-3">
                          <span>by {assignment.author_name}</span>
                          <span>•</span>
                          <span>Assigned {new Date(assignment.assigned_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={assignment.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                            {assignment.estimated_time_remaining}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-neutral-700">Progress</span>
                            <span className="text-xs text-neutral-600">{assignment.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                assignment.progress_percentage > 0 ? 'bg-accent-green' : 'bg-neutral-300'
                              }`}
                              style={{ width: `${assignment.progress_percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {assignment.instructions && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                            <p className="text-xs font-medium text-blue-900 mb-1">Review Instructions:</p>
                            <p className="text-sm text-blue-800">{assignment.instructions}</p>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex-shrink-0 flex flex-col space-y-2">
                        <button
                          onClick={() => openAssignmentDetails(assignment)}
                          className="px-3 py-1.5 text-sm font-medium text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          View Details
                        </button>
                        
                        <button
                          onClick={() => window.location.href = `/reviewer/review/${assignment.submission_id}`}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            assignment.status === 'completed'
                              ? 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
                              : 'bg-accent-green text-white hover:bg-accent-green/80'
                          }`}
                          disabled={assignment.status === 'completed'}
                        >
                          {assignment.progress_percentage > 0 ? 'Continue Review' : 'Start Review'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Assignment Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Assignment Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-neutral-900">{selectedAssignment.submission_title}</h4>
                <p className="text-sm text-neutral-600">by {selectedAssignment.author_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-700">Assigned Date</p>
                  <p className="text-sm text-neutral-600">{new Date(selectedAssignment.assigned_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700">Due Date</p>
                  <p className="text-sm text-neutral-600">{new Date(selectedAssignment.due_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">Progress</p>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-accent-green transition-all duration-300"
                    style={{ width: `${selectedAssignment.progress_percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-neutral-600 mt-1">{selectedAssignment.progress_percentage}% complete</p>
              </div>
              
              {selectedAssignment.instructions && (
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Special Instructions</p>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3">
                    <p className="text-sm text-neutral-700">{selectedAssignment.instructions}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  window.location.href = `/reviewer/review/${selectedAssignment.submission_id}`;
                }}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors"
              >
                {selectedAssignment.progress_percentage > 0 ? 'Continue Review' : 'Start Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};