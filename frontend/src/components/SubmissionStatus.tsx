'use client';

import React from 'react';
import { 
  Submission, 
  SUBMISSION_STATUS_LABELS, 
  SUBMISSION_STATUS_COLORS 
} from '../types/submission';

interface SubmissionStatusProps {
  status: Submission['status'];
  className?: string;
}

export const SubmissionStatus: React.FC<SubmissionStatusProps> = ({ 
  status, 
  className = '' 
}) => {
  const statusLabel = SUBMISSION_STATUS_LABELS[status];
  const statusColor = SUBMISSION_STATUS_COLORS[status];

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} ${className}`}
    >
      {statusLabel}
    </span>
  );
};