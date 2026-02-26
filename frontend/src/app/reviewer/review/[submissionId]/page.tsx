'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EnhancedReviewForm } from '../../../../components/EnhancedReviewForm';
import { ReviewGuidelines } from '../../../../components/ReviewGuidelines';
import { ProtectedRoute } from '../../../../components/ProtectedRoute';
import { reviewsApi } from '../../../../lib/api-client';

type ReviewStep = 'overview' | 'guidelines' | 'review' | 'complete';

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.submissionId as string; // URL param is still submissionId for compat
  const [currentStep, setCurrentStep] = useState<ReviewStep>('overview');
  const [review, setReview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (reviewId) loadReview(); }, [reviewId]);

  const loadReview = async () => {
    try {
      setIsLoading(true);
      const res = await reviewsApi.getById(reviewId);
      setReview(res.review);
    } catch (err: any) {
      setError(err.message || 'Failed to load review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewComplete = () => setCurrentStep('complete');

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['reviewer', 'editor', 'admin']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-green mx-auto" />
            <p className="mt-4 text-gray-600">Loading review…</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !review) {
    return (
      <ProtectedRoute allowedRoles={['reviewer', 'editor', 'admin']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-red-500 text-4xl mb-4">⚠️</p>
            <h2 className="text-xl font-semibold mb-2">Error Loading Review</h2>
            <p className="text-gray-600 mb-4">{error || 'Review not found'}</p>
            <button onClick={loadReview} className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80">
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const ms = review.manuscript || {};

  return (
    <ProtectedRoute allowedRoles={['reviewer', 'editor', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Steps indicator */}
          <div className="mb-8 flex items-center gap-4 text-sm">
            {(['overview', 'guidelines', 'review', 'complete'] as ReviewStep[]).map((step, i) => (
              <button key={step} onClick={() => setCurrentStep(step)}
                className={`capitalize ${currentStep === step ? 'text-accent-green font-semibold' : 'text-gray-400'}`}>
                {i + 1}. {step}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {currentStep === 'overview' && (
            <div className="bg-white shadow rounded-lg p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{ms.title || 'Untitled'}</h1>
              <p className="text-gray-600 mb-6">{ms.abstract || 'No abstract available.'}</p>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div><span className="text-gray-500">Category:</span> {ms.category || '—'}</div>
                <div><span className="text-gray-500">Status:</span> {review.status}</div>
                <div><span className="text-gray-500">Due Date:</span> {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : '—'}</div>
                <div><span className="text-gray-500">Round:</span> {review.round || 1}</div>
              </div>
              {ms.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {ms.keywords.map((k: string) => (
                    <span key={k} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{k}</span>
                  ))}
                </div>
              )}
              <button onClick={() => setCurrentStep('guidelines')} className="px-6 py-3 bg-accent-green text-white rounded-md hover:bg-accent-green/80 font-medium">
                Next: Review Guidelines →
              </button>
            </div>
          )}

          {/* GUIDELINES */}
          {currentStep === 'guidelines' && (
            <div>
              <ReviewGuidelines
                onContinue={() => setCurrentStep('review')}
                onBack={() => setCurrentStep('overview')}
              />
              <div className="mt-6 flex justify-between">
                <button onClick={() => setCurrentStep('overview')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  ← Back
                </button>
                <button onClick={() => setCurrentStep('review')} className="px-6 py-3 bg-accent-green text-white rounded-md hover:bg-accent-green/80 font-medium">
                  Begin Review →
                </button>
              </div>
            </div>
          )}

          {/* REVIEW FORM */}
          {currentStep === 'review' && (
            <EnhancedReviewForm
              submissionId={reviewId}
              submission={ms}
              onComplete={handleReviewComplete}
              onBack={() => setCurrentStep('guidelines')}
            />
          )}

          {/* COMPLETE */}
          {currentStep === 'complete' && (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
              <p className="text-gray-600 mb-6">Thank you for your review. The editor has been notified.</p>
              <button onClick={() => router.push('/reviewer')} className="px-6 py-3 bg-accent-green text-white rounded-md hover:bg-accent-green/80 font-medium">
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
