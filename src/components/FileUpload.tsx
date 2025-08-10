'use client';

import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadManuscript, validateFile, formatFileSize } from '../lib/fileApi';
import { FileUploadResult, FileUploadProgress } from '../types/file';

interface FileUploadProps {
  onUploadSuccess?: (result: FileUploadResult) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: FileUploadProgress | null;
  result: FileUploadResult | null;
  error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  disabled = false,
  className = '',
}) => {
  const [state, setState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: null,
    result: null,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setState(prev => ({
      ...prev,
      file,
      error: null,
      result: null,
      progress: null,
    }));

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.error || 'Invalid file',
      }));
      return;
    }
  };

  const handleUpload = async () => {
    if (!state.file) return;

    setState(prev => ({ ...prev, uploading: true, error: null }));

    try {
      const result = await uploadManuscript(
        state.file,
        (progress: FileUploadProgress) => {
          setState(prev => ({ ...prev, progress }));
        }
      );

      setState(prev => ({
        ...prev,
        uploading: false,
        result: result.data,
        progress: null,
      }));

      onUploadSuccess?.(result.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setState(prev => ({
        ...prev,
        uploading: false,
        error: errorMessage,
        progress: null,
      }));

      onUploadError?.(errorMessage);
    }
  };

  const handleRemoveFile = () => {
    setState({
      file: null,
      uploading: false,
      progress: null,
      result: null,
      error: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Create a proper FileList-like object
      const fileList = {
        0: file,
        length: 1,
        item: (index: number) => index === 0 ? file : null,
        [Symbol.iterator]: function* () {
          yield file;
        }
      } as FileList;
      
      // Create a proper change event
      const changeEvent = {
        target: { files: fileList },
        currentTarget: { files: fileList }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileSelect(changeEvent);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* File Input Area */}
      {!state.file && !state.result && (
        <div
          className={`
            border-2 border-dashed border-gray-300 rounded-lg p-8 text-center
            hover:border-gray-400 transition-colors cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Upload Manuscript
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop your PDF file here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            PDF files only, maximum 10MB
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* File Selected */}
      {state.file && !state.result && (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">{state.file.name}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(state.file.size)}
                </p>
              </div>
            </div>
            
            {!state.uploading && (
              <button
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {state.uploading && state.progress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{state.progress.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {state.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">{state.error}</p>
              </div>
            </div>
          )}

          {/* Upload Button */}
          {!state.uploading && !state.error && (
            <button
              onClick={handleUpload}
              disabled={disabled}
              className={`
                w-full py-2 px-4 rounded-md font-medium transition-colors
                ${disabled 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }
              `}
            >
              Upload File
            </button>
          )}

          {/* Retry Button */}
          {state.error && (
            <button
              onClick={handleUpload}
              disabled={disabled}
              className={`
                w-full py-2 px-4 rounded-md font-medium transition-colors
                ${disabled 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
                }
              `}
            >
              Retry Upload
            </button>
          )}
        </div>
      )}

      {/* Upload Success */}
      {state.result && (
        <div className="border border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">Upload Successful</p>
              <p className="text-sm text-green-700">
                {state.result.originalName} ({formatFileSize(state.result.size)})
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};