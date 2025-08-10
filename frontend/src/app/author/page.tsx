'use client';

import React from 'react';
import { AuthorDashboard } from '../../components/AuthorDashboard';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthProvider';

export default function AuthorPortalPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['author', 'admin', 'editor']}>
      {user && (
        <AuthorDashboard 
          user={{
            id: user.id,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name
          }}
        />
      )}
    </ProtectedRoute>
  );
}