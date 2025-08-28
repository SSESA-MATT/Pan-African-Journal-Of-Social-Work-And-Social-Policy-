'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { 
  getUserManuscripts, 
  getManuscriptById, 
  deleteManuscript, 
  updateManuscriptStatus 
} from '../../lib/manuscriptApi';
import { Manuscript } from '../../types/manuscript';
import ManuscriptSubmissionForm from './ManuscriptSubmissionForm';

interface AuthorDashboardProps {
  onViewManuscript?: (manuscript: Manuscript) => void;
}

const AuthorDashboard: React.FC<AuthorDashboardProps> = ({ onViewManuscript }) => {
  const { user } = useAuth();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'new-submission' | 'manuscripts'>('overview');
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadManuscripts();
    }
  }, [user]);

  const loadManuscripts = async () => {
    try {
      setLoading(true);
      const userManuscripts = await getUserManuscripts(user!.id);
      setManuscripts(userManuscripts);
    } catch (err) {
      setError('Failed to load manuscripts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManuscript = async (manuscriptId: string) => {
    if (!confirm('Are you sure you want to delete this manuscript?')) return;
    
    try {
      await deleteManuscript(manuscriptId);
      setManuscripts(prev => prev.filter(m => m.id !== manuscriptId));
    } catch (err) {
      setError('Failed to delete manuscript');
      console.error(err);
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'awaiting-revision': return 'bg-orange-100 text-orange-800';
      case 'revised-submitted': return 'bg-purple-100 text-purple-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'published': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const manuscriptStats = {
    total: manuscripts.length,
    draft: manuscripts.filter(m => m.status === 'draft').length,
    submitted: manuscripts.filter(m => m.status === 'submitted').length,
    underReview: manuscripts.filter(m => m.status === 'under-review').length,
    accepted: manuscripts.filter(m => m.status === 'accepted').length,
    published: manuscripts.filter(m => m.status === 'published').length,
  };

  if (!user || user.role !== 'author') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You need author permissions to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.first_name}! Manage your manuscripts and submissions.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('manuscripts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manuscripts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Manuscripts
            </button>
            <button
              onClick={() => setActiveTab('new-submission')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'new-submission'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              New Submission
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">{manuscriptStats.total}</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Manuscripts</dt>
                        <dd className="text-lg font-medium text-gray-900">{manuscriptStats.total}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">{manuscriptStats.underReview}</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Under Review</dt>
                        <dd className="text-lg font-medium text-gray-900">{manuscriptStats.underReview}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">{manuscriptStats.accepted}</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Accepted</dt>
                        <dd className="text-lg font-medium text-gray-900">{manuscriptStats.accepted}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold">{manuscriptStats.published}</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                        <dd className="text-lg font-medium text-gray-900">{manuscriptStats.published}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Manuscripts */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Manuscripts</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Your latest manuscript submissions and updates.</p>
              </div>
              <ul className="divide-y divide-gray-200">
                {manuscripts.slice(0, 5).map((manuscript) => (
                  <li key={manuscript.id}>
                    <div className="px-4 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                              {manuscript.title}
                            </p>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(manuscript.status)}`}>
                              {getStatusText(manuscript.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Last updated: {new Date(manuscript.last_updated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('manuscripts')}
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {manuscripts.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="text-gray-500">No manuscripts yet. Start by creating your first submission!</p>
                  <button
                    onClick={() => setActiveTab('new-submission')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create New Manuscript
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'manuscripts' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">All Manuscripts</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage all your manuscript submissions.</p>
              </div>
              <button
                onClick={() => setActiveTab('new-submission')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                New Submission
              </button>
            </div>
            
            {loading ? (
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500">Loading manuscripts...</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {manuscripts.map((manuscript) => (
                  <li key={manuscript.id}>
                    <div className="px-4 py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium text-gray-900">{manuscript.title}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(manuscript.status)}`}>
                              {getStatusText(manuscript.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{manuscript.abstract.substring(0, 200)}...</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span>Submitted: {new Date(manuscript.submission_date).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>Authors: {manuscript.authors.join(', ')}</span>
                            {manuscript.assigned_reviewers && manuscript.assigned_reviewers.length > 0 && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Reviewers: {manuscript.assigned_reviewers.length}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => setSelectedManuscript(manuscript)}
                            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                          >
                            View
                          </button>
                          {manuscript.status === 'draft' && (
                            <>
                              <button
                                onClick={() => {/* TODO: Open edit form */}}
                                className="text-gray-600 hover:text-gray-500 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteManuscript(manuscript.id)}
                                className="text-red-600 hover:text-red-500 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {manuscripts.length === 0 && !loading && (
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500">No manuscripts found.</p>
                <button
                  onClick={() => setActiveTab('new-submission')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Your First Manuscript
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'new-submission' && (
          <ManuscriptSubmissionForm 
            onSubmissionComplete={() => {
              loadManuscripts();
              setActiveTab('manuscripts');
            }}
          />
        )}
      </div>

      {/* Manuscript Detail Modal */}
      {selectedManuscript && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedManuscript(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedManuscript.title}
                      </h3>
                      <button
                        onClick={() => setSelectedManuscript(null)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="text-2xl">&times;</span>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedManuscript.status)}`}>
                          {getStatusText(selectedManuscript.status)}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Abstract</h4>
                        <p className="text-gray-700 mt-1">{selectedManuscript.abstract}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Authors</h4>
                        <p className="text-gray-700 mt-1">{selectedManuscript.authors.join(', ')}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Keywords</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedManuscript.keywords.map((keyword, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Submission Details</h4>
                        <dl className="mt-1 text-sm text-gray-600">
                          <div className="flex justify-between py-1">
                            <dt>Submitted:</dt>
                            <dd>{new Date(selectedManuscript.submission_date).toLocaleDateString()}</dd>
                          </div>
                          <div className="flex justify-between py-1">
                            <dt>Last Updated:</dt>
                            <dd>{new Date(selectedManuscript.last_updated).toLocaleDateString()}</dd>
                          </div>
                          {selectedManuscript.assigned_reviewers && (
                            <div className="flex justify-between py-1">
                              <dt>Assigned Reviewers:</dt>
                              <dd>{selectedManuscript.assigned_reviewers.length}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { AuthorDashboard };
export default AuthorDashboard;
                Abstract
              </h3>
              <p className="text-neutral-700 leading-relaxed">{selectedSubmission.abstract}</p>
            </div>

            {/* Keywords */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3 border-b border-neutral-200 pb-2">
                Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedSubmission.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary-100 text-secondary-800 text-sm rounded-full font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Co-authors */}
            {selectedSubmission.co_authors && selectedSubmission.co_authors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 border-b border-neutral-200 pb-2">
                  Co-authors
                </h3>
                <ul className="space-y-1">
                  {selectedSubmission.co_authors.map((coAuthor, index) => (
                    <li key={index} className="text-neutral-700 flex items-center">
                      <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                      {coAuthor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Editor Comments */}
            {selectedSubmission.editor_comments && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3 border-b border-neutral-200 pb-2">
                  Editor Communication
                </h3>
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-l-4 border-primary-500 p-4 rounded-r-md">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-primary-800 mb-1">Message from Editor</p>
                      <p className="text-neutral-700">{selectedSubmission.editor_comments}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manuscript and Actions */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3 border-b border-neutral-200 pb-2">
                Manuscript & Actions
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                {selectedSubmission.manuscript_url ? (
                  <a
                    href={selectedSubmission.manuscript_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Current Manuscript
                  </a>
                ) : (
                  <p className="text-neutral-500 italic">No manuscript file available</p>
                )}

                {/* Revision Upload Button */}
                {selectedSubmission.status === 'revisions_required' && (
                  <button
                    onClick={() => setShowRevisionUpload(!showRevisionUpload)}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Revision
                  </button>
                )}
              </div>

              {/* Revision Upload Section */}
              {showRevisionUpload && (
                <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <h4 className="text-md font-medium text-neutral-900 mb-3">Upload Revised Manuscript</h4>
                  
                  {revisionUploadSuccess && (
                    <div className="mb-4 p-3 bg-secondary-50 border border-secondary-200 rounded-md">
                      <p className="text-secondary-800 text-sm">✓ Revision uploaded successfully!</p>
                    </div>
                  )}

                  {revisionUploadError && (
                    <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-md">
                      <p className="text-primary-800 text-sm">✗ {revisionUploadError}</p>
                    </div>
                  )}

                  <FileUpload
                    onUploadSuccess={handleRevisionUpload}
                    onUploadError={(error) => setRevisionUploadError(error)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-lg p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Welcome, {user.first_name} {user.last_name}
                </h1>
                <p className="text-neutral-200 text-lg">
                  Africa Journal of Social Work and Social Policy
                </p>
                <p className="text-neutral-300 text-sm mt-1">
                  Manage your manuscript submissions and track their progress
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-secondary-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Author Portal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6 overflow-hidden">
          <nav className="flex flex-col sm:flex-row">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 py-4 px-4 sm:px-6 text-center font-medium text-sm transition-all duration-200 ${
                activeTab === 'submissions'
                  ? 'bg-secondary-600 text-white shadow-md'
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden xs:inline">My Submissions</span>
                <span className="xs:hidden">Submissions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('new-submission')}
              className={`flex-1 py-4 px-4 sm:px-6 text-center font-medium text-sm transition-all duration-200 ${
                activeTab === 'new-submission'
                  ? 'bg-secondary-600 text-white shadow-md'
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden xs:inline">New Submission</span>
                <span className="xs:hidden">New</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-4 px-4 sm:px-6 text-center font-medium text-sm transition-all duration-200 ${
                activeTab === 'messages'
                  ? 'bg-secondary-600 text-white shadow-md'
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                <span>Messages</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'submissions' && (
            <SubmissionList
              userId={user.id}
              userRole={user.role}
              onSubmissionClick={handleSubmissionClick}
            />
          )}

          {activeTab === 'new-submission' && (
            <SubmissionForm
              onSubmissionSuccess={handleSubmissionSuccess}
              onCancel={() => setActiveTab('submissions')}
            />
          )}

          {activeTab === 'messages' && (
            <MessagingCenter userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
};