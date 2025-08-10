'use client';

import React, { useState, useEffect } from 'react';
import { reviewApi } from '../lib/reviewApi';
import { Review, ReviewSummary as ReviewSummaryType, RECOMMENDATION_LABELS, RECOMMENDATION_COLORS } from '../types/review';

interface ReviewSummaryProps {
  submissionId: string;
}

interface ReviewWithReviewer extends Review {
  reviewer_first_name: string;
  reviewer_last_name: string;
  reviewer_email: string;
}

export default function ReviewSummary({ submissionId }: ReviewSummaryProps) {
  const [reviews, setReviews] = useState<ReviewWithReviewer[]>([]);
  const [summary, setSummary] = useState<ReviewSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [submissionId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getReviewsForSubmission(submissionId);
      setReviews(data.reviews as ReviewWithReviewer[]);
      setSummary(data.summary);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRecommendationIcon = (recommendation: string) => {
    const icons = {
      accept: '✅',
      minor_revisions: '🔄',
      major_revisions: '⚠️',
      reject: '❌',
    };
    return icons[recommendation as keyof typeof icons] || '📝';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reviews</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadReviews}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      {summary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-black mb-4">Review Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{summary.total_reviews}</div>
              <div className="text-sm text-gray-500">Total Reviews</div>
            </div>
            
            {Object.entries(summary.recommendations).map(([recommendation, count]) => (
              <div key={recommendation} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-xl mr-1">{getRecommendationIcon(recommendation)}</span>
                  <div className="text-2xl font-bold text-black">{count}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {RECOMMENDATION_LABELS[recommendation as keyof typeof RECOMMENDATION_LABELS]}
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation Distribution */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Recommendation Distribution</h4>
            {Object.entries(summary.recommendations).map(([recommendation, count]) => {
              const percentage = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;
              return (
                <div key={recommendation} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">
                    {RECOMMENDATION_LABELS[recommendation as keyof typeof RECOMMENDATION_LABELS]}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          recommendation === 'accept' ? 'bg-green-500' :
                          recommendation === 'minor_revisions' ? 'bg-yellow-500' :
                          recommendation === 'major_revisions' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-600 text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-black">Individual Reviews</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500">This submission hasn't received any reviews yet.</p>
            </div>
          ) : (
            reviews.map((review, index) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {review.reviewer_first_name[0]}{review.reviewer_last_name[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-black">
                        {review.reviewer_first_name} {review.reviewer_last_name}
                      </p>
                      <p className="text-xs text-gray-500">{review.reviewer_email}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      RECOMMENDATION_COLORS[review.recommendation]
                    }`}>
                      {getRecommendationIcon(review.recommendation)} {RECOMMENDATION_LABELS[review.recommendation]}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(review.submitted_at)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Review Comments</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {review.comments}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}