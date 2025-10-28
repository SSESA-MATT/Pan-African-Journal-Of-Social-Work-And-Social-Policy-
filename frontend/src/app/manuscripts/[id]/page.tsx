'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ManuscriptViewer } from '@/components/ManuscriptViewer';
import { ArrowLeft } from 'lucide-react';

export default function ManuscriptViewPage() {
  const params = useParams();
  const router = useRouter();
  const manuscriptId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Manuscript Viewer */}
        <ManuscriptViewer 
          submissionId={manuscriptId}
          className="max-w-none"
        />
      </div>
    </div>
  );
}