'use client';

import React from 'react';
import { SubmissionDetails } from '../../../../components/SubmissionDetails';

interface SubmissionPreviewPageProps {
  params: {
    submissionId: string;
  };
}

export default function SubmissionPreviewPage({ params }: SubmissionPreviewPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.close()}
                className="flex items-center text-accent-green hover:text-accent-green/80 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Preview
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-800 font-medium">
                📖 Submission Preview Mode
              </p>
            </div>
          </div>
        </div>
        
        <SubmissionDetails submissionId={params.submissionId} />
      </div>
    </div>
  );
}