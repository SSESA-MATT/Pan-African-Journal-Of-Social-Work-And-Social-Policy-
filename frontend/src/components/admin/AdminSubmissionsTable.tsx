'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { AssignReviewersModal } from './AssignReviewersModal';

interface AdminSubmission {
  id: string;
  title: string;
  author_name: string;
  author_email: string;
  status: string;
  created_at: string;
  assigned_reviewers: number;
  completed_reviews: number;
  pending_reviews: number;
  overdue_reviews: number;
  days_since_submission: number;
  can_assign_reviewers: boolean;
  needs_decision: boolean;
  manuscript_type: string;
}

interface AdminSubmissionsTableProps {
  className?: string;
}

export const AdminSubmissionsTable: React.FC<AdminSubmissionsTableProps> = ({
  className = ''
}) => {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);

  const itemsPerPage = 20;

  const statusOptions = [
    { value: 'all', label: 'All Submissions', count: 0 },
    { value: 'submitted', label: 'New Submissions', count: 0 },
    { value: 'assigned_for_review', label: 'Under Review', count: 0 },
    { value: 'under_review', label: 'Review in Progress', count: 0 },
    { value: 'revision_requested', label: 'Revision Requested', count: 0 },
    { value: 'accepted', label: 'Accepted', count: 0 },
    { value: 'rejected', label: 'Rejected', count: 0 }
  ];

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-800',
    assigned_for_review: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-purple-100 text-purple-800',
    revision_requested: 'bg-orange-100 text-orange-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    published: 'bg-gray-100 text-gray-800'
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedStatus, currentPage]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        status: selectedStatus,
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString()
      });

      const response = await fetch(`/api/admin/submissions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load submissions');
      }

      const data = await response.json();
      setSubmissions(data.submissions || []);
      setTotalSubmissions(data.pagination.total);
      setTotalPages(Math.ceil(data.pagination.total / itemsPerPage));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignReviewers = (submission: AdminSubmission) => {
    setSelectedSubmission(submission);
    setAssignModalOpen(true);
  };

  const handleAssignmentComplete = () => {
    loadSubmissions(); // Refresh the data
  };

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update submission status');
      }

      // Refresh submissions
      loadSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.author_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUrgencyIndicator = (submission: AdminSubmission) => {
    if (submission.overdue_reviews > 0) {
      return <AlertTriangle className="w-4 h-4 text-red-500" title="Overdue reviews" />;
    }
    if (submission.days_since_submission > 30) {
      return <Clock className="w-4 h-4 text-orange-500" title="Long pending" />;
    }
    if (submission.needs_decision) {
      return <CheckCircle className="w-4 h-4 text-green-500" title="Ready for decision" />;
    }
    return null;
  };

  if (loading && submissions.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Manuscript Submissions</h2>
          <div className="text-sm text-gray-600">
            Total: {totalSubmissions} submissions
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Review Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubmissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    {getUrgencyIndicator(submission)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {submission.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {submission.manuscript_type?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {submission.author_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {submission.author_email}
                    </p>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    statusColors[submission.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {submission.status.replace('_', ' ')}
                  </span>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{submission.assigned_reviewers}</span>
                    </div>
                    
                    {submission.assigned_reviewers > 0 && (
                      <>
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>{submission.completed_reviews}</span>
                        </div>
                        
                        {submission.pending_reviews > 0 && (
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <Clock className="w-4 h-4" />
                            <span>{submission.pending_reviews}</span>
                          </div>
                        )}
                        
                        {submission.overdue_reviews > 0 && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{submission.overdue_reviews}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>
                    <p>{formatDate(submission.created_at)}</p>
                    <p className="text-xs">
                      {submission.days_since_submission} days ago
                    </p>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {/* TODO: View submission details */}}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View submission"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {submission.can_assign_reviewers && (
                      <button
                        onClick={() => handleAssignReviewers(submission)}
                        className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
                        title="Assign reviewers"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                    
                    {submission.needs_decision && (
                      <select
                        onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="" disabled>Make Decision</option>
                        <option value="accepted">Accept</option>
                        <option value="revision_requested">Request Revision</option>
                        <option value="rejected">Reject</option>
                      </select>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredSubmissions.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No submissions match the selected filters'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalSubmissions)} of {totalSubmissions} submissions
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Assign Reviewers Modal */}
      {selectedSubmission && (
        <AssignReviewersModal
          isOpen={assignModalOpen}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}
    </div>
  );
};