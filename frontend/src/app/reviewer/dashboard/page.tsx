'use client';

import React from 'react';
import { useAuth } from '../../../components/AuthProvider';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import ReviewerDashboard from '../../../components/ReviewerDashboard';

export default function ReviewerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['reviewer', 'editor', 'admin']}>
      <ReviewerDashboard />
    </ProtectedRoute>
  );
}