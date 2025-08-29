'use client';

import React from 'react';
import AdminReviewerAssignmentDemo from '@/components/AdminReviewerAssignmentDemo';

export default function AdminReviewerAssignmentPage() {
  // Mock admin user
  const mockAdminUser = {
    id: 'admin-1',
    email: 'admin@panafricanjournal.com',
    first_name: 'Editorial',
    last_name: 'Administrator',
    affiliation: 'Pan-African Journal of Social Work and Social Policy',
    role: 'admin' as const,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  return (
    <div>
      <AdminReviewerAssignmentDemo currentUser={mockAdminUser} />
    </div>
  );
}
