'use client';

import React, { useState } from 'react';
import { FileUpload } from '../../components/FileUpload';
import { FileManager } from '../../components/FileManager';
import { FileUploadResult } from '../../types/file';

export default function FileUploadDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([]);

  const handleUploadSuccess = (result: FileUploadResult) => {
    setUploadedFiles(prev => [...prev, result]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // In a real app, you might show a toast notification
  };

  const handleFileDeleted = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.fileId !== fileId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              File Upload System Demo
            </h1>
            <p className="text-gray-600">
              Test the manuscript upload functionality for the Africa Journal platform.
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Manuscript
            </h2>
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              className="max-w-2xl"
            />
          </div>

          {/* File Management Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h2>
            <FileManager
              files={uploadedFiles}
              onFileDeleted={handleFileDeleted}
              allowDelete={true}
              allowDownload={true}
            />
          </div>

          {/* Instructions */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Testing Instructions
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Only PDF files are accepted (max 10MB)</li>
              <li>• Files are uploaded to Cloudinary cloud storage</li>
              <li>• Progress indicators show upload status</li>
              <li>• Uploaded files can be downloaded securely</li>
              <li>• Files can be deleted from cloud storage</li>
              <li>• All operations require authentication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}