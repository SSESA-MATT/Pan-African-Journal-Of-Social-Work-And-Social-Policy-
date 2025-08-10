'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminDashboard } from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}