'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Reviewer {
  id: string;
  email: string;
  name: string;
  role: string;
  currentAssignments: number;
  isActive: boolean;
}

interface Submission {
  id: string;
  title: string;
  author_name: string;
  status: string;
  created_at: string;
}

interface AssignReviewersModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  onAssignmentComplete: () => void;
}

export const AssignReviewersModal: React.FC<AssignReviewersModalProps> = ({
  isOpen,
  onClose,
  submission,
  onAssignmentComplete
}) => {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingReviewers, setLoadingReviewers] = useState(true);

  // Set default due date (14 days from now)
  useEffect(() => {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  // Load available reviewers
  useEffect(() => {
    if (isOpen) {
      loadReviewers();
    }
  }, [isOpen]);

  const loadReviewers = async () => {
    try {
      setLoadingReviewers(true);
      const response = await fetch('/api/admin/reviewers');
      
      if (!response.ok) {
        throw new Error('Failed to load reviewers');
      }

      const data = await response.json();
      setReviewers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviewers');
    } finally {
      setLoadingReviewers(false);
    }
  };

  const handleReviewerToggle = (reviewerId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(reviewerId)
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    );
  };

  const handleAssign = async () => {
    if (selectedReviewers.length === 0) {
      setError('Please select at least one reviewer');
      return;
    }

    if (!dueDate) {
      setError('Please set a due date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/assign-reviewers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          reviewerIds: selectedReviewers,
          dueDate: new Date(dueDate).toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign reviewers');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Close modal after a short delay
      setTimeout(() => {
        onAssignmentComplete();
        onClose();
        setSuccess(false);
        setSelectedReviewers([]);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign reviewers');
    } finally {
      setLoading(false);
    }
  };

  const getReviewerStatusColor = (reviewer: Reviewer) => {
    if (!reviewer.isActive) return 'text-gray-400';
    if (reviewer.currentAssignments >= 3) return 'text-red-600';
    if (reviewer.currentAssignments >= 2) return 'text-orange-600';
    return 'text-green-600';
  };

  const getReviewerStatusIcon = (reviewer: Reviewer) => {
    if (!reviewer.isActive) return <AlertCircle className="w-4 h-4" />;
    if (reviewer.currentAssignments >= 3) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Reviewers</h2>
            <p className="text-sm text-gray-600 mt-1">
              Submission: {submission.title}
            </p>
            <p className="text-xs text-gray-500">
              Author: {submission.author_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <p className="text-green-800">
                  Reviewers assigned successfully! Closing modal...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Due Date */}
          <div className="mb-6">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Review Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Reviewers List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Available Reviewers</h3>
              <p className="text-sm text-gray-600">
                Selected: {selectedReviewers.length}
              </p>
            </div>

            {loadingReviewers ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading reviewers...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewers.map((reviewer) => (
                  <div
                    key={reviewer.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedReviewers.includes(reviewer.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleReviewerToggle(reviewer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedReviewers.includes(reviewer.id)}
                          onChange={() => handleReviewerToggle(reviewer.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{reviewer.name}</p>
                            <p className="text-sm text-gray-600">{reviewer.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500">Role</p>
                          <p className="font-medium capitalize">{reviewer.role}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-gray-500">Current Load</p>
                          <p className="font-medium">{reviewer.currentAssignments}</p>
                        </div>
                        
                        <div className={`flex items-center space-x-1 ${getReviewerStatusColor(reviewer)}`}>
                          {getReviewerStatusIcon(reviewer)}
                          <span className="text-xs">
                            {reviewer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {reviewer.currentAssignments >= 3 && (
                      <div className="mt-2 text-xs text-orange-600">
                        ⚠️ High workload - consider assigning to someone else
                      </div>
                    )}
                    
                    {!reviewer.isActive && (
                      <div className="mt-2 text-xs text-gray-500">
                        ℹ️ Hasn't signed in recently - may not respond quickly
                      </div>
                    )}
                  </div>
                ))}
                
                {reviewers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No reviewers available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedReviewers.length > 0 && (
              <p>
                {selectedReviewers.length} reviewer{selectedReviewers.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleAssign}
              disabled={loading || selectedReviewers.length === 0 || !dueDate}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                  Assigning...
                </div>
              ) : (
                `Assign ${selectedReviewers.length} Reviewer${selectedReviewers.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};