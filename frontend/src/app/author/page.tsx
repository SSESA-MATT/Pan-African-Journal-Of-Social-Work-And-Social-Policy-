'use client';

import React from 'react';
import AuthorDashboard from '../../components/AuthorDashboard';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthProvider';

export default function AuthorPortalPage() {
  const { user } = useAuth();

  // Debug output for troubleshooting role-based access
  console.log('AuthorPortalPage: user.role =', user?.role, 'allowedRoles =', ['author', 'admin']);

  return (
    <ProtectedRoute allowedRoles={['author', 'admin']}>
      <AuthorDashboard />
    </ProtectedRoute>
  );
}