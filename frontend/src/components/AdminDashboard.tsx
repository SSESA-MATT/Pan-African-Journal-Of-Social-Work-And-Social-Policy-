'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { manuscriptsApi, reviewsApi, usersApi, articlesApi } from '../lib/api-client';

type Tab = 'overview' | 'manuscripts' | 'reviews' | 'users' | 'publish';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      if (activeTab === 'overview' || activeTab === 'manuscripts') {
        const [msRes, statRes] = await Promise.all([
          manuscriptsApi.getAll({ limit: 20 }),
          manuscriptsApi.getStatistics(),
        ]);
        setManuscripts(msRes.manuscripts || []);
        setStats(statRes);
      }
      if (activeTab === 'reviews') {
        const res = await reviewsApi.getAll({ limit: 20 });
        setReviews(res.reviews || []);
      }
      if (activeTab === 'users') {
        const res = await usersApi.getAll({ limit: 50 });
        setUsers(res.users || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const statusLabel = (s: string) => s.split('_').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ');
  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800', submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800', revisions_required: 'bg-orange-100 text-orange-800',
      revised: 'bg-purple-100 text-purple-800', accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800', published: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-blue-100 text-blue-800', in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800', declined: 'bg-red-100 text-red-800',
    }; return m[s] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusChange = async (manuscriptId: string, status: string) => {
    try {
      await manuscriptsApi.updateStatus(manuscriptId, { status });
      loadData();
    } catch (err: any) { setError(err.message); }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await usersApi.updateRole(userId, role);
      loadData();
    } catch (err: any) { setError(err.message); }
  };

  if (!user) return null;

  const tabs: { id: Tab; name: string }[] = [
    { id: 'overview', name: 'Overview' },
    { id: 'manuscripts', name: 'Manuscripts' },
    { id: 'reviews', name: 'Reviews' },
    { id: 'users', name: 'Users' },
    { id: 'publish', name: 'Publish' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">Journal management for editors and administrators</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === t.id ? 'border-accent-green text-accent-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >{t.name}</button>
            ))}
          </nav>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green" /></div>
        ) : (
          <>
            {/* ── OVERVIEW ─────── */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(stats.statistics || {}).map(([key, val]) => (
                    <div key={key} className="bg-white shadow rounded-lg p-5">
                      <dt className="text-sm text-gray-500 capitalize">{statusLabel(key)}</dt>
                      <dd className="text-2xl font-bold text-gray-900">{val as number}</dd>
                    </div>
                  ))}
                </div>
                <div className="bg-white shadow rounded-lg p-5">
                  <p className="text-sm text-gray-500">Submissions this month: <span className="font-bold text-gray-900">{stats.totalThisMonth || 0}</span></p>
                </div>
              </div>
            )}

            {/* ── MANUSCRIPTS ─────── */}
            {activeTab === 'manuscripts' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {manuscripts.map((m: any) => (
                      <tr key={m.id || m._id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{m.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {m.submittedBy?.firstName} {m.submittedBy?.lastName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(m.status)}`}>{statusLabel(m.status)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {m.status === 'submitted' && (
                            <button onClick={() => handleStatusChange(m.id || m._id, 'under_review')} className="text-blue-600 hover:underline">Start Review</button>
                          )}
                          {m.status === 'under_review' && (
                            <>
                              <button onClick={() => handleStatusChange(m.id || m._id, 'accepted')} className="text-green-600 hover:underline">Accept</button>
                              <button onClick={() => handleStatusChange(m.id || m._id, 'revisions_required')} className="text-orange-600 hover:underline">Revisions</button>
                              <button onClick={() => handleStatusChange(m.id || m._id, 'rejected')} className="text-red-600 hover:underline">Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {manuscripts.length === 0 && <div className="py-12 text-center text-gray-500">No manuscripts found.</div>}
              </div>
            )}

            {/* ── REVIEWS ─────── */}
            {activeTab === 'reviews' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manuscript</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reviews.map((r: any) => (
                      <tr key={r.id || r._id}>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{r.manuscript?.title || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{r.reviewer?.firstName} {r.reviewer?.lastName}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>{statusLabel(r.status)}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-500">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{r.recommendation ? statusLabel(r.recommendation) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reviews.length === 0 && <div className="py-12 text-center text-gray-500">No reviews found.</div>}
              </div>
            )}

            {/* ── USERS ─────── */}
            {activeTab === 'users' && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u: any) => (
                      <tr key={u.id || u._id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id || u._id, e.target.value)}
                            className="text-sm border-gray-300 rounded-md"
                          >
                            {['author', 'reviewer', 'editor', 'admin'].map(r => (
                              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button onClick={() => usersApi.remove(u.id || u._id).then(loadData).catch((e: any) => setError(e.message))} className="text-red-600 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <div className="py-12 text-center text-gray-500">No users found.</div>}
              </div>
            )}

            {/* ── PUBLISH ─────── */}
            {activeTab === 'publish' && <PublishPanel />}
          </>
        )}
      </div>
    </div>
  );
};

/** Inline sub-component: publish an accepted manuscript as an article */
function PublishPanel() {
  const [accepted, setAccepted] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [newVol, setNewVol] = useState({ volumeNumber: '', year: '', title: '' });
  const [newIssue, setNewIssue] = useState({ volumeId: '', issueNumber: '', title: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [msRes, volRes] = await Promise.all([
        manuscriptsApi.getAll({ status: 'accepted', limit: 50 }),
        articlesApi.getVolumes(),
      ]);
      setAccepted(msRes.manuscripts || []);
      setVolumes(volRes.volumes || []);
    } catch { /* */ } finally { setLoading(false); }
  };

  const publish = async (manuscriptId: string, volumeId: string, issueId: string) => {
    try {
      await articlesApi.publish({ manuscriptId, volumeId, issueId });
      setMsg('Article published successfully!');
      load();
    } catch (err: any) { setMsg(err.message); }
  };

  const createVolume = async () => {
    try {
      await articlesApi.createVolume({ volumeNumber: +newVol.volumeNumber, year: +newVol.year, title: newVol.title });
      setNewVol({ volumeNumber: '', year: '', title: '' }); load();
    } catch (err: any) { setMsg(err.message); }
  };

  const createIssue = async () => {
    try {
      await articlesApi.createIssue({ volumeId: newIssue.volumeId, issueNumber: +newIssue.issueNumber, title: newIssue.title });
      setNewIssue({ volumeId: '', issueNumber: '', title: '' }); load();
    } catch (err: any) { setMsg(err.message); }
  };

  if (loading) return <div className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green mx-auto" /></div>;

  return (
    <div className="space-y-8">
      {msg && <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-700">{msg}</div>}

      {/* Create Volume */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Volume</h3>
        <div className="flex items-end gap-4 flex-wrap">
          <div><label className="block text-sm text-gray-600">Number</label><input type="number" value={newVol.volumeNumber} onChange={e => setNewVol(p => ({ ...p, volumeNumber: e.target.value }))} className="mt-1 border-gray-300 rounded-md shadow-sm text-sm w-24" /></div>
          <div><label className="block text-sm text-gray-600">Year</label><input type="number" value={newVol.year} onChange={e => setNewVol(p => ({ ...p, year: e.target.value }))} className="mt-1 border-gray-300 rounded-md shadow-sm text-sm w-24" /></div>
          <div className="flex-1"><label className="block text-sm text-gray-600">Title</label><input value={newVol.title} onChange={e => setNewVol(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm" /></div>
          <button onClick={createVolume} className="px-4 py-2 bg-accent-green text-white rounded-md text-sm hover:bg-accent-green/80">Create</button>
        </div>
      </div>

      {/* Create Issue */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Issue</h3>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-sm text-gray-600">Volume</label>
            <select value={newIssue.volumeId} onChange={e => setNewIssue(p => ({ ...p, volumeId: e.target.value }))} className="mt-1 border-gray-300 rounded-md shadow-sm text-sm">
              <option value="">Select volume</option>
              {volumes.map((v: any) => <option key={v.id || v._id} value={v.id || v._id}>Vol. {v.volumeNumber} ({v.year})</option>)}
            </select>
          </div>
          <div><label className="block text-sm text-gray-600">Issue #</label><input type="number" value={newIssue.issueNumber} onChange={e => setNewIssue(p => ({ ...p, issueNumber: e.target.value }))} className="mt-1 border-gray-300 rounded-md shadow-sm text-sm w-24" /></div>
          <div className="flex-1"><label className="block text-sm text-gray-600">Title</label><input value={newIssue.title} onChange={e => setNewIssue(p => ({ ...p, title: e.target.value }))} className="mt-1 w-full border-gray-300 rounded-md shadow-sm text-sm" /></div>
          <button onClick={createIssue} className="px-4 py-2 bg-accent-green text-white rounded-md text-sm hover:bg-accent-green/80">Create</button>
        </div>
      </div>

      {/* Accepted Manuscripts ready to publish */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Accepted Manuscripts</h3>
        {accepted.length === 0 ? (
          <p className="text-gray-500 text-sm">No accepted manuscripts waiting to be published.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {accepted.map((m: any) => (
              <li key={m.id || m._id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{m.title}</p>
                  <p className="text-sm text-gray-500">{m.submittedBy?.firstName} {m.submittedBy?.lastName}</p>
                </div>
                <PublishButton manuscriptId={m.id || m._id} volumes={volumes} onPublish={publish} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PublishButton({ manuscriptId, volumes, onPublish }: { manuscriptId: string; volumes: any[]; onPublish: (mid: string, vid: string, iid: string) => void }) {
  const [volumeId, setVolumeId] = useState('');
  const [issueId, setIssueId] = useState('');
  const selectedVolume = volumes.find((v: any) => (v.id || v._id) === volumeId);

  return (
    <div className="flex items-center gap-2">
      <select value={volumeId} onChange={e => { setVolumeId(e.target.value); setIssueId(''); }} className="text-sm border-gray-300 rounded-md">
        <option value="">Volume</option>
        {volumes.map((v: any) => <option key={v.id || v._id} value={v.id || v._id}>Vol. {v.volumeNumber}</option>)}
      </select>
      <select value={issueId} onChange={e => setIssueId(e.target.value)} className="text-sm border-gray-300 rounded-md" disabled={!volumeId}>
        <option value="">Issue</option>
        {selectedVolume?.issues?.map((i: any) => <option key={i.id || i._id} value={i.id || i._id}>Issue {i.issueNumber}</option>)}
      </select>
      <button onClick={() => onPublish(manuscriptId, volumeId, issueId)} disabled={!volumeId || !issueId} className="px-3 py-1.5 bg-accent-green text-white rounded-md text-sm disabled:opacity-50 hover:bg-accent-green/80">Publish</button>
    </div>
  );
}
