'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { userApi } from '@/lib/userApi';

interface UserAnalyticsData {
  totalUsers: number;
  roleDistribution: Record<string, number>;
  recentRegistrations: number;
  monthlyGrowth: Array<{
    month: string;
    count: number;
  }>;
  topAffiliations: Array<{
    affiliation: string;
    count: number;
  }>;
}

export const UserAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<UserAnalyticsData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all users to calculate analytics
      const response = await userApi.getAllUsers();
      if (response.data) {
        setUsers(response.data);
        calculateAnalytics(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = (userData: User[]) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Role distribution
    const roleDistribution = userData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent registrations (last 30 days)
    const recentRegistrations = userData.filter(
      user => new Date(user.created_at) > thirtyDaysAgo
    ).length;

    // Monthly growth (last 6 months)
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const count = userData.filter(user => {
        const createdAt = new Date(user.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).length;

      monthlyGrowth.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count
      });
    }

    // Top affiliations
    const affiliationCounts = userData.reduce((acc, user) => {
      if (user.affiliation) {
        acc[user.affiliation] = (acc[user.affiliation] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topAffiliations = Object.entries(affiliationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([affiliation, count]) => ({ affiliation, count }));

    setAnalytics({
      totalUsers: userData.length,
      roleDistribution,
      recentRegistrations,
      monthlyGrowth,
      topAffiliations
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'editor':
        return 'bg-green-500';
      case 'reviewer':
        return 'bg-blue-500';
      case 'author':
        return 'bg-neutral-500';
      default:
        return 'bg-neutral-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        <span className="ml-3 text-neutral-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Total Users</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">New This Month</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics.recentRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Reviewers</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics.roleDistribution.reviewer || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Authors</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics.roleDistribution.author || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Role Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(analytics.roleDistribution).map(([role, count]) => {
                const percentage = (count / analytics.totalUsers) * 100;
                return (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700 capitalize">{role}s</span>
                      <span className="text-sm text-neutral-600">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getRoleColor(role)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Registration Trend</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.monthlyGrowth.map((month, index) => {
                const maxCount = Math.max(...analytics.monthlyGrowth.map(m => m.count));
                const percentage = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">{month.month}</span>
                      <span className="text-sm text-neutral-600">{month.count} users</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-accent-green"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Affiliations */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Top Affiliations</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {analytics.topAffiliations.map((affiliation, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-neutral-700 truncate flex-1 mr-4">
                  {affiliation.affiliation}
                </span>
                <span className="text-sm font-medium text-neutral-900">
                  {affiliation.count} user{affiliation.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};