'use client';

import React, { useState, useEffect } from 'react';
import { submissionApi } from '@/lib/submissionApi';
import { publicationApi, Volume, Issue } from '@/lib/publicationApi';
import { Submission } from '@/types/submission';

export const ArticlePublicationWorkflow: React.FC = () => {
  const [acceptedSubmissions, setAcceptedSubmissions] = useState<Submission[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedVolumeId, setSelectedVolumeId] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [publishDate, setPublishDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load accepted submissions
      const acceptedResponse = await publicationApi.getAcceptedSubmissions();
      if (acceptedResponse.submissions) {
        setAcceptedSubmissions(acceptedResponse.submissions);
      }

      // Load published articles
      const articlesResponse = await publicationApi.getPublishedArticles();
      if (articlesResponse.articles) {
        setPublishedArticles(articlesResponse.articles);
      }

      // Load volumes and issues
      const volumesResponse = await publicationApi.getVolumes();
      if (volumesResponse.volumes) {
        setVolumes(volumesResponse.volumes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = async (volumeId: string) => {
    setSelectedVolumeId(volumeId);
    setSelectedIssueId('');
    
    if (volumeId) {
      try {
        const response = await publicationApi.getIssuesForVolume(volumeId);
        setIssues(response.issues);
      } catch (err) {
        console.error('Failed to load issues:', err);
        setIssues([]);
      }
    } else {
      setIssues([]);
    }
  };

  const openPublishModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setSelectedVolumeId('');
    setSelectedIssueId('');
    setPublishDate(new Date().toISOString().split('T')[0]);
    setShowPublishModal(true);
  };

  const handlePublishArticle = async () => {
    if (!selectedSubmission || !selectedVolumeId || !selectedIssueId) return;

    try {
      setIsPublishing(selectedSubmission.id);
      setError(null);

      await publicationApi.publishArticle({
        submission_id: selectedSubmission.id,
        volume_id: selectedVolumeId,
        issue_id: selectedIssueId,
        published_at: publishDate ? new Date(publishDate).toISOString() : undefined
      });

      setShowPublishModal(false);
      setSelectedSubmission(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish article');
    } finally {
      setIsPublishing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        <span className="ml-3 text-neutral-600">Loading publication workflow...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-accent-green/5 to-white">
          <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Article Publication Workflow
          </h2>
          <p className="text-neutral-600 mt-1">Manage the publication of accepted articles</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-accent-green/10 rounded-full">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Ready to Publish</p>
              <p className="text-2xl font-bold text-neutral-900">{acceptedSubmissions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Published Articles</p>
              <p className="text-2xl font-bold text-neutral-900">{publishedArticles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Accepted Submissions Ready for Publication */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Ready for Publication ({acceptedSubmissions.length})
          </h3>
        </div>

        {acceptedSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-neutral-600">No accepted submissions ready for publication</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {acceptedSubmissions.map((submission) => (
              <div key={submission.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-neutral-900 mb-2">
                      {submission.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-3">
                      <span>by {(submission as any).author_name || 'Unknown Author'}</span>
                      <span>•</span>
                      <span>Accepted {new Date(submission.updated_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-neutral-700 line-clamp-2 mb-3">
                      {submission.abstract}
                    </p>
                    {submission.keywords && submission.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {submission.keywords.slice(0, 5).map((keyword, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex-shrink-0 flex flex-col space-y-2">
                    <button
                      onClick={() => openPublishModal(submission)}
                      disabled={isPublishing === submission.id}
                      className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isPublishing === submission.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                          Publishing...
                        </div>
                      ) : (
                        'Publish Article'
                      )}
                    </button>
                    <button
                      onClick={() => window.open(`/admin/submissions/${submission.id}/details`, '_blank')}
                      className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Published Articles */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Recently Published ({publishedArticles.length})
          </h3>
        </div>

        {publishedArticles.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-neutral-600">No published articles yet</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {publishedArticles.slice(0, 10).map((article) => (
              <div key={article.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-neutral-900 mb-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-2">
                      <span>by {(article as any).author_name || 'Unknown Author'}</span>
                      <span>•</span>
                      <span>Published {new Date(article.updated_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-neutral-700 line-clamp-1">
                      {article.abstract}
                    </p>
                  </div>
                  <div className="ml-6 flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      Published
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publication Modal */}
      {showPublishModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Publish Article
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Submission
                </label>
                <div className="bg-neutral-50 p-3 rounded border">
                  <p className="font-medium text-neutral-900">{selectedSubmission.title}</p>
                  <p className="text-sm text-neutral-600">
                    by {(selectedSubmission as any).author_name || 'Unknown Author'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Volume *
                </label>
                <select
                  value={selectedVolumeId}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                >
                  <option value="">Select a volume...</option>
                  {volumes.map((volume) => (
                    <option key={volume.id} value={volume.id}>
                      Volume {volume.volume_number} ({volume.year}) - {volume.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Issue *
                </label>
                <select
                  value={selectedIssueId}
                  onChange={(e) => setSelectedIssueId(e.target.value)}
                  disabled={!selectedVolumeId}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select an issue...</option>
                  {issues.map((issue) => (
                    <option key={issue.id} value={issue.id}>
                      Issue {issue.issue_number} - {issue.description}
                    </option>
                  ))}
                </select>
                {!selectedVolumeId && (
                  <p className="text-sm text-neutral-500 mt-1">Select a volume first</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Publication Date
                </label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                />
              </div>

              {volumes.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-yellow-800">
                      No volumes available. Please create a volume and issue first in the "Volumes & Issues" tab.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setSelectedSubmission(null);
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishArticle}
                disabled={!selectedVolumeId || !selectedIssueId || isPublishing === selectedSubmission.id}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPublishing === selectedSubmission.id ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                    Publishing...
                  </div>
                ) : (
                  'Publish Article'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};