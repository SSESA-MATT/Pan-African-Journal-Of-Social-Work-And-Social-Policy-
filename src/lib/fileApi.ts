import axios, { AxiosProgressEvent } from 'axios';
import { getToken } from './auth';
import {
  FileUploadResponse,
  FileDownloadResponse,
  FileInfoResponse,
  FileUploadProgress,
} from '../types/file';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with auth interceptor
const fileApi = axios.create({
  baseURL: `${API_BASE_URL}/api/files`,
});

// Add auth token to requests
fileApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Upload a manuscript PDF file
 */
export const uploadManuscript = async (
  file: File,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('manuscript', file);

  const response = await fileApi.post<FileUploadResponse>('/upload/manuscript', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress: FileUploadProgress = {
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
        };
        onProgress(progress);
      }
    },
  });

  return response.data;
};

/**
 * Get secure download URL for a file
 */
export const getDownloadUrl = async (
  fileId: string,
  expiresIn?: number
): Promise<FileDownloadResponse> => {
  const params = expiresIn ? { expiresIn: expiresIn.toString() } : {};
  const response = await fileApi.get<FileDownloadResponse>(`/${fileId}/download`, { params });
  return response.data;
};

/**
 * Get file information
 */
export const getFileInfo = async (fileId: string): Promise<FileInfoResponse> => {
  const response = await fileApi.get<FileInfoResponse>(`/${fileId}/info`);
  return response.data;
};

/**
 * Delete a file
 */
export const deleteFile = async (fileId: string): Promise<{ message: string }> => {
  const response = await fileApi.delete<{ message: string }>(`/${fileId}`);
  return response.data;
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return {
      isValid: false,
      error: 'Only PDF files are allowed',
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB',
    };
  }

  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};