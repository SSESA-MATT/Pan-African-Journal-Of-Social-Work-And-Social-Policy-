'use client';

import React, { useState } from 'react';
import { Download, Trash2, Info, Eye, AlertCircle } from 'lucide-react';
import { getDownloadUrl, getFileInfo, deleteFile, formatFileSize } from '../lib/fileApi';
import { FileUploadResult } from '../types/file';

interface FileManagerProps {
  files: FileUploadResult[];
  onFileDeleted?: (fileId: string) => void;
  allowDelete?: boolean;
  allowDownload?: boolean;
  className?: string;
}

interface FileAction {
  type: 'download' | 'delete' | 'info';
  fileId: string;
  loading: boolean;
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  onFileDeleted,
  allowDelete = true,
  allowDownload = true,
  className = '',
}) => {
  const [actions, setActions] = useState<FileAction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isActionLoading = (type: string, fileId: string) => {
    return actions.some(action => action.type === type && action.fileId === fileId && action.loading);
  };

  const setActionLoading = (type: 'download' | 'delete' | 'info', fileId: string, loading: boolean) => {
    setActions(prev => {
      const filtered = prev.filter(action => !(action.type === type && action.fileId === fileId));
      if (loading) {
        return [...filtered, { type, fileId, loading }];
      }
      return filtered;
    });
  };

  const handleDownload = async (file: FileUploadResult) => {
    if (!allowDownload) return;

    setActionLoading('download', file.fileId, true);
    setError(null);

    try {
      const response = await getDownloadUrl(file.fileId);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Download failed';
      setError(errorMessage);
    } finally {
      setActionLoading('download', file.fileId, false);
    }
  };

  const handleDelete = async (file: FileUploadResult) => {
    if (!allowDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.originalName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading('delete', file.fileId, true);
    setError(null);

    try {
      await deleteFile(file.fileId);
      onFileDeleted?.(file.fileId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Delete failed';
      setError(errorMessage);
    } finally {
      setActionLoading('delete', file.fileId, false);
    }
  };

  const handleViewInfo = async (file: FileUploadResult) => {
    setActionLoading('info', file.fileId, true);
    setError(null);

    try {
      const response = await getFileInfo(file.fileId);
      
      // Show file info in an alert (in a real app, you might use a modal)
      const info = response.data;
      alert(`File Information:
      
Name: ${file.originalName}
Size: ${formatFileSize(info.size)}
Format: ${info.format.toUpperCase()}
Created: ${new Date(info.createdAt).toLocaleString()}
Type: ${info.resourceType}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get file info';
      setError(errorMessage);
    } finally {
      setActionLoading('info', file.fileId, false);
    }
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Eye className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {files.map((file) => (
        <div
          key={file.fileId}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {file.originalName}
              </h3>
              <p className="text-sm text-gray-600">
                {formatFileSize(file.size)} • {file.format.toUpperCase()}
              </p>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {/* Info Button */}
              <button
                onClick={() => handleViewInfo(file)}
                disabled={isActionLoading('info', file.fileId)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                title="View file information"
              >
                {isActionLoading('info', file.fileId) ? (
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </button>

              {/* Download Button */}
              {allowDownload && (
                <button
                  onClick={() => handleDownload(file)}
                  disabled={isActionLoading('download', file.fileId)}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
                  title="Download file"
                >
                  {isActionLoading('download', file.fileId) ? (
                    <div className="animate-spin h-4 w-4 border-2 border-green-300 border-t-green-600 rounded-full" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              )}

              {/* Delete Button */}
              {allowDelete && (
                <button
                  onClick={() => handleDelete(file)}
                  disabled={isActionLoading('delete', file.fileId)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                  title="Delete file"
                >
                  {isActionLoading('delete', file.fileId) ? (
                    <div className="animate-spin h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};