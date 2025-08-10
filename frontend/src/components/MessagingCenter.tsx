'use client';

import React, { useState, useEffect } from 'react';
import { submissionApi } from '../lib/submissionApi';
import { Submission } from '../types/submission';
import { SubmissionStatus } from './SubmissionStatus';

interface MessagingCenterProps {
  userId: string;
}

interface MessageThread {
  submissionId: string;
  submissionTitle: string;
  status: Submission['status'];
  editorComments: string;
  lastUpdated: string;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({ userId }) => {
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);

  useEffect(() => {
    loadMessageThreads();
  }, []);

  const loadMessageThreads = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await submissionApi.getMySubmissions();
      
      // Filter submissions that have editor comments
      const threadsWithMessages = result.submissions
        .filter((submission: any) => submission.editor_comments)
        .map((submission: any) => ({
          submissionId: submission.id,
          submissionTitle: submission.title,
          status: submission.status,
          editorComments: submission.editor_comments,
          lastUpdated: submission.updated_at
        }))
        .sort((a: MessageThread, b: MessageThread) => 
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );

      setMessageThreads(threadsWithMessages);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
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
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div>
          <span className="ml-3 text-neutral-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-md p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-primary-800 font-medium">{error}</p>
          </div>
          <button
            onClick={loadMessageThreads}
            className="mt-3 inline-flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (messageThreads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12">
        <div className="text-center">
          <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No messages yet</h3>
          <p className="text-neutral-600">
            Editor communications will appear here when available.
          </p>
          <p className="text-sm text-neutral-500 mt-2">
            Messages are typically sent when your submission status changes or when editors need to provide feedback.
          </p>
        </div>
      </div>
    );
  }

  if (selectedThread) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedThread(null)}
              className="flex items-center text-secondary-600 hover:text-secondary-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Messages
            </button>
            <SubmissionStatus status={selectedThread.status} />
          </div>
        </div>

        {/* Message Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            {selectedThread.submissionTitle}
          </h3>
          
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-l-4 border-primary-500 p-4 rounded-r-md">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary-800 mb-2">Editor Message</p>
                <p className="text-neutral-700 leading-relaxed">{selectedThread.editorComments}</p>
                <p className="text-xs text-neutral-500 mt-3">
                  {formatDate(selectedThread.lastUpdated)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-md">
            <p className="text-sm text-neutral-600">
              <strong>Note:</strong> This is a one-way communication from the editor. 
              If you need to respond or have questions, please contact the editorial office directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Editor Communications</h3>
        <p className="text-sm text-neutral-600 mt-1">
          Messages and feedback from editors regarding your submissions
        </p>
      </div>

      {/* Message Threads */}
      <div className="divide-y divide-neutral-200">
        {messageThreads.map((thread) => (
          <div
            key={thread.submissionId}
            className="px-6 py-4 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-transparent cursor-pointer transition-all duration-200"
            onClick={() => setSelectedThread(thread)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-neutral-900 truncate mb-2">
                  {thread.submissionTitle}
                </h4>
                <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                  {thread.editorComments}
                </p>
                <div className="flex items-center text-xs text-neutral-500">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(thread.lastUpdated)}
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
                <SubmissionStatus status={thread.status} />
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};