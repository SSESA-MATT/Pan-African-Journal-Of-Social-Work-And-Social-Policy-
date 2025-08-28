'use client';

import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { submitManuscript } from '../../lib/manuscriptApi';
import { ManuscriptSubmissionRequest } from '../../types/manuscript';

interface SubmissionFormProps {
  onSubmissionComplete: () => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmissionComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    content: '',
    keywords: '',
    authors: '',
    corresponding_author: '',
    manuscript_type: 'research' as const,
    funding_information: '',
    conflict_of_interest: '',
    ethics_approval: '',
    data_availability: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.abstract.trim()) throw new Error('Abstract is required');
      if (!formData.content.trim()) throw new Error('Content is required');
      if (!formData.authors.trim()) throw new Error('Authors are required');
      if (!formData.corresponding_author.trim()) throw new Error('Corresponding author is required');

      // Parse keywords and authors
      const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
      const authors = formData.authors.split(',').map(a => a.trim()).filter(a => a);

      if (keywords.length === 0) throw new Error('At least one keyword is required');
      if (authors.length === 0) throw new Error('At least one author is required');

      const submissionData: ManuscriptSubmissionRequest = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        content: formData.content.trim(),
        keywords,
        authors,
        corresponding_author: formData.corresponding_author.trim(),
        manuscript_type: formData.manuscript_type,
        funding_information: formData.funding_information.trim() || undefined,
        conflict_of_interest: formData.conflict_of_interest.trim() || undefined,
        ethics_approval: formData.ethics_approval.trim() || undefined,
        data_availability: formData.data_availability.trim() || undefined,
      };

      await submitManuscript(submissionData);
      setSuccess(true);
      setTimeout(() => {
        onSubmissionComplete();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to submit manuscript');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Manuscript Submitted Successfully!</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your manuscript has been submitted and is now under review. You will be notified of any updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Submit New Manuscript</h2>
        <p className="mt-2 text-gray-600">
          Please fill in all required information about your manuscript submission.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Basic Information
          </h3>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Manuscript Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your manuscript title"
            />
          </div>

          <div>
            <label htmlFor="manuscript_type" className="block text-sm font-medium text-gray-700 mb-2">
              Manuscript Type *
            </label>
            <select
              id="manuscript_type"
              name="manuscript_type"
              value={formData.manuscript_type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="research">Original Research</option>
              <option value="review">Review Article</option>
              <option value="case-study">Case Study</option>
              <option value="commentary">Commentary</option>
              <option value="brief-communication">Brief Communication</option>
            </select>
          </div>

          <div>
            <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
              Abstract *
            </label>
            <textarea
              id="abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your manuscript abstract (maximum 300 words)"
            />
            <p className="mt-2 text-sm text-gray-500">
              Word count: {formData.abstract.split(' ').filter(word => word.length > 0).length}/300
            </p>
          </div>

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
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter keywords separated by commas (e.g., social work, Africa, community development)"
            />
            <p className="mt-2 text-sm text-gray-500">
              Separate keywords with commas. Recommended: 3-6 keywords.
            </p>
          </div>
        </div>

        {/* Authors */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Author Information
          </h3>
          
          <div>
            <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-2">
              All Authors *
            </label>
            <input
              type="text"
              id="authors"
              name="authors"
              value={formData.authors}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter all author names separated by commas (e.g., John Smith, Jane Doe, Mary Johnson)"
            />
            <p className="mt-2 text-sm text-gray-500">
              List all authors in the order they should appear, separated by commas.
            </p>
          </div>

          <div>
            <label htmlFor="corresponding_author" className="block text-sm font-medium text-gray-700 mb-2">
              Corresponding Author *
            </label>
            <input
              type="text"
              id="corresponding_author"
              name="corresponding_author"
              value={formData.corresponding_author}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter corresponding author name and email"
            />
          </div>
        </div>

        {/* Manuscript Content */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Manuscript Content
          </h3>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Full Manuscript Text *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste your complete manuscript text here, including introduction, methodology, results, discussion, and conclusion..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Word count: {formData.content.split(' ').filter(word => word.length > 0).length}
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Additional Information
          </h3>
          
          <div>
            <label htmlFor="funding_information" className="block text-sm font-medium text-gray-700 mb-2">
              Funding Information
            </label>
            <textarea
              id="funding_information"
              name="funding_information"
              value={formData.funding_information}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe any funding sources or declare if no funding was received"
            />
          </div>

          <div>
            <label htmlFor="conflict_of_interest" className="block text-sm font-medium text-gray-700 mb-2">
              Conflict of Interest Statement
            </label>
            <textarea
              id="conflict_of_interest"
              name="conflict_of_interest"
              value={formData.conflict_of_interest}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Declare any potential conflicts of interest or state 'None declared'"
            />
          </div>

          <div>
            <label htmlFor="ethics_approval" className="block text-sm font-medium text-gray-700 mb-2">
              Ethics Approval
            </label>
            <textarea
              id="ethics_approval"
              name="ethics_approval"
              value={formData.ethics_approval}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide ethics approval information if applicable"
            />
          </div>

          <div>
            <label htmlFor="data_availability" className="block text-sm font-medium text-gray-700 mb-2">
              Data Availability Statement
            </label>
            <textarea
              id="data_availability"
              name="data_availability"
              value={formData.data_availability}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe data availability or sharing policies"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Manuscript'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmissionForm;
