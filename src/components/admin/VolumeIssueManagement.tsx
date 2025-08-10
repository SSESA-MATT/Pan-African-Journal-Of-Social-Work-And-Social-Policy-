'use client';

import React, { useState, useEffect } from 'react';
import { articleApi } from '@/lib/articleApi';
import { Volume, Issue, VolumeWithIssues, CreateVolumeRequest, CreateIssueRequest } from '@/types/article';

export const VolumeIssueManagement: React.FC = () => {
  const [volumes, setVolumes] = useState<VolumeWithIssues[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateVolumeModal, setShowCreateVolumeModal] = useState(false);
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);
  const [selectedVolumeForIssue, setSelectedVolumeForIssue] = useState<VolumeWithIssues | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form states
  const [volumeForm, setVolumeForm] = useState<CreateVolumeRequest>({
    volume_number: new Date().getFullYear() - 2019, // Start from volume 1 in 2020
    year: new Date().getFullYear(),
    description: ''
  });

  const [issueForm, setIssueForm] = useState<CreateIssueRequest>({
    issue_number: 1,
    volume_id: '',
    description: ''
  });

  useEffect(() => {
    loadVolumes();
  }, []);

  const loadVolumes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await articleApi.getVolumes();
      if (response.volumes) {
        setVolumes(response.volumes.sort((a, b) => b.year - a.year || b.volume_number - a.volume_number));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load volumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVolume = async () => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await articleApi.createVolume(volumeForm);
      if (response.volume) {
        await loadVolumes();
        setShowCreateVolumeModal(false);
        setVolumeForm({
          volume_number: new Date().getFullYear() - 2019,
          year: new Date().getFullYear(),
          description: ''
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create volume');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateIssue = async () => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await articleApi.createIssue(issueForm);
      if (response.issue) {
        await loadVolumes();
        setShowCreateIssueModal(false);
        setSelectedVolumeForIssue(null);
        setIssueForm({
          issue_number: 1,
          volume_id: '',
          description: ''
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteVolume = async (volumeId: string) => {
    if (!confirm('Are you sure you want to delete this volume? This will also delete all associated issues and articles.')) {
      return;
    }

    try {
      setIsDeleting(volumeId);
      setError(null);

      await articleApi.deleteVolume(volumeId);
      await loadVolumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete volume');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm('Are you sure you want to delete this issue? This will also delete all associated articles.')) {
      return;
    }

    try {
      setIsDeleting(issueId);
      setError(null);

      await articleApi.deleteIssue(issueId);
      await loadVolumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete issue');
    } finally {
      setIsDeleting(null);
    }
  };

  const openCreateIssueModal = (volume: VolumeWithIssues) => {
    setSelectedVolumeForIssue(volume);
    setIssueForm({
      issue_number: volume.issues.length + 1,
      volume_id: volume.id,
      description: ''
    });
    setShowCreateIssueModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        <span className="ml-3 text-neutral-600">Loading volumes and issues...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Volume & Issue Management
              </h2>
              <p className="text-neutral-600 mt-1">Manage journal volumes and issues for article publication</p>
            </div>
            <button
              onClick={() => setShowCreateVolumeModal(true)}
              className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Volume
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Total Volumes</p>
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

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-accent-green/10 rounded-full">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6-8a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Current Year</p>
              <p className="text-2xl font-bold text-neutral-900">{new Date().getFullYear()}</p>
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

      {/* Volumes List */}
      <div className="space-y-4">
        {volumes.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-neutral-600 mb-4">No volumes created yet</p>
              <button
                onClick={() => setShowCreateVolumeModal(true)}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors"
              >
                Create First Volume
              </button>
            </div>
          </div>
        ) : (
          volumes.map((volume) => (
            <div key={volume.id} className="bg-white rounded-lg border border-neutral-200 shadow-sm">
              {/* Volume Header */}
              <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Volume {volume.volume_number} ({volume.year})
                    </h3>
                    {volume.description && (
                      <p className="text-neutral-600 mt-1">{volume.description}</p>
                    )}
                    <p className="text-sm text-neutral-500 mt-1">
                      Created {formatDate(volume.created_at)} • {volume.issues.length} issue{volume.issues.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openCreateIssueModal(volume)}
                      className="px-3 py-1.5 text-sm font-medium text-accent-green border border-accent-green rounded-md hover:bg-accent-green hover:text-white transition-colors"
                    >
                      Add Issue
                    </button>
                    <button
                      onClick={() => handleDeleteVolume(volume.id)}
                      disabled={isDeleting === volume.id}
                      className="px-3 py-1.5 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isDeleting === volume.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Issues */}
              <div className="p-6">
                {volume.issues.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-8 h-8 text-neutral-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-neutral-600 text-sm mb-3">No issues in this volume</p>
                    <button
                      onClick={() => openCreateIssueModal(volume)}
                      className="px-3 py-1.5 text-sm font-medium text-accent-green border border-accent-green rounded-md hover:bg-accent-green hover:text-white transition-colors"
                    >
                      Create First Issue
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {volume.issues
                      .sort((a, b) => a.issue_number - b.issue_number)
                      .map((issue) => (
                        <div key={issue.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-neutral-900">
                              Issue {issue.issue_number}
                            </h4>
                            <button
                              onClick={() => handleDeleteIssue(issue.id)}
                              disabled={isDeleting === issue.id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          {issue.description && (
                            <p className="text-sm text-neutral-600 mb-2">{issue.description}</p>
                          )}
                          <div className="text-xs text-neutral-500">
                            {issue.published_at ? (
                              <span>Published {formatDate(issue.published_at)}</span>
                            ) : (
                              <span>Created {formatDate(issue.created_at)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Volume Modal */}
      {showCreateVolumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Create New Volume
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Volume Number
                </label>
                <input
                  type="number"
                  value={volumeForm.volume_number}
                  onChange={(e) => setVolumeForm(prev => ({ ...prev, volume_number: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={volumeForm.year}
                  onChange={(e) => setVolumeForm(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  min="2020"
                  max={new Date().getFullYear() + 5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={volumeForm.description}
                  onChange={(e) => setVolumeForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  placeholder="Brief description of this volume's theme or focus"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateVolumeModal(false);
                  setVolumeForm({
                    volume_number: new Date().getFullYear() - 2019,
                    year: new Date().getFullYear(),
                    description: ''
                  });
                }}
                disabled={isCreating}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVolume}
                disabled={isCreating || !volumeForm.volume_number || !volumeForm.year}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Volume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Issue Modal */}
      {showCreateIssueModal && selectedVolumeForIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Create New Issue for Volume {selectedVolumeForIssue.volume_number}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Issue Number
                </label>
                <input
                  type="number"
                  value={issueForm.issue_number}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, issue_number: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  placeholder="Brief description of this issue's theme or special focus"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateIssueModal(false);
                  setSelectedVolumeForIssue(null);
                  setIssueForm({
                    issue_number: 1,
                    volume_id: '',
                    description: ''
                  });
                }}
                disabled={isCreating}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIssue}
                disabled={isCreating || !issueForm.issue_number}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Issue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};