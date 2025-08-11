'use client';

import React, { useState, useEffect } from 'react';
import { reviewApi } from '../lib/reviewApi';
import { submissionApi } from '../lib/submissionApi';
import { RecommendationType, RECOMMENDATION_LABELS } from '../types/review';
import { SubmissionWithAuthor } from '../types/submission';

interface ReviewFormProps {
  submissionId: string;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ submissionId, onSubmitSuccess, onCancel }: ReviewFormProps) {
  const [submission, setSubmission] = useState<SubmissionWithAuthor | null>(null);
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState<RecommendationType>('minor_revisions');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissionDetails();
  }, [submissionId]);

  const loadSubmissionDetails = async () => {
    try {
      setLoading(true);
      const data = await submissionApi.getSubmissionById(submissionId);
      setSubmission(data.submission);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comments.trim()) {
      setError('Please provide review comments');
      return;
    }

    if (comments.trim().length < 50) {
      setError('Review comments must be at least 50 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await reviewApi.createReview({
        submissionId,
        comments: comments.trim(),
        recommendation,
      });

      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        // Default redirect to reviewer dashboard
        window.location.href = '/reviewer/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRecommendationColor = (rec: RecommendationType) => {
    const colors = {
      accept: 'text-green-600',
      minor_revisions: 'text-yellow-600',
      major_revisions: 'text-orange-600',
      reject: 'text-red-600',
    };
    return colors[rec];
  };

  const getRecommendationDescription = (rec: RecommendationType) => {
    const descriptions = {
      accept: 'The manuscript is ready for publication with minimal or no changes.',
      minor_revisions: 'The manuscript requires small changes that can be addressed quickly.',
      major_revisions: 'The manuscript needs significant improvements before it can be considered for publication.',
      reject: 'The manuscript is not suitable for publication in this journal.',
    };
    return descriptions[rec];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submission details...</p>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Submission</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSubmissionDetails}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors mr-2"
          >
            Try Again
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Review Manuscript</h1>
          <p className="mt-2 text-gray-600">
            Please provide your detailed review and recommendation for this submission
          </p>
        </div>

        {/* Submission Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Submission Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-black">{submission.title}</h3>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Author</p>
              <p className="text-gray-600">
                {submission.first_name} {submission.last_name}
              </p>
              <p className="text-sm text-gray-500">{submission.affiliation}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Submitted</p>
              <p className="text-gray-600">{formatDate(submission.submitted_at)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {submission.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Abstract</p>
              <p className="text-gray-600 leading-relaxed">{submission.abstract}</p>
            </div>

            {submission.manuscript_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Manuscript</p>
                <a
                  href={submission.manuscript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  📄 Download Manuscript (PDF)
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recommendation *
            </label>
            <div className="space-y-3">
              {(Object.keys(RECOMMENDATION_LABELS) as RecommendationType[]).map((rec) => (
                <label key={rec} className="flex items-start">
                  <input
                    type="radio"
                    name="recommendation"
                    value={rec}
                    checked={recommendation === rec}
                    onChange={(e) => setRecommendation(e.target.value as RecommendationType)}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className={`font-medium ${getRecommendationColor(rec)}`}>
                      {RECOMMENDATION_LABELS[rec]}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {getRecommendationDescription(rec)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
              Review Comments *
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Please provide detailed, constructive feedback to help the author improve their manuscript.
              Include comments on methodology, analysis, writing quality, and relevance to the journal's scope.
            </p>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your detailed review comments here..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum 50 characters ({comments.length}/50)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-red-400">⚠️</div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || !comments.trim() || comments.trim().length < 50}
              className="px-6 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting Review...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}