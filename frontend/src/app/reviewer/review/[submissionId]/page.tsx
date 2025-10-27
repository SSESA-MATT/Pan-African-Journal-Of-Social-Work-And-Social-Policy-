'use client';

import React, { useState, useEffect } from 'react';
import { SubmissionDetails } from '../../../../components/SubmissionDetails';
import { EnhancedReviewForm } from '../../../../components/EnhancedReviewForm';
import { ReviewGuidelines } from '../../../../components/ReviewGuidelines';
import { ProtectedRoute } from '../../../../components/ProtectedRoute';
import { submissionApi } from '../../../../lib/submissionApi';

interface ReviewPageProps {
  params: {
    submissionId: string;
  };
}

type ReviewStep = 'overview' | 'guidelines' | 'review' | 'complete';

export default function ReviewPage({ params }: ReviewPageProps) {
  const [currentStep, setCurrentStep] = useState<ReviewStep>('overview');
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmission();
  }, [params.submissionId]);

  const loadSubmission = async () => {
    try {
      setIsLoading(true);
      const response = await submissionApi.getSubmissionDetails(params.submissionId);
      if (response.submission) {
        setSubmission(response.submission);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepChange = (step: ReviewStep) => {
    setCurrentStep(step);
  };

  const handleReviewComplete = () => {
    setCurrentStep('complete');
  };

  const getStepStatus = (step: ReviewStep) => {
    const steps: ReviewStep[] = ['overview', 'guidelines', 'review', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="reviewer">
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading submission...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="reviewer">
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error Loading Submission</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <button
              onClick={loadSubmission}
              className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="reviewer">
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Header */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm mb-6">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">Manuscript Review Process</h1>
              
              {/* Progress Steps */}
              <nav aria-label="Progress">
                <ol className="flex items-center">
                  {[
                    { id: 'overview', name: 'Review Submission', icon: '📄' },
                    { id: 'guidelines', name: 'Review Guidelines', icon: '📋' },
                    { id: 'review', name: 'Conduct Review', icon: '✍️' },
                    { id: 'complete', name: 'Complete', icon: '✅' }
                  ].map((step, stepIdx) => {
                    const status = getStepStatus(step.id as ReviewStep);
                    return (
                      <li key={step.id} className={`relative ${stepIdx !== 3 ? 'pr-8 sm:pr-20' : ''}`}>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          {stepIdx !== 3 && (
                            <div className={`h-0.5 w-full ${status === 'completed' ? 'bg-accent-green' : 'bg-neutral-200'}`} />
                          )}
                        </div>
                        <button
                          onClick={() => handleStepChange(step.id as ReviewStep)}
                          className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            status === 'completed'
                              ? 'bg-accent-green border-accent-green text-white'
                              : status === 'current'
                              ? 'border-accent-green bg-white text-accent-green'
                              : 'border-neutral-300 bg-white text-neutral-500'
                          } hover:border-accent-green transition-colors`}
                        >
                          <span className="text-sm">{step.icon}</span>
                        </button>
                        <span className={`absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                          status === 'current' ? 'text-accent-green' : 'text-neutral-500'
                        }`}>
                          {step.name}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 'overview' && (
              <div className="space-y-6">
                <SubmissionDetails 
                  submissionId={params.submissionId}
                  showReviewActions={false}
                />
                <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">Ready to Begin Review?</h3>
                      <p className="text-neutral-600 mt-1">
                        Please review the submission details above, then proceed to the review guidelines.
                      </p>
                    </div>
                    <button
                      onClick={() => handleStepChange('guidelines')}
                      className="px-6 py-3 bg-accent-green text-white font-semibold rounded-lg hover:bg-accent-green/80 transition-colors"
                    >
                      Continue to Guidelines
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'guidelines' && (
              <ReviewGuidelines 
                onContinue={() => handleStepChange('review')}
                onBack={() => handleStepChange('overview')}
              />
            )}

            {currentStep === 'review' && (
              <EnhancedReviewForm 
                submissionId={params.submissionId}
                submission={submission}
                onComplete={handleReviewComplete}
                onBack={() => handleStepChange('guidelines')}
              />
            )}

            {currentStep === 'complete' && (
              <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Review Submitted Successfully!</h2>
                <p className="text-neutral-600 mb-6">
                  Thank you for your thorough review. The editorial team has been notified and will process your feedback.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.location.href = '/reviewer/dashboard'}
                    className="px-6 py-3 bg-accent-green text-white font-semibold rounded-lg hover:bg-accent-green/80 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => handleStepChange('overview')}
                    className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Review Another Submission
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}