'use client';

import React, { useState } from 'react';
import { submissionApi } from '../lib/submissionApi';
import { 
  SubmissionFormData, 
  SubmissionValidationErrors, 
  CreateSubmissionRequest 
} from '../types/submission';

interface SubmissionFormProps {
  onSubmissionSuccess?: (submissionId: string) => void;
  onCancel?: () => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  onSubmissionSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<SubmissionFormData>({
    title: '',
    abstract: '',
    keywords: '',
    co_authors: '',
    manuscript: null
  });

  const [errors, setErrors] = useState<SubmissionValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Validation function
  const validateForm = (): SubmissionValidationErrors => {
    const newErrors: SubmissionValidationErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    // Abstract validation
    if (!formData.abstract.trim()) {
      newErrors.abstract = 'Abstract is required';
    } else {
      const wordCount = formData.abstract.trim().split(/\s+/).length;
      if (wordCount > 500) {
        newErrors.abstract = 'Abstract must be 500 words or less';
      }
    }

    // Keywords validation
    const keywordList = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    
    if (keywordList.length < 3) {
      newErrors.keywords = 'At least 3 keywords are required';
    } else if (keywordList.length > 10) {
      newErrors.keywords = 'Maximum 10 keywords allowed';
    }

    // Manuscript file validation
    if (!formData.manuscript) {
      newErrors.manuscript = 'Manuscript file is required';
    } else {
      if (formData.manuscript.type !== 'application/pdf') {
        newErrors.manuscript = 'Only PDF files are allowed';
      } else if (formData.manuscript.size > 10 * 1024 * 1024) { // 10MB
        newErrors.manuscript = 'File size must be 10MB or less';
      }
    }

    return newErrors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof SubmissionValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, manuscript: file }));
    
    // Clear manuscript error
    if (errors.manuscript) {
      setErrors(prev => ({ ...prev, manuscript: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare submission data
      const keywordList = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const coAuthorList = formData.co_authors
        .split(',')
        .map(ca => ca.trim())
        .filter(ca => ca.length > 0);

      const submissionData: CreateSubmissionRequest = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        keywords: keywordList,
        co_authors: coAuthorList
      };

      // Submit the manuscript
      const result = await submissionApi.createSubmission(
        submissionData,
        formData.manuscript!
      );

      // Reset form
      setFormData({
        title: '',
        abstract: '',
        keywords: '',
        co_authors: '',
        manuscript: null
      });

      // Call success callback
      if (onSubmissionSuccess) {
        onSubmissionSuccess(result.submission.id);
      }

    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit manuscript');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = formData.abstract.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Manuscript</h2>
      
      {submitError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter manuscript title"
            maxLength={200}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.title.length}/200 characters
          </p>
        </div>

        {/* Abstract */}
        <div>
          <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
            Abstract *
          </label>
          <textarea
            id="abstract"
            name="abstract"
            value={formData.abstract}
            onChange={handleInputChange}
            rows={8}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.abstract ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter manuscript abstract"
          />
          {errors.abstract && (
            <p className="mt-1 text-sm text-red-600">{errors.abstract}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {wordCount}/500 words
          </p>
        </div>

        {/* Keywords */}
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
            Keywords *
          </label>
          <input
            type="text"
            id="keywords"
            name="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.keywords ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter keywords separated by commas (minimum 3, maximum 10)"
          />
          {errors.keywords && (
            <p className="mt-1 text-sm text-red-600">{errors.keywords}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Separate keywords with commas. Example: social work, policy, Africa
          </p>
        </div>

        {/* Co-authors */}
        <div>
          <label htmlFor="co_authors" className="block text-sm font-medium text-gray-700 mb-2">
            Co-authors (Optional)
          </label>
          <input
            type="text"
            id="co_authors"
            name="co_authors"
            value={formData.co_authors}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter co-author names separated by commas"
          />
          {errors.co_authors && (
            <p className="mt-1 text-sm text-red-600">{errors.co_authors}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Separate co-author names with commas. Example: Dr. Jane Smith, Prof. John Doe
          </p>
        </div>

        {/* Manuscript File */}
        <div>
          <label htmlFor="manuscript" className="block text-sm font-medium text-gray-700 mb-2">
            Manuscript File *
          </label>
          <input
            type="file"
            id="manuscript"
            name="manuscript"
            accept=".pdf"
            onChange={handleFileChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.manuscript ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.manuscript && (
            <p className="mt-1 text-sm text-red-600">{errors.manuscript}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Upload your manuscript as a PDF file (maximum 10MB)
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Manuscript'}
          </button>
        </div>
      </form>
    </div>
  );
};