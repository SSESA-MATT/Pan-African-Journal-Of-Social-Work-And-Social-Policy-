'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  User, 
  Calendar, 
  Tag, 
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface ManuscriptData {
  id: string;
  title: string;
  abstract: string;
  content: string;
  keywords: string[];
  authors: string[];
  corresponding_author: string;
  manuscript_type: string;
  funding_information: string;
  conflict_of_interest: string;
  ethics_approval: string;
  data_availability: string;
  status: string;
  submission_date: string;
  created_at: string;
  word_count: number;
  manuscript_file_url: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  reviewer_assignments: any[];
  reviews: any[];
  user_role: {
    is_author: boolean;
    is_reviewer: boolean;
    is_admin_or_editor: boolean;
  };
}

interface ManuscriptViewerProps {
  submissionId: string;
  onClose?: () => void;
  className?: string;
}

export const ManuscriptViewer: React.FC<ManuscriptViewerProps> = ({
  submissionId,
  onClose,
  className = ''
}) => {
  const [manuscript, setManuscript] = useState<ManuscriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'reviews'>('content');

  useEffect(() => {
    loadManuscript();
  }, [submissionId]);

  const loadManuscript = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/submissions/${submissionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Manuscript not found');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to view this manuscript');
        }
        throw new Error('Failed to load manuscript');
      }

      const data = await response.json();
      setManuscript(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load manuscript');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      assigned_for_review: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-purple-100 text-purple-800',
      revision_requested: 'bg-orange-100 text-orange-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      published: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadFile = async () => {
    if (!manuscript?.manuscript_file_url) return;
    
    try {
      // For demo purposes, we'll just open the URL
      // In production, this would generate a secure download URL
      window.open(manuscript.manuscript_file_url, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manuscript...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Manuscript</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadManuscript}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!manuscript) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-8 text-center">
          <p className="text-gray-600">Manuscript not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {manuscript.title}
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(manuscript.status)}`}>
              {manuscript.status.replace('_', ' ')}
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {manuscript.manuscript_type.replace('_', ' ')}
            </span>
            <span className="text-sm text-gray-500">
              {manuscript.word_count.toLocaleString()} words
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 ml-4">
          {manuscript.manuscript_file_url && (
            <button
              onClick={handleDownloadFile}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Author and Submission Info */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <User className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <span className="font-medium">Author:</span>
              <div className="text-gray-600">{manuscript.author.name}</div>
              <div className="text-gray-500">{manuscript.author.email}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <span className="font-medium">Submitted:</span>
              <div className="text-gray-600">{formatDate(manuscript.submission_date)}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-gray-400 mr-2" />
            <div>
              <span className="font-medium">Last Updated:</span>
              <div className="text-gray-600">{formatDate(manuscript.created_at)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="px-6 -mb-px flex space-x-8">
          {[
            { key: 'content', label: 'Content', icon: FileText },
            { key: 'metadata', label: 'Metadata', icon: Tag },
            { key: 'reviews', label: `Reviews (${manuscript.reviews.length})`, icon: CheckCircle }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Abstract */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Abstract</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{manuscript.abstract}</p>
              </div>
            </div>

            {/* Keywords */}
            {manuscript.keywords.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {manuscript.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Authors */}
            {manuscript.authors.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Co-Authors</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-1">
                    {manuscript.authors.map((author, index) => (
                      <li key={index} className="text-gray-700">{author}</li>
                    ))}
                  </ul>
                  {manuscript.corresponding_author && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="font-medium text-gray-900">Corresponding Author:</span>
                      <div className="text-gray-700">{manuscript.corresponding_author}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Content */}
            {manuscript.content && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Manuscript Content</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: manuscript.content }}
                  />
                </div>
              </div>
            )}

            {/* File Attachment */}
            {manuscript.manuscript_file_url && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Attached File</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Manuscript File</p>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadFile}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Funding Information */}
              {manuscript.funding_information && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Funding Information</h4>
                  <p className="text-gray-700 text-sm">{manuscript.funding_information}</p>
                </div>
              )}

              {/* Conflict of Interest */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Conflict of Interest</h4>
                <p className="text-gray-700 text-sm">{manuscript.conflict_of_interest}</p>
              </div>

              {/* Ethics Approval */}
              {manuscript.ethics_approval && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ethics Approval</h4>
                  <p className="text-gray-700 text-sm">{manuscript.ethics_approval}</p>
                </div>
              )}

              {/* Data Availability */}
              {manuscript.data_availability && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Availability</h4>
                  <p className="text-gray-700 text-sm">{manuscript.data_availability}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {manuscript.reviews.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500">
                  {manuscript.reviewer_assignments.length > 0
                    ? 'Reviews are in progress'
                    : 'No reviewers have been assigned yet'
                  }
                </p>
              </div>
            ) : (
              manuscript.reviews.map((review: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Review {index + 1}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      review.recommendation === 'accept' ? 'bg-green-100 text-green-800' :
                      review.recommendation === 'minor_revisions' ? 'bg-yellow-100 text-yellow-800' :
                      review.recommendation === 'major_revisions' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {review.recommendation.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{review.comments}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {formatDate(review.submitted_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};