'use client';

import React, { useState, useEffect } from 'react';
import { User } from '../types/auth';
import { Manuscript } from '../types/manuscript';

interface ReviewerAssignmentAdvancedProps {
  manuscript: Manuscript;
  onAssignReviewer: (manuscriptId: string, reviewerId: string) => Promise<void>;
  onRemoveReviewer: (manuscriptId: string, reviewerId: string) => Promise<void>;
  currentUser: User;
}

interface PotentialReviewer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  institution?: string;
  expertise_areas?: string[];
  recent_reviews?: number;
  average_review_time?: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  conflict_of_interest?: boolean;
  match_score?: number;
}

const ReviewerAssignmentAdvanced: React.FC<ReviewerAssignmentAdvancedProps> = ({
  manuscript,
  onAssignReviewer,
  onRemoveReviewer,
  currentUser
}) => {
  const [potentialReviewers, setPotentialReviewers] = useState<PotentialReviewer[]>([]);
  const [assignedReviewers, setAssignedReviewers] = useState<PotentialReviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    availability: 'all',
    expertise: 'all',
    workload: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReviewers();
  }, [manuscript.id]);

  const loadReviewers = async () => {
    try {
      setLoading(true);
      // Simulate API call to get potential reviewers
      // In real implementation, this would:
      // 1. Find reviewers with expertise matching manuscript keywords
      // 2. Filter out conflicts of interest
      // 3. Check reviewer availability and workload
      // 4. Calculate match scores based on expertise overlap
      
      const mockReviewers: PotentialReviewer[] = [
        {
          id: '1',
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@university.edu',
          institution: 'University of Cape Town',
          expertise_areas: ['Social Work', 'Community Development', 'Child Welfare'],
          recent_reviews: 3,
          average_review_time: 21,
          availability_status: 'available',
          conflict_of_interest: false,
          match_score: 95
        },
        {
          id: '2',
          first_name: 'Prof. Michael',
          last_name: 'Okafor',
          email: 'michael.okafor@university.ng',
          institution: 'University of Lagos',
          expertise_areas: ['Social Policy', 'Public Administration', 'Governance'],
          recent_reviews: 1,
          average_review_time: 18,
          availability_status: 'available',
          conflict_of_interest: false,
          match_score: 88
        },
        {
          id: '3',
          first_name: 'Dr. Fatima',
          last_name: 'Al-Rashid',
          email: 'fatima.rashid@university.ma',
          institution: 'Mohammed V University',
          expertise_areas: ['Gender Studies', 'Social Work', 'Human Rights'],
          recent_reviews: 5,
          average_review_time: 25,
          availability_status: 'busy',
          conflict_of_interest: false,
          match_score: 82
        },
        {
          id: '4',
          first_name: 'Prof. James',
          last_name: 'Mwangi',
          email: 'james.mwangi@university.ke',
          institution: 'University of Nairobi',
          expertise_areas: ['Rural Development', 'Social Policy', 'Poverty Reduction'],
          recent_reviews: 2,
          average_review_time: 15,
          availability_status: 'available',
          conflict_of_interest: false,
          match_score: 78
        },
        {
          id: '5',
          first_name: 'Dr. Aminata',
          last_name: 'Traore',
          email: 'aminata.traore@university.ml',
          institution: 'University of Bamako',
          expertise_areas: ['Women Empowerment', 'Social Work', 'Community Health'],
          recent_reviews: 4,
          average_review_time: 22,
          availability_status: 'available',
          conflict_of_interest: false,
          match_score: 85
        }
      ];

      setPotentialReviewers(mockReviewers);

      // Set currently assigned reviewers
      if (manuscript.assigned_reviewers && manuscript.assigned_reviewers.length > 0) {
        const assigned = mockReviewers.filter(reviewer => 
          manuscript.assigned_reviewers?.includes(reviewer.id)
        );
        setAssignedReviewers(assigned);
      }

    } catch (error) {
      console.error('Error loading reviewers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviewers = potentialReviewers.filter(reviewer => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = `${reviewer.first_name} ${reviewer.last_name}`.toLowerCase().includes(query);
      const matchesInstitution = reviewer.institution?.toLowerCase().includes(query);
      const matchesExpertise = reviewer.expertise_areas?.some(area => 
        area.toLowerCase().includes(query)
      );
      if (!matchesName && !matchesInstitution && !matchesExpertise) {
        return false;
      }
    }

    // Availability filter
    if (filterCriteria.availability !== 'all' && reviewer.availability_status !== filterCriteria.availability) {
      return false;
    }

    // Workload filter
    if (filterCriteria.workload !== 'all') {
      if (filterCriteria.workload === 'light' && reviewer.recent_reviews! > 2) return false;
      if (filterCriteria.workload === 'moderate' && (reviewer.recent_reviews! <= 2 || reviewer.recent_reviews! > 4)) return false;
      if (filterCriteria.workload === 'heavy' && reviewer.recent_reviews! <= 4) return false;
    }

    // Exclude already assigned reviewers
    return !assignedReviewers.some(assigned => assigned.id === reviewer.id);
  }).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

  const handleAssignReviewer = async (reviewer: PotentialReviewer) => {
    try {
      await onAssignReviewer(manuscript.id, reviewer.id);
      setAssignedReviewers([...assignedReviewers, reviewer]);
    } catch (error) {
      console.error('Error assigning reviewer:', error);
    }
  };

  const handleRemoveReviewer = async (reviewer: PotentialReviewer) => {
    try {
      await onRemoveReviewer(manuscript.id, reviewer.id);
      setAssignedReviewers(assignedReviewers.filter(r => r.id !== reviewer.id));
    } catch (error) {
      console.error('Error removing reviewer:', error);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkloadColor = (reviews: number) => {
    if (reviews <= 2) return 'bg-green-100 text-green-800';
    if (reviews <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Reviewer Assignment</h3>
        <p className="text-gray-600 mt-1">
          Assign qualified peer reviewers for: <span className="font-medium">{manuscript.title}</span>
        </p>
      </div>

      {/* Currently Assigned Reviewers */}
      {assignedReviewers.length > 0 && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Assigned Reviewers ({assignedReviewers.length})</h4>
          <div className="space-y-3">
            {assignedReviewers.map(reviewer => (
              <div key={reviewer.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {reviewer.first_name.charAt(0)}{reviewer.last_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {reviewer.first_name} {reviewer.last_name}
                    </p>
                    <p className="text-gray-600 text-sm">{reviewer.institution}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(reviewer.availability_status)}`}>
                        {reviewer.availability_status}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 text-xs">Avg. {reviewer.average_review_time} days</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveReviewer(reviewer)}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search reviewers by name, institution, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586l-4-2v-2.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={filterCriteria.availability}
                onChange={(e) => setFilterCriteria({...filterCriteria, availability: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workload</label>
              <select
                value={filterCriteria.workload}
                onChange={(e) => setFilterCriteria({...filterCriteria, workload: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="light">Light (≤2 reviews)</option>
                <option value="moderate">Moderate (3-4 reviews)</option>
                <option value="heavy">Heavy (≥5 reviews)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilterCriteria({ availability: 'all', expertise: 'all', workload: 'all' })}
                className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Available Reviewers */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">
            Available Reviewers ({filteredReviewers.length})
          </h4>
          <span className="text-sm text-gray-600">Sorted by match score</span>
        </div>

        {filteredReviewers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500">No reviewers found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter settings.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviewers.map(reviewer => (
              <div key={reviewer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {reviewer.first_name.charAt(0)}{reviewer.last_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {reviewer.first_name} {reviewer.last_name}
                        </h5>
                        <p className="text-gray-600 text-sm">{reviewer.email}</p>
                        <p className="text-gray-600 text-sm">{reviewer.institution}</p>
                      </div>
                    </div>

                    {/* Expertise Areas */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {reviewer.expertise_areas?.map((area, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Reviewer Stats */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(reviewer.availability_status)}`}>
                          {reviewer.availability_status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkloadColor(reviewer.recent_reviews!)}`}>
                          {reviewer.recent_reviews} reviews
                        </span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">Avg. {reviewer.average_review_time} days</span>
                      <span className="text-gray-500">•</span>
                      <span className={`font-semibold ${getMatchScoreColor(reviewer.match_score!)}`}>
                        {reviewer.match_score}% match
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssignReviewer(reviewer)}
                    disabled={reviewer.availability_status === 'unavailable'}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewerAssignmentAdvanced;
