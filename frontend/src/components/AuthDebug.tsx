'use client';

import React from 'react';
import { useAuth } from './AuthProvider';

const AuthDebug: React.FC = () => {
  const { user, token, isLoading } = useAuth();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-bold text-sm mb-2">Auth Debug</h3>
      <div className="text-xs space-y-1">
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>User: {user ? 'Logged In' : 'Not Logged In'}</div>
        <div>Token: {token ? 'Present' : 'Missing'}</div>
        {user && (
          <div>
            <div>ID: {user.id}</div>
            <div>Email: {user.email}</div>
            <div>Role: {user.role}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;