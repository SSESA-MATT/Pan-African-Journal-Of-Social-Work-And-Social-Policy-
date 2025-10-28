'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { CreateUserRequest, UsersResponse, UserStats, ApiResponse } from '@/types/user';
import { userApi } from '@/lib/userApi';

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedRole, setSelectedRole] = useState<User['role'] | 'all'>('all');
  const [selectedRoles, setSelectedRoles] = useState<User['role'][]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'role' | 'email' | 'deactivate' | ''>('');
  const [bulkRole, setBulkRole] = useState<User['role']>('author');
  const [bulkEmailSubject, setBulkEmailSubject] = useState('');
  const [bulkEmailMessage, setBulkEmailMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    affiliation: '',
    role: 'author'
  });

  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    affiliation: '',
    email: '',
    role: 'author' as User['role']
  });

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedRole, selectedRoles, searchTerm, expertiseFilter, activityFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to sync users from auth, then load all users
      try {
        const syncResponse = await fetch('/api/admin/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          if (syncData.users) {
            setUsers(syncData.users);
            console.log(`Loaded ${syncData.users.length} users, synced ${syncData.synced} from auth`);
            return;
          }
        }
      } catch (syncError) {
        console.log('Sync failed, falling back to regular API:', syncError);
      }

      // Fallback to regular users API
      const response = await userApi.getAllUsers();
      if (response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await userApi.getUserStats();
      if (response.data) {
        setUserStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Role filtering (support multiple roles)
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(user => selectedRoles.includes(user.role));
    }

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.affiliation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Expertise filtering
    if (expertiseFilter) {
      filtered = filtered.filter(user => 
        user.expertise && user.expertise.some(exp => 
          exp.toLowerCase().includes(expertiseFilter.toLowerCase())
        )
      );
    }

    // Activity filtering (mock implementation - would need real last_login data)
    if (activityFilter !== 'all') {
      // For now, consider users created in last 30 days as "active"
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (activityFilter === 'active') {
        filtered = filtered.filter(user => new Date(user.created_at) > thirtyDaysAgo);
      } else {
        filtered = filtered.filter(user => new Date(user.created_at) <= thirtyDaysAgo);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await userApi.createUser(createForm);
      if (response.success && response.data) {
        setUsers(prev => [...prev, response.data!]);
        setShowCreateModal(false);
        setCreateForm({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          affiliation: '',
          role: 'author'
        });
        await loadUserStats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setIsUpdating(true);
      setError(null);

      const response = await userApi.updateUser(selectedUser.id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        affiliation: editForm.affiliation,
        email: editForm.email
      });

      if (response.success && response.data) {
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id ? response.data! : user
        ));
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(userId);
      setError(null);

      const response = await userApi.deleteUser(userId);
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        await loadUserStats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      setIsBulkProcessing(true);
      setError(null);

      switch (bulkAction) {
        case 'role':
          // Bulk role change
          const rolePromises = selectedUsers.map(userId => 
            userApi.updateUserRole(userId, bulkRole)
          );
          await Promise.all(rolePromises);
          
          // Update local state
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) ? { ...user, role: bulkRole } : user
          ));
          break;

        case 'email':
          // Bulk email (mock implementation - would need email service)
          console.log('Sending bulk email:', {
            recipients: selectedUsers,
            subject: bulkEmailSubject,
            message: bulkEmailMessage
          });
          // In real implementation, call email API
          break;

        case 'deactivate':
          // Bulk deactivation (mock implementation - would need user status field)
          console.log('Deactivating users:', selectedUsers);
          // In real implementation, update user status
          break;
      }

      setSelectedUsers([]);
      setBulkAction('');
      setShowBulkModal(false);
      await loadUserStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Affiliation', 'Joined', 'Expertise'].join(','),
      ...filteredUsers.map(user => [
        `"${user.first_name} ${user.last_name}"`,
        user.email,
        user.role,
        `"${user.affiliation}"`,
        new Date(user.created_at).toLocaleDateString(),
        `"${user.expertise?.join('; ') || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      affiliation: user.affiliation,
      email: user.email,
      role: user.role
    });
    setShowEditModal(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-accent-red/10 text-red-800 border-red-200';
      case 'editor':
        return 'bg-accent-green/10 text-green-800 border-green-200';
      case 'reviewer':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'author':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'editor':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'reviewer':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'author':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        <span className="ml-3 text-neutral-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-neutral-900/5 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                <svg className="w-6 h-6 mr-3 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                User Management
              </h2>
              <p className="text-neutral-600 mt-1">Manage user accounts and roles</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 transition-colors font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(userStats).map(([role, count]) => (
            <div key={role} className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${getRoleColor(role).replace('text-', 'text-').replace('border-', 'bg-').replace('bg-', 'bg-').split(' ')[0]}`}>
                  {getRoleIcon(role)}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 capitalize">{role}s</p>
                  <p className="text-2xl font-bold text-neutral-900">{count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search Users</label>
            <input
              type="text"
              placeholder="Search by name, email, or affiliation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Filter by Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as User['role'] | 'all')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="reviewer">Reviewer</option>
              <option value="author">Author</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Search by Expertise</label>
            <input
              type="text"
              placeholder="e.g. Social Work, Policy..."
              value={expertiseFilter}
              onChange={(e) => setExpertiseFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Activity Status</label>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="active">Recently Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-neutral-700">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleSelectAllUsers}
                  className="text-sm text-accent-green hover:text-accent-green/80 font-medium"
                >
                  {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Bulk Actions
                </button>
                <button
                  onClick={exportUsers}
                  className="px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Export for All Users */}
        {selectedUsers.length === 0 && (
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex justify-end">
              <button
                onClick={exportUsers}
                className="px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export All Users
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Users ({filteredUsers.length})
          </h3>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-neutral-600">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="mt-2 h-4 w-4 text-accent-green focus:ring-accent-green border-neutral-300 rounded"
                  />

                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-green/80 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </span>
                  </div>

                  {/* User Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-neutral-900">
                        {user.first_name} {user.last_name}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </span>
                      
                      {/* Activity Indicator */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        new Date(user.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {new Date(user.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600">{user.email}</p>
                      <p className="text-sm text-neutral-500">{user.affiliation}</p>
                      
                      {/* Expertise Tags */}
                      {user.expertise && user.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.expertise.slice(0, 3).map((area, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {area}
                            </span>
                          ))}
                          {user.expertise.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                              +{user.expertise.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-neutral-400 mt-2">
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                        {user.role === 'reviewer' && (
                          <>
                            <span>•</span>
                            <span>Reviews: 0</span> {/* Would be populated from real data */}
                          </>
                        )}
                        {user.role === 'author' && (
                          <>
                            <span>•</span>
                            <span>Submissions: 0</span> {/* Would be populated from real data */}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 flex-shrink-0">
                    <button
                      onClick={() => window.open(`/admin/users/${user.id}/profile`, '_blank')}
                      className="px-3 py-1.5 text-sm font-medium text-accent-green border border-accent-green rounded-md hover:bg-accent-green hover:text-white transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => openEditModal(user)}
                      className="px-3 py-1.5 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isDeleting === user.id}
                      className="px-3 py-1.5 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isDeleting === user.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-red-700 mr-1"></div>
                          Deleting...
                        </div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Create New User
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={createForm.first_name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={createForm.last_name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Affiliation
                </label>
                <input
                  type="text"
                  value={createForm.affiliation}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, affiliation: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                >
                  <option value="author">Author</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    email: '',
                    password: '',
                    first_name: '',
                    last_name: '',
                    affiliation: '',
                    role: 'author'
                  });
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={isCreating || !createForm.email || !createForm.password || !createForm.first_name || !createForm.last_name}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Edit User
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Affiliation
                </label>
                <input
                  type="text"
                  value={editForm.affiliation}
                  onChange={(e) => setEditForm(prev => ({ ...prev, affiliation: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700 mb-2">Current Role</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(selectedUser.role)}`}>
                  {getRoleIcon(selectedUser.role)}
                  <span className="ml-1 capitalize">{selectedUser.role}</span>
                </span>
                <p className="text-xs text-neutral-500 mt-1">
                  Role changes require additional permissions and are not available in this interface.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={isUpdating || !editForm.first_name || !editForm.last_name || !editForm.email}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Bulk Actions ({selectedUsers.length} users)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select Action
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value as 'role' | 'email' | 'deactivate' | '')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                >
                  <option value="">Choose action...</option>
                  <option value="role">Change Role</option>
                  <option value="email">Send Email</option>
                  <option value="deactivate">Deactivate Users</option>
                </select>
              </div>

              {bulkAction === 'role' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    New Role
                  </label>
                  <select
                    value={bulkRole}
                    onChange={(e) => setBulkRole(e.target.value as User['role'])}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  >
                    <option value="author">Author</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              {bulkAction === 'email' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={bulkEmailSubject}
                      onChange={(e) => setBulkEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                      placeholder="Enter email subject..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={bulkEmailMessage}
                      onChange={(e) => setBulkEmailMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                      placeholder="Enter your message..."
                    />
                  </div>
                </>
              )}

              {bulkAction === 'deactivate' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    This will temporarily deactivate {selectedUsers.length} user accounts. 
                    They will not be able to log in until reactivated.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkAction('');
                  setBulkEmailSubject('');
                  setBulkEmailMessage('');
                }}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || isBulkProcessing || (bulkAction === 'email' && (!bulkEmailSubject || !bulkEmailMessage))}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isBulkProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Apply Action'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};