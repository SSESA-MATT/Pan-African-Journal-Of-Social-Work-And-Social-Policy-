'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import ReviewForm from '../../../../components/ReviewForm';

export default function ReviewSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;

  const handleSubmitSuccess = () => {
    router.push('/reviewer/dashboard');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ProtectedRoute allowedRoles={['reviewer', 'editor', 'admin']}>
      <ReviewForm
        submissionId={submissionId}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={handleCancel}
      />
    </ProtectedRoute>
  );
}