'use client';

import React, { useState, useEffect } from 'react';
import { submissionApi } from '@/lib/submissionApi';
import { articleApi } from '@/lib/articleApi';
import { Volume, Issue, VolumeWithIssues, PublishArticleRequest } from '@/types/article';
import { Submission } from '@/types/submission';

export const ArticlePublicationWorkflow: React.FC = () => {
  const [acceptedSubmissions, setAcceptedSubmissions] = useState<Submission[]>([]);
  const [volumes, setVolumes] = useState<VolumeWithIssues[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedVolumeId, setSelectedVolumeId] = useState<string>('');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Form data for article publication
  const [articleData, setArticleData] = useState({
    title: '',
    abstract: '',
    authors: [] as string[],
    keywords: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load accepted submissions ready for publication
      const submissionsResponse = await articleApi.getSubmissionsReadyForPublication();
      if (submissionsResponse.submissions) {
        setAcceptedSubmissions(submissionsResponse.submissions);
      }

      // Load volumes with issues
      const volumesResponse = await articleApi.getVolumes();
      if (volumesResponse.volumes) {
        setVolumes(volumesResponse.volumes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const openPublishModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setArticleData({
      title: submission.title,
      abstract: submission.abstract,
      authors: submission.co_authors || [],
      keywords: submission.keywords || []
    });
    setSelectedVolumeId('');
    setSelectedIssueId('');
    setShowPublishModal(true);
  };

  const handlePublishArticle = async () => {
    if (!selectedSubmission || !selectedIssueId) return;

    try {
      setIsPublishing(true);
      setError(null);

      const publishRequest: PublishArticleRequest = {
        submission_id: selectedSubmission.id,
        issue_id: selectedIssueId,
        title: articleData.title,
        abstract: articleData.abstract,
        authors: articleData.authors,
        keywords: articleData.keywords
      };

      await articleApi.publishArticle(publishRequest);

      // Refresh data
      await loadData();
      
      // Close modal and reset state
      setShowPublishModal(false);
      setSelectedSubmission(null);
      setSelectedVolumeId('');
      setSelectedIssueId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish article');
    } finally {
      setIsPublishing(false);
    }
  };

  const getIssuesForSelectedVolume = () => {
    if (!selectedVolumeId) return [];
    const selectedVolume = volumes.find(v => v.id === selectedVolumeId);
    return selectedVolume?.issues || [];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
          <p className="text-neutral-600 mt-1">Publish accepted submissions as articles in journal issues</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-accent-green/10 rounded-full">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Ready for Publication</p>
              <p className="text-2xl font-bold text-neutral-900">{acceptedSubmissions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Active Volumes</p>
              <p className="text-2xl font-bold text-neutral-900">{volumes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Total Issues</p>
              <p className="text-2xl font-bold text-neutral-900">
                {volumes.reduce((total, volume) => total + volume.issues.length, 0)}
              </p>
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
            Accepted Submissions Ready for Publication
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
              <div key={submission.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-neutral-900 truncate">
                        {submission.title}
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-green-800 border border-green-200">
                        Accepted
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-3">
                      <span>by {(submission as any).author_name || 'Unknown Author'}</span>
                      <span>•</span>
                      <span>Accepted {formatDate(submission.updated_at)}</span>
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
                        {submission.keywords.length > 5 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                            +{submission.keywords.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex-shrink-0">
                    <button
                      onClick={() => openPublishModal(submission)}
                      className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors font-medium"
                    >
                      Publish Article
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish Article Modal */}
      {showPublishModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Publish Article
            </h3>
            
            <div className="space-y-6">
              {/* Submission Info */}
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <h4 className="font-medium text-neutral-900 mb-2">Submission Details</h4>
                <p className="text-sm text-neutral-600 mb-1">
                  <strong>Title:</strong> {selectedSubmission.title}
                </p>
                <p className="text-sm text-neutral-600">
                  <strong>Author:</strong> {(selectedSubmission as any).author_name || 'Unknown Author'}
                </p>
              </div>

              {/* Article Metadata */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Article Title
                </label>
                <input
                  type="text"
                  value={articleData.title}
                  onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Abstract
                </label>
                <textarea
                  value={articleData.abstract}
                  onChange={(e) => setArticleData(prev => ({ ...prev, abstract: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Authors (one per line)
                </label>
                <textarea
                  value={articleData.authors.join('\n')}
                  onChange={(e) => setArticleData(prev => ({ 
                    ...prev, 
                    authors: e.target.value.split('\n').filter(author => author.trim()) 
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  placeholder="Enter author names, one per line"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={articleData.keywords.join(', ')}
                  onChange={(e) => setArticleData(prev => ({ 
                    ...prev, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  placeholder="Enter keywords separated by commas"
                />
              </div>

              {/* Volume and Issue Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Volume
                  </label>
                  <select
                    value={selectedVolumeId}
                    onChange={(e) => {
                      setSelectedVolumeId(e.target.value);
                      setSelectedIssueId('');
                    }}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    required
                  >
                    <option value="">Select Volume</option>
                    {volumes.map((volume) => (
                      <option key={volume.id} value={volume.id}>
                        Volume {volume.volume_number} ({volume.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Issue
                  </label>
                  <select
                    value={selectedIssueId}
                    onChange={(e) => setSelectedIssueId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    disabled={!selectedVolumeId}
                    required
                  >
                    <option value="">Select Issue</option>
                    {getIssuesForSelectedVolume().map((issue) => (
                      <option key={issue.id} value={issue.id}>
                        Issue {issue.issue_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setSelectedSubmission(null);
                  setSelectedVolumeId('');
                  setSelectedIssueId('');
                }}
                disabled={isPublishing}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishArticle}
                disabled={isPublishing || !selectedIssueId || !articleData.title.trim()}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPublishing ? (
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