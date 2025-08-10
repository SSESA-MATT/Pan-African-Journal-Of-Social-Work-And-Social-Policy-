'use client';

import React, { useState } from 'react';
import { SubmissionForm } from './SubmissionForm';
import { SubmissionList } from './SubmissionList';
import { SubmissionStatus } from './SubmissionStatus';
import { FileUpload } from './FileUpload';
import { MessagingCenter } from './MessagingCenter';
import { Submission } from '../types/submission';
import { submissionApi } from '../lib/submissionApi';

interface AuthorDashboardProps {
  user: {
    id: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}

export const AuthorDashboard: React.FC<AuthorDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'new-submission' | 'messages'>('submissions');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showRevisionUpload, setShowRevisionUpload] = useState(false);
  const [revisionUploadError, setRevisionUploadError] = useState<string>('');
  const [revisionUploadSuccess, setRevisionUploadSuccess] = useState(false);

  const handleSubmissionSuccess = (submissionId: string) => {
    // Switch back to submissions tab and refresh the list
    setActiveTab('submissions');
    // The SubmissionList component will automatically refresh
  };

  const handleSubmissionClick = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const handleBackToList = () => {
    setSelectedSubmission(null);
    setShowRevisionUpload(false);
    setRevisionUploadError('');
    setRevisionUploadSuccess(false);
  };

  const handleRevisionUpload = async (file: any) => {
    if (!selectedSubmission) return;
    
    try {
      setRevisionUploadError('');
      await submissionApi.uploadRevision(selectedSubmission.id, file.file);
      setRevisionUploadSuccess(true);
      setShowRevisionUpload(false);
      // Refresh the submission data
      // In a real app, you'd want to refetch the submission data here
    } catch (error: any) {
      setRevisionUploadError(error.message || 'Failed to upload revision');
    }
  };

  if (selectedSubmission) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center text-secondary-600 hover:text-secondary-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Submissions
          </button>
        </div>

        {/* Submission Detail Card */}
        <div className="bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{selectedSubmission.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
              <span className="text-neutral-200 text-sm">
                Submitted: {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
              </span>
              <div className="flex items-center">
                <SubmissionStatus status={selectedSubmission.status} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Abstract */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3 border-b border-neutral-200 pb-2">
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