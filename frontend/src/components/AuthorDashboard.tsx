'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { manuscriptsApi } from '../lib/api-client';
import ManuscriptSubmissionForm from './ManuscriptSubmissionForm';

const AuthorDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'new-submission' | 'manuscripts'>('overview');
  const [selectedManuscript, setSelectedManuscript] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && !authLoading) loadManuscripts();
    else if (!authLoading && !user) { setError('Please log in to view your manuscripts'); setLoading(false); }
  }, [user, authLoading]);

  const loadManuscripts = async () => {
    try {
      setLoading(true); setError(null);
      const res = await manuscriptsApi.getMy();
      setManuscripts(Array.isArray(res.manuscripts) ? res.manuscripts : []);
    } catch (err: any) {
      console.error('Failed to load manuscripts:', err);
      setError(err.message || 'Failed to load manuscripts');
      setManuscripts([]);
    } finally { setLoading(false); }
  };

  /* ── helpers ─────── */
  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800', submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800', revisions_required: 'bg-orange-100 text-orange-800',
      revised: 'bg-purple-100 text-purple-800', accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800', published: 'bg-emerald-100 text-emerald-800',
    }; return map[s] || 'bg-gray-100 text-gray-800';
  };
  const statusLabel = (s: string) => s.split('_').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ');

  const authorNames = (authors: any[]) =>
    authors?.map((a: any) => typeof a === 'string' ? a : a.name).join(', ') || '';

  const ms = manuscripts;
  const stats = {
    total: ms.length,
    submitted: ms.filter(m => m.status === 'submitted').length,
    underReview: ms.filter(m => m.status === 'under_review').length,
    accepted: ms.filter(m => m.status === 'accepted').length,
    published: ms.filter(m => m.status === 'published').length,
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.first_name}! Manage your manuscripts and submissions.</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {(['overview', 'manuscripts', 'new-submission'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab === 'new-submission' ? 'New Submission' : tab === 'manuscripts' ? 'My Manuscripts' : 'Overview'}
              </button>
            ))}
          </nav>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">{error}</div>
        )}

        {/* ── OVERVIEW TAB ─────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green" />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total', value: stats.total, color: 'bg-blue-500' },
                    { label: 'Under Review', value: stats.underReview, color: 'bg-yellow-500' },
                    { label: 'Accepted', value: stats.accepted, color: 'bg-green-500' },
                    { label: 'Published', value: stats.published, color: 'bg-emerald-500' },
                  ].map(c => (
                    <div key={c.label} className="bg-white shadow rounded-lg p-5 flex items-center space-x-4">
                      <div className={`w-10 h-10 ${c.color} rounded-md flex items-center justify-center text-white font-bold`}>{c.value}</div>
                      <div>
                        <dt className="text-sm text-gray-500">{c.label}</dt>
                        <dd className="text-lg font-medium text-gray-900">{c.value}</dd>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent manuscripts */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Manuscripts</h3>
                  </div>
                  {ms.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <p>No manuscripts yet.</p>
                      <button onClick={() => setActiveTab('new-submission')} className="mt-4 px-4 py-2 bg-accent-green text-white rounded-md text-sm hover:bg-accent-green/80">Create New Manuscript</button>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {ms.slice(0, 5).map((m: any) => (
                        <li key={m.id || m._id} className="px-6 py-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{m.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {authorNames(m.authors)} &middot; {new Date(m.updatedAt || m.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(m.status)}`}>{statusLabel(m.status)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── MANUSCRIPTS TAB ─────── */}
        {activeTab === 'manuscripts' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">All Manuscripts</h3>
              <button onClick={() => setActiveTab('new-submission')} className="px-4 py-2 bg-accent-green text-white rounded-md text-sm hover:bg-accent-green/80">New Submission</button>
            </div>
            {loading ? (
              <div className="py-12 text-center text-gray-500">Loading...</div>
            ) : ms.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p>No manuscripts found.</p>
                <button onClick={() => setActiveTab('new-submission')} className="mt-4 px-4 py-2 bg-accent-green text-white rounded-md text-sm">Create Your First Manuscript</button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {ms.map((m: any) => (
                  <li key={m.id || m._id} className="px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-3">
                          <h4 className="text-base font-medium text-gray-900">{m.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(m.status)}`}>{statusLabel(m.status)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.abstract}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {authorNames(m.authors)} &middot; {new Date(m.createdAt).toLocaleDateString()}
                          {m.category && <> &middot; {m.category}</>}
                        </p>
                      </div>
                      <button onClick={() => setSelectedManuscript(m)} className="text-accent-green hover:underline text-sm font-medium whitespace-nowrap">View</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── NEW SUBMISSION TAB ─────── */}
        {activeTab === 'new-submission' && (
          <ManuscriptSubmissionForm onSubmissionComplete={() => { loadManuscripts(); setActiveTab('manuscripts'); }} />
        )}
      </div>

      {/* ── Manuscript Detail Modal ─────── */}
      {selectedManuscript && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500/75" onClick={() => setSelectedManuscript(null)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedManuscript.title}</h3>
                <button onClick={() => setSelectedManuscript(null)} className="text-gray-400 hover:text-gray-500 text-2xl leading-none">&times;</button>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(selectedManuscript.status)}`}>{statusLabel(selectedManuscript.status)}</span>
              <div className="mt-4 space-y-4 text-sm">
                <div><h4 className="font-medium text-gray-900">Abstract</h4><p className="text-gray-700 mt-1">{selectedManuscript.abstract}</p></div>
                <div><h4 className="font-medium text-gray-900">Authors</h4><p className="text-gray-700 mt-1">{authorNames(selectedManuscript.authors)}</p></div>
                {selectedManuscript.keywords?.length > 0 && (
                  <div><h4 className="font-medium text-gray-900">Keywords</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedManuscript.keywords.map((kw: string, i: number) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedManuscript.editorComments && (
                  <div><h4 className="font-medium text-gray-900">Editor Comments</h4><p className="text-gray-700 mt-1">{selectedManuscript.editorComments}</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorDashboard;
