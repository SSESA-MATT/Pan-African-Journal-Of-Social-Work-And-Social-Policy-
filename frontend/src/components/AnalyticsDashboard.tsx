'use client';

import React, { useState, useEffect } from 'react';
import { User } from '../types/auth';

interface AnalyticsDashboardProps {
  currentUser: User;
}

interface SubmissionMetrics {
  total_submissions: number;
  submissions_this_month: number;
  submission_growth_rate: number;
  acceptance_rate: number;
  average_time_to_decision: number;
  manuscripts_by_status: {
    submitted: number;
    under_review: number;
    revisions_required: number;
    accepted: number;
    rejected: number;
    published: number;
  };
}

interface GeographicData {
  country: string;
  submissions: number;
  acceptances: number;
  authors: number;
}

interface TopicTrend {
  keyword: string;
  frequency: number;
  growth: number;
}

interface ReviewerMetrics {
  total_active_reviewers: number;
  average_reviews_per_reviewer: number;
  average_review_time: number;
  reviewer_satisfaction_rate: number;
  top_reviewers: Array<{
    name: string;
    reviews_completed: number;
    average_rating: number;
  }>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ currentUser }) => {
  const [submissionMetrics, setSubmissionMetrics] = useState<SubmissionMetrics | null>(null);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [topicTrends, setTopicTrends] = useState<TopicTrend[]>([]);
  const [reviewerMetrics, setReviewerMetrics] = useState<ReviewerMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y'>('6m');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Mock analytics data - in real implementation, this would come from APIs
      const mockSubmissionMetrics: SubmissionMetrics = {
        total_submissions: 348,
        submissions_this_month: 23,
        submission_growth_rate: 12.5,
        acceptance_rate: 35.2,
        average_time_to_decision: 42,
        manuscripts_by_status: {
          submitted: 45,
          under_review: 67,
          revisions_required: 34,
          accepted: 89,
          rejected: 78,
          published: 35
        }
      };

      const mockGeographicData: GeographicData[] = [
        { country: 'South Africa', submissions: 89, acceptances: 31, authors: 156 },
        { country: 'Nigeria', submissions: 67, acceptances: 23, authors: 134 },
        { country: 'Kenya', submissions: 45, acceptances: 16, authors: 89 },
        { country: 'Ghana', submissions: 34, acceptances: 12, authors: 67 },
        { country: 'Ethiopia', submissions: 28, acceptances: 9, authors: 45 },
        { country: 'Uganda', submissions: 25, acceptances: 8, authors: 43 },
        { country: 'Tanzania', submissions: 23, acceptances: 7, authors: 38 },
        { country: 'Morocco', submissions: 19, acceptances: 7, authors: 34 },
        { country: 'Egypt', submissions: 18, acceptances: 6, authors: 29 }
      ];

      const mockTopicTrends: TopicTrend[] = [
        { keyword: 'Community Development', frequency: 45, growth: 23.5 },
        { keyword: 'Social Work Practice', frequency: 38, growth: 18.2 },
        { keyword: 'Child Welfare', frequency: 32, growth: 15.7 },
        { keyword: 'Mental Health', frequency: 29, growth: 34.8 },
        { keyword: 'Gender Equality', frequency: 27, growth: 21.3 },
        { keyword: 'Rural Development', frequency: 24, growth: 12.9 },
        { keyword: 'Social Policy', frequency: 22, growth: 8.6 },
        { keyword: 'Youth Empowerment', frequency: 19, growth: 45.2 },
        { keyword: 'Poverty Alleviation', frequency: 17, growth: 19.4 },
        { keyword: 'Human Rights', frequency: 15, growth: 28.1 }
      ];

      const mockReviewerMetrics: ReviewerMetrics = {
        total_active_reviewers: 156,
        average_reviews_per_reviewer: 3.2,
        average_review_time: 21,
        reviewer_satisfaction_rate: 87.5,
        top_reviewers: [
          { name: 'Dr. Sarah Johnson', reviews_completed: 12, average_rating: 4.9 },
          { name: 'Prof. Michael Okafor', reviews_completed: 11, average_rating: 4.8 },
          { name: 'Dr. Fatima Al-Rashid', reviews_completed: 10, average_rating: 4.7 },
          { name: 'Prof. James Mwangi', reviews_completed: 9, average_rating: 4.6 },
          { name: 'Dr. Aminata Traore', reviews_completed: 8, average_rating: 4.8 }
        ]
      };

      setSubmissionMetrics(mockSubmissionMetrics);
      setGeographicData(mockGeographicData);
      setTopicTrends(mockTopicTrends);
      setReviewerMetrics(mockReviewerMetrics);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500';
      case 'under_review': return 'bg-yellow-500';
      case 'revisions_required': return 'bg-orange-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'published': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatGrowthRate = (rate: number) => {
    const isPositive = rate >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <svg className={`w-4 h-4 mr-1 ${isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        {Math.abs(rate)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Journal Analytics</h1>
              <p className="text-gray-600 mt-2">Insights and metrics for Pan African Journal of Social Work and Social Policy</p>
            </div>

            {/* Time Range Selector */}
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200">
              {[
                { value: '1m', label: '1M' },
                { value: '3m', label: '3M' },
                { value: '6m', label: '6M' },
                { value: '1y', label: '1Y' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as any)}
                  className={`px-4 py-2 text-sm font-medium ${
                    timeRange === option.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${option.value === '1m' ? 'rounded-l-lg' : ''} ${option.value === '1y' ? 'rounded-r-lg' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        {submissionMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Submissions</p>
                  <p className="text-3xl font-bold text-gray-900">{submissionMetrics.total_submissions}</p>
                  <div className="mt-1">
                    {formatGrowthRate(submissionMetrics.submission_growth_rate)}
                  </div>
                </div>
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Acceptance Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{submissionMetrics.acceptance_rate}%</p>
                  <p className="text-green-600 text-sm">Industry average: 32%</p>
                </div>
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Avg. Decision Time</p>
                  <p className="text-3xl font-bold text-gray-900">{submissionMetrics.average_time_to_decision}</p>
                  <p className="text-yellow-600 text-sm">days</p>
                </div>
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{submissionMetrics.submissions_this_month}</p>
                  <p className="text-purple-600 text-sm">new submissions</p>
                </div>
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Manuscript Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Manuscript Status Distribution</h3>
            
            {submissionMetrics && (
              <div className="space-y-4">
                {Object.entries(submissionMetrics.manuscripts_by_status).map(([status, count]) => {
                  const total = Object.values(submissionMetrics.manuscripts_by_status).reduce((a, b) => a + b, 0);
                  const percentage = (count / total) * 100;
                  
                  return (
                    <div key={status} className="flex items-center">
                      <div className="flex items-center flex-grow">
                        <div className={`w-4 h-4 rounded-full mr-3 ${getStatusColor(status)}`}></div>
                        <span className="text-sm font-medium text-gray-700 capitalize mr-2">
                          {status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">({count})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className={`h-2 rounded-full ${getStatusColor(status)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Geographic Distribution</h3>
            <div className="space-y-3">
              {geographicData.slice(0, 6).map((country, index) => {
                const maxSubmissions = Math.max(...geographicData.map(c => c.submissions));
                const barWidth = (country.submissions / maxSubmissions) * 100;
                
                return (
                  <div key={country.country} className="flex items-center">
                    <div className="w-20 text-sm text-gray-600 flex-shrink-0">
                      {country.country}
                    </div>
                    <div className="flex-grow mx-4">
                      <div className="bg-gray-200 rounded-full h-3 relative">
                        <div 
                          className="bg-blue-500 h-3 rounded-full"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-900 font-medium w-8">
                        {country.submissions}
                      </span>
                      <span className="text-green-600 w-8">
                        {country.acceptances}
                      </span>
                      <span className="text-gray-500 w-8">
                        {country.authors}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex justify-end text-xs text-gray-500 mt-4 space-x-4">
                <span>Submissions</span>
                <span className="text-green-600">Accepted</span>
                <span>Authors</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Topic Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Research Topic Trends</h3>
            <div className="space-y-4">
              {topicTrends.slice(0, 8).map((topic, index) => (
                <div key={topic.keyword} className="flex items-center justify-between">
                  <div className="flex items-center flex-grow">
                    <span className="text-sm font-medium text-gray-700 mr-3">
                      {topic.keyword}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({topic.frequency} papers)
                    </span>
                  </div>
                  <div className="flex items-center">
                    {formatGrowthRate(topic.growth)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviewer Performance */}
          {reviewerMetrics && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Reviewer Performance</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{reviewerMetrics.total_active_reviewers}</p>
                  <p className="text-sm text-gray-600">Active Reviewers</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{reviewerMetrics.average_review_time}</p>
                  <p className="text-sm text-gray-600">Avg. Review Days</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Top Performing Reviewers</h4>
                <div className="space-y-3">
                  {reviewerMetrics.top_reviewers.map((reviewer, index) => (
                    <div key={reviewer.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-sm font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reviewer.name}</p>
                          <p className="text-xs text-gray-500">{reviewer.reviews_completed} reviews</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(reviewer.average_rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-1 text-xs text-gray-600">{reviewer.average_rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
