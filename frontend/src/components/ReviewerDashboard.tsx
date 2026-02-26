'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { reviewsApi } from '../lib/api-client';
import {
  RECOMMENDATION_LABELS,
  RECOMMENDATION_COLORS,
  type RecommendationType,
} from '../types/review';

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [completedReviews, setCompletedReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, pendingCount: 0, completedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewsApi.getDashboard();
      setPendingReviews(data.pendingReviews || []);
      setCompletedReviews(data.completedReviews || []);
      setStats(data.reviewStats || { totalReviews: 0, pendingCount: 0, completedCount: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const truncate = (t: string, max = 200) => (t && t.length > max ? t.slice(0, max) + '…' : t || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-green mx-auto" />
          <p className="mt-4 text-gray-600">Loading reviewer dashboard…</p>
        </div>
      </div>
    );
  }

  /* Empty state — reviewer with no assignments */
  if (!error && stats.totalReviews === 0 && stats.pendingCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center px-6">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Reviewer!</h2>
          <p className="text-gray-600 mb-6">
            You haven&apos;t been assigned any manuscripts to review yet.
            An editor will assign manuscripts to you soon.
          </p>
          <button onClick={loadDashboard} className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">⚠️</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadDashboard} className="bg-accent-green text-white px-4 py-2 rounded-md hover:bg-accent-green/80">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reviewer Dashboard</h1>
          <p className="mt-1 text-gray-600">Manage your manuscript reviews and track review activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-gray-500">Pending Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-gray-500">Completed Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm text-gray-500">Total Assignments</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending' ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({stats.pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed' ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed ({stats.completedCount})
            </button>
          </nav>
        </div>

        {/* ── PENDING ─────── */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900">No Pending Reviews</h3>
                <p className="text-gray-500 mt-1">You have no manuscripts waiting for review.</p>
              </div>
            ) : (
              pendingReviews.map((r: any) => {
                const ms = r.manuscript || {};
                const overdue = r.dueDate && new Date(r.dueDate) < new Date();
                return (
                  <div key={r.id || r._id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{ms.title || 'Untitled'}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {truncate(ms.abstract || '', 250)}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>Assigned: {fmt(r.createdAt)}</span>
                          <span>Due: {fmt(r.dueDate)}</span>
                          <span className={`px-2 py-0.5 rounded-full font-medium ${overdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {overdue ? 'Overdue' : r.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </span>
                          {ms.category && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{ms.category}</span>}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={() => router.push(`/reviewer/review/${r.id || r._id}`)}
                          className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 text-sm"
                        >
                          {r.status === 'pending' ? 'Start Review' : 'Continue Review'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── COMPLETED ─────── */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            {completedReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900">No Completed Reviews</h3>
                <p className="text-gray-500 mt-1">You haven&apos;t completed any reviews yet.</p>
              </div>
            ) : (
              completedReviews.map((r: any) => {
                const ms = r.manuscript || {};
                return (
                  <div key={r.id || r._id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{ms.title || 'Untitled'}</h3>
                        <p className="text-sm text-gray-600 mb-3">{truncate(ms.abstract || '', 150)}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>Completed: {fmt(r.completedAt || r.updatedAt)}</span>
                          {r.recommendation && (
                            <span className={`px-2 py-0.5 rounded-full font-medium ${RECOMMENDATION_COLORS[r.recommendation as RecommendationType] || 'bg-gray-100 text-gray-700'}`}>
                              {RECOMMENDATION_LABELS[r.recommendation as RecommendationType] || r.recommendation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {r.comments && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Review Comments</h4>
                        <p className="text-sm text-gray-600">{truncate(r.comments, 300)}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
