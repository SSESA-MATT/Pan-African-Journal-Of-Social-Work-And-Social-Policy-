'use client';

import React from 'react';

interface ReviewProgressIndicatorProps {
  submissionId: string;
  submissionTitle: string;
  dueDate: string;
  currentProgress: number;
  estimatedTimeRemaining: number; // in minutes
  onSaveProgress?: () => void;
  onExitReview?: () => void;
}

export const ReviewProgressIndicator: React.FC<ReviewProgressIndicatorProps> = ({
  submissionId,
  submissionTitle,
  dueDate,
  currentProgress,
  estimatedTimeRemaining,
  onSaveProgress,
  onExitReview
}) => {
  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getDueDateStatus = () => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { status: 'today', text: 'Due today', color: 'text-orange-600' };
    if (diffDays === 1) return { status: 'tomorrow', text: 'Due tomorrow', color: 'text-orange-600' };
    if (diffDays <= 3) return { status: 'soon', text: `Due in ${diffDays} days`, color: 'text-blue-600' };
    return { status: 'normal', text: `Due in ${diffDays} days`, color: 'text-neutral-600' };
  };

  const dueDateInfo = getDueDateStatus();

  return (
    <div className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Left side - Submission info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-neutral-900 truncate max-w-xs">
                {submissionTitle}
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4 text-sm text-neutral-600">
              <span className={dueDateInfo.color}>
                {dueDateInfo.text}
              </span>
              <span>•</span>
              <span>Est. {formatTimeRemaining(estimatedTimeRemaining)} remaining</span>
            </div>
          </div>

          {/* Center - Progress */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-neutral-700">Progress:</span>
            <div className="w-32 bg-neutral-200 rounded-full h-2">
              <div
                className="bg-accent-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentProgress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-neutral-900 min-w-[3rem]">
              {currentProgress}%
            </span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            {onSaveProgress && (
              <button
                onClick={onSaveProgress}
                className="px-3 py-1.5 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Save Progress
              </button>
            )}
            
            {onExitReview && (
              <button
                onClick={onExitReview}
                className="px-3 py-1.5 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Exit Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};