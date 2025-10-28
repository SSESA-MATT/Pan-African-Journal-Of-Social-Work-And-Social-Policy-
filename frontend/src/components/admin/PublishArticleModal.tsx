'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Hash, BookOpen } from 'lucide-react';

interface Submission {
  id: number;
  title: string;
  abstract: string;
  author: {
    first_name: string;
    last_name: string;
    email: string;
    affiliation: string;
  };
  co_authors: string[];
  keywords: string[];
  manuscript_type: string;
  word_count: number;
  manuscript_file_url: string;
  created_at: string;
  updated_at: string;
}

interface Volume {
  id: number;
  volume_number: number;
  year: number;
  title: string;
}

interface Issue {
  id: number;
  volume_id: number;
  issue_number: number;
  title: string;
}

interface PublishArticleModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (data: any) => void;
}

export const PublishArticleModal: React.FC<PublishArticleModalProps> = ({
  submission,
  isOpen,
  onClose,
  onPublish
}) => {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    volumeId: '',
    issueId: '',
    pageStart: '',
    pageEnd: '',
    doi: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadVolumes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.volumeId) {
      loadIssues(parseInt(formData.volumeId));
    } else {
      setIssues([]);
      setFormData(prev => ({ ...prev, issueId: '' }));
    }
  }, [formData.volumeId]);

  const loadVolumes = async () => {
    try {
      const response = await fetch('/api/volumes');
      if (response.ok) {
        const volumesData = await response.json();
        setVolumes(volumesData || []);
      }
    } catch (error) {
      console.error('Failed to load volumes:', error);
    }
  };

  const loadIssues = async (volumeId: number) => {
    try {
      // This would need an issues API endpoint
      // For now, we'll create a mock issue
      setIssues([
        {
          id: 1,
          volume_id: volumeId,
          issue_number: 1,
          title: 'Issue 1'
        }
      ]);
    } catch (error) {
      console.error('Failed to load issues:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submission) return;

    setLoading(true);
    
    try {
      const publishData = {
        submissionId: submission.id,
        volumeId: formData.volumeId ? parseInt(formData.volumeId) : null,
        issueId: formData.issueId ? parseInt(formData.issueId) : null,
        pageStart: formData.pageStart ? parseInt(formData.pageStart) : null,
        pageEnd: formData.pageEnd ? parseInt(formData.pageEnd) : null,
        doi: formData.doi || null
      };

      await onPublish(publishData);
      
      // Reset form
      setFormData({
        volumeId: '',
        issueId: '',
        pageStart: '',
        pageEnd: '',
        doi: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to publish article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Publish Article</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Submission Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Submission Details
            </h3>
            <p className="text-sm text-gray-700 mb-1">
              <strong>Title:</strong> {submission.title}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <strong>Author:</strong> {submission.author.first_name} {submission.author.last_name}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <strong>Type:</strong> {submission.manuscript_type}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Word Count:</strong> {submission.word_count.toLocaleString()}
            </p>
          </div>

          {/* Publication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Volume Selection */}
            <div>
              <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
                Volume
              </label>
              <select
                id="volume"
                value={formData.volumeId}
                onChange={(e) => setFormData(prev => ({ ...prev, volumeId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Volume</option>
                {volumes.map(volume => (
                  <option key={volume.id} value={volume.id}>
                    Volume {volume.volume_number} ({volume.year}) - {volume.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Selection */}
            <div>
              <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
                Issue
              </label>
              <select
                id="issue"
                value={formData.issueId}
                onChange={(e) => setFormData(prev => ({ ...prev, issueId: e.target.value }))}
                disabled={!formData.volumeId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Issue</option>
                {issues.map(issue => (
                  <option key={issue.id} value={issue.id}>
                    Issue {issue.issue_number} - {issue.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Numbers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pageStart" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Page
                </label>
                <input
                  type="number"
                  id="pageStart"
                  value={formData.pageStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageStart: e.target.value }))}
                  placeholder="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="pageEnd" className="block text-sm font-medium text-gray-700 mb-1">
                  End Page
                </label>
                <input
                  type="number"
                  id="pageEnd"
                  value={formData.pageEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageEnd: e.target.value }))}
                  placeholder="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* DOI */}
            <div>
              <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-1">
                DOI (optional)
              </label>
              <input
                type="text"
                id="doi"
                value={formData.doi}
                onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))}
                placeholder="10.xxxx/pajswsp.2024.01.01.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                    Publishing...
                  </div>
                ) : (
                  'Publish Article'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};