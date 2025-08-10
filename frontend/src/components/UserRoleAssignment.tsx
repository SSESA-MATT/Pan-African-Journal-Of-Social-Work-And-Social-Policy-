'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { userApi } from '@/lib/userApi';

interface UserRoleAssignmentProps {
  userId: string;
  currentRole: User['role'];
  onRoleUpdate?: (newRole: User['role']) => void;
  disabled?: boolean;
}

export const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({
  userId,
  currentRole,
  onRoleUpdate,
  disabled = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<User['role']>(currentRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (newRole: User['role']) => {
    if (newRole === currentRole) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await userApi.updateUserRole(userId, newRole);
      if (response.success) {
        setSelectedRole(newRole);
        onRoleUpdate?.(newRole);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
      setSelectedRole(currentRole); // Reset to original role
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'editor':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'reviewer':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'author':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-2">
      <select
        value={selectedRole}
        onChange={(e) => handleRoleChange(e.target.value as User['role'])}
        disabled={disabled || isLoading}
        className={`
          px-3 py-2 border rounded-md text-sm font-medium transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getRoleColor(selectedRole)}
        `}
      >
        <option value="author">Author</option>
        <option value="reviewer">Reviewer</option>
        <option value="editor">Editor</option>
        <option value="admin">Admin</option>
      </select>

      {isLoading && (
        <div className="flex items-center text-sm text-gray-500">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
          Updating role...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

interface BulkRoleAssignmentProps {
  userIds: string[];
  onComplete?: () => void;
}

export const BulkRoleAssignment: React.FC<BulkRoleAssignmentProps> = ({
  userIds,
  onComplete,
}) => {
  const [selectedRole, setSelectedRole] = useState<User['role']>('author');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleBulkRoleUpdate = async () => {
    if (userIds.length === 0) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const total = userIds.length;
      let completed = 0;

      for (const userId of userIds) {
        try {
          await userApi.updateUserRole(userId, selectedRole);
          completed++;
          setProgress((completed / total) * 100);
        } catch (err) {
          console.error(`Failed to update role for user ${userId}:`, err);
        }
      }

      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roles');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Bulk Role Assignment ({userIds.length} users)
      </h3>

      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign Role:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as User['role'])}
            disabled={isLoading}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="author">Author</option>
            <option value="reviewer">Reviewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex-1">
          <button
            onClick={handleBulkRoleUpdate}
            disabled={isLoading || userIds.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Roles'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            Updating roles... {Math.round(progress)}% complete
          </p>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};