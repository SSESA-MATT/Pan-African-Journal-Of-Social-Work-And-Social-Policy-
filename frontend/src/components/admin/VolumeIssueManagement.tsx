'use client';

import React, { useState, useEffect } from 'react';

interface Volume {
  id: string;
  number: number;
  year: number;
  title: string;
  description?: string;
  created_at: string;
}

interface Issue {
  id: string;
  volume_id: string;
  number: number;
  title: string;
  description?: string;
  publication_date: string;
  created_at: string;
}

export const VolumeIssueManagement: React.FC = () => {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<Volume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateVolumeModal, setShowCreateVolumeModal] = useState(false);
  const [showCreateIssueModal, setShowCreateIssueModal] = useState(false);

  // Form states
  const [volumeForm, setVolumeForm] = useState({
    number: '',
    year: new Date().getFullYear().toString(),
    title: '',
    description: ''
  });

  const [issueForm, setIssueForm] = useState({
    volume_id: '',
    number: '',
    title: '',
    description: '',
    publication_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, we'll use mock data since the backend endpoints might not be implemented
      const mockVolumes: Volume[] = [
        {
          id: '1',
          number: 1,
          year: 2024,
          title: 'Volume 1: Foundations of African Social Work',
          description: 'Inaugural volume focusing on the foundations and principles of social work in African contexts.',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          number: 2,
          year: 2024,
          title: 'Volume 2: Community Development and Policy',
          description: 'Exploring community development strategies and social policy frameworks across Africa.',
          created_at: '2024-06-01T00:00:00Z'
        }
      ];

      const mockIssues: Issue[] = [
        {
          id: '1',
          volume_id: '1',
          number: 1,
          title: 'Issue 1: Historical Perspectives',
          description: 'Historical foundations of social work practice in Africa',
          publication_date: '2024-03-01',
          created_at: '2024-02-01T00:00:00Z'
        },
        {
          id: '2',
          volume_id: '1',
          number: 2,
          title: 'Issue 2: Contemporary Challenges',
          description: 'Modern challenges facing social work practitioners',
          publication_date: '2024-06-01',
          created_at: '2024-05-01T00:00:00Z'
        },
        {
          id: '3',
          volume_id: '2',
          number: 1,
          title: 'Issue 1: Policy Frameworks',
          description: 'Social policy development and implementation',
          publication_date: '2024-09-01',
          created_at: '2024-08-01T00:00:00Z'
        }
      ];

      setVolumes(mockVolumes);
      setIssues(mockIssues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVolume = async () => {
    try {
      // This would call the backend API
      console.log('Creating volume:', volumeForm);
      
      // Mock creation
      const newVolume: Volume = {
        id: Date.now().toString(),
        number: parseInt(volumeForm.number),
        year: parseInt(volumeForm.year),
        title: volumeForm.title,
        description: volumeForm.description,
        created_at: new Date().toISOString()
      };

      setVolumes(prev => [...prev, newVolume]);
      setShowCreateVolumeModal(false);
      setVolumeForm({
        number: '',
        year: new Date().getFullYear().toString(),
        title: '',
        description: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create volume');
    }
  };

  const handleCreateIssue = async () => {
    try {
      // This would call the backend API
      console.log('Creating issue:', issueForm);
      
      // Mock creation
      const newIssue: Issue = {
        id: Date.now().toString(),
        volume_id: issueForm.volume_id,
        number: parseInt(issueForm.number),
        title: issueForm.title,
        description: issueForm.description,
        publication_date: issueForm.publication_date,
        created_at: new Date().toISOString()
      };

      setIssues(prev => [...prev, newIssue]);
      setShowCreateIssueModal(false);
      setIssueForm({
        volume_id: '',
        number: '',
        title: '',
        description: '',
        publication_date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
    }
  };

  const getIssuesForVolume = (volumeId: string) => {
    return issues.filter(issue => issue.volume_id === volumeId);
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
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-900/5 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                <svg className="w-6 h-6 mr-3 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Volume & Issue Management
              </h2>
              <p className="text-neutral-600 mt-1">Organize journal content into volumes and issues</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateVolumeModal(true)}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors font-medium"
              >
                New Volume
              </button>
              <button
                onClick={() => setShowCreateIssueModal(true)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                New Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-neutral-100 rounded-full">
              <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="p-3 bg-accent-green/10 rounded-full">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Total Issues</p>
              <p className="text-2xl font-bold text-neutral-900">{issues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
        {volumes.map((volume) => {
          const volumeIssues = getIssuesForVolume(volume.id);
          
          return (
            <div key={volume.id} className="bg-white rounded-lg border border-neutral-200 shadow-sm">
              <div className="px-6 py-4 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Volume {volume.number} ({volume.year})
                    </h3>
                    <p className="text-neutral-600 mt-1">{volume.title}</p>
                    {volume.description && (
                      <p className="text-sm text-neutral-500 mt-1">{volume.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-neutral-500">
                      {volumeIssues.length} issue{volumeIssues.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Issues for this volume */}
              {volumeIssues.length > 0 ? (
                <div className="divide-y divide-neutral-200">
                  {volumeIssues.map((issue) => (
                    <div key={issue.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900">
                            Issue {issue.number}: {issue.title}
                          </h4>
                          {issue.description && (
                            <p className="text-sm text-neutral-600 mt-1">{issue.description}</p>
                          )}
                          <p className="text-xs text-neutral-500 mt-2">
                            Publication Date: {new Date(issue.publication_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Published
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-neutral-500">No issues created for this volume yet</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Volume Modal */}
      {showCreateVolumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Create New Volume</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Volume Number</label>
                  <input
                    type="number"
                    value={volumeForm.number}
                    onChange={(e) => setVolumeForm(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={volumeForm.year}
                    onChange={(e) => setVolumeForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input
                  type="text"
                  value={volumeForm.title}
                  onChange={(e) => setVolumeForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description (Optional)</label>
                <textarea
                  value={volumeForm.description}
                  onChange={(e) => setVolumeForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateVolumeModal(false)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVolume}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors"
              >
                Create Volume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Issue Modal */}
      {showCreateIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Create New Issue</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Volume</label>
                <select
                  value={issueForm.volume_id}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, volume_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                >
                  <option value="">Select a volume...</option>
                  {volumes.map((volume) => (
                    <option key={volume.id} value={volume.id}>
                      Volume {volume.number} ({volume.year})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Issue Number</label>
                <input
                  type="number"
                  value={issueForm.number}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, number: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input
                  type="text"
                  value={issueForm.title}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Publication Date</label>
                <input
                  type="date"
                  value={issueForm.publication_date}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, publication_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description (Optional)</label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateIssueModal(false)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIssue}
                disabled={!issueForm.volume_id}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};