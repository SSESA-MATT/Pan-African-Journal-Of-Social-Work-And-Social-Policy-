'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { authApi } from '@/lib/api-client';
import { User } from '@/types/auth';

type ProfileTab = 'overview' | 'edit' | 'password';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    affiliation: '',
    bio: '',
    orcid: '',
    expertise: '' // comma-separated for input
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await authApi.getProfile();
      setProfile(data.user);
      setEditForm({
        firstName: data.user.first_name || '',
        lastName: data.user.last_name || '',
        affiliation: data.user.affiliation || '',
        bio: data.user.bio || '',
        orcid: data.user.orcid || '',
        expertise: (data.user.expertise || []).join(', ')
      });
    } catch {
      // fallback to context user
      if (user) {
        setProfile(user);
        setEditForm({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          affiliation: user.affiliation || '',
          bio: (user as any).bio || '',
          orcid: (user as any).orcid || '',
          expertise: ((user as any).expertise || []).join(', ')
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError('');
    setEditSuccess('');

    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        affiliation: editForm.affiliation.trim(),
        bio: editForm.bio.trim(),
        orcid: editForm.orcid.trim(),
        expertise: editForm.expertise
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      };

      const data = await authApi.updateProfile(payload);
      setProfile(data.user);
      await refreshUser();
      setEditSuccess('Profile updated successfully!');
      setTimeout(() => setEditSuccess(''), 3000);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setEditSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }

    setPwSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPwSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'reviewer': return 'bg-amber-100 text-amber-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setEditError('Only JPEG, PNG, WebP, and GIF images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEditError('Image must be under 5 MB.');
      return;
    }

    setAvatarUploading(true);
    setEditError('');
    try {
      const data = await authApi.uploadAvatar(file);
      setProfile(data.user);
      await refreshUser();
    } catch (err: any) {
      setEditError(err.message || 'Failed to upload profile picture.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    if (!confirm('Remove your profile picture?')) return;
    setAvatarUploading(true);
    try {
      const data = await authApi.deleteAvatar();
      setProfile(data.user);
      await refreshUser();
    } catch (err: any) {
      setEditError(err.message || 'Failed to remove profile picture.');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-green" />
        </div>
      </ProtectedRoute>
    );
  }

  const p = profile || user;
  if (!p) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-accent-green to-accent-green/70 h-32" />
            <div className="px-6 pb-6 -mt-12">
              <div className="flex items-end gap-4">
                {/* Avatar with upload overlay */}
                <div className="relative group">
                  {p.profile_picture ? (
                    <img
                      src={p.profile_picture}
                      alt={`${p.first_name} ${p.last_name}`}
                      className="w-24 h-24 rounded-full border-4 border-white shadow object-cover bg-white"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow flex items-center justify-center text-3xl font-bold text-accent-green">
                      {p.first_name?.[0]}{p.last_name?.[0]}
                    </div>
                  )}
                  {/* Upload overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    title="Change profile picture"
                  >
                    {avatarUploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{p.first_name} {p.last_name}</h1>
                  <p className="text-gray-500">{p.email}</p>
                </div>
                <div className="pb-1 ml-auto flex items-center gap-2">
                  {p.profile_picture && (
                    <button
                      onClick={handleAvatarRemove}
                      disabled={avatarUploading}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Remove profile picture"
                    >
                      Remove photo
                    </button>
                  )}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleBadgeColor(p.role)}`}>
                    {p.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {([
                { key: 'overview', label: 'Overview', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { key: 'edit', label: 'Edit Profile', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                { key: 'password', label: 'Change Password', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
              ] as { key: ProfileTab; label: string; icon: string }[]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-accent-green text-accent-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm text-gray-500">Full Name</dt>
                    <dd className="text-gray-900 font-medium">{p.first_name} {p.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-gray-900">{p.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Affiliation</dt>
                    <dd className="text-gray-900">{p.affiliation || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">ORCID</dt>
                    <dd className="text-gray-900">
                      {p.orcid ? (
                        <a href={`https://orcid.org/${p.orcid}`} target="_blank" rel="noopener noreferrer"
                          className="text-accent-green hover:underline">{p.orcid}</a>
                      ) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Role</dt>
                    <dd>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(p.role)}`}>
                        {p.role}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Member Since</dt>
                    <dd className="text-gray-900">{new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                  </div>
                </dl>
              </div>

              {/* Bio & Expertise */}
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Biography</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {(p as any).bio || 'No biography added yet. Click "Edit Profile" to add one.'}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Areas of Expertise</h2>
                  {(p as any).expertise?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(p as any).expertise.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No expertise tags added yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── EDIT PROFILE TAB ── */}
          {activeTab === 'edit' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h2>

              {editSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
                  {editSuccess}
                </div>
              )}
              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName}
                      onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName}
                      onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Affiliation / Institution</label>
                  <input
                    type="text"
                    value={editForm.affiliation}
                    onChange={e => setEditForm({ ...editForm, affiliation: e.target.value })}
                    placeholder="e.g. University of Nairobi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ORCID</label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
                      https://orcid.org/
                    </span>
                    <input
                      type="text"
                      value={editForm.orcid}
                      onChange={e => setEditForm({ ...editForm, orcid: e.target.value })}
                      placeholder="0000-0000-0000-0000"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Your ORCID iD for academic identification</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
                  <input
                    type="text"
                    value={editForm.expertise}
                    onChange={e => setEditForm({ ...editForm, expertise: e.target.value })}
                    placeholder="e.g. Social Policy, Child Welfare, Community Development"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate multiple areas with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={6}
                    placeholder="Tell us about your academic background, research interests, and experience..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('overview'); loadProfile(); }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-6 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors disabled:opacity-50 font-medium"
                  >
                    {editSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── CHANGE PASSWORD TAB ── */}
          {activeTab === 'password' && (
            <div className="max-w-lg">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

                {pwSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
                    {pwSuccess}
                  </div>
                )}
                {pwError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                    {pwError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={pwSaving}
                      className="px-6 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors disabled:opacity-50 font-medium"
                    >
                      {pwSaving ? 'Changing…' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Security Tip</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Use a strong password with a mix of uppercase, lowercase, numbers, and special characters. Avoid reusing passwords from other sites.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
