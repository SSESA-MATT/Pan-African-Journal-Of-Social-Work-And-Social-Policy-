'use client';

import React from 'react';
import AuthorDashboard from '../../components/AuthorDashboard';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../components/AuthProvider';

export default function AuthorPortalPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['author']}>
      <AuthorDashboard />
    </ProtectedRoute>
  );
}