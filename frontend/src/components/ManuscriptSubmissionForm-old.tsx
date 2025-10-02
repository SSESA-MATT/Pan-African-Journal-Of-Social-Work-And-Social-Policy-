'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { submitManuscript } from '../lib/manuscriptApi';
import { ManuscriptSubmissionRequest } from '../types/manuscript';

interface SubmissionFormProps {
  onSubmissionComplete: () => void;
}

type ArticleTypeInfo = {
  title: string;
  description: string;
  wordLimit: string;
  requirements: string[];
  examples: string[];
};

const ARTICLE_TYPES: Record<string, ArticleTypeInfo> = {
  'research': {
    title: 'Original Research Article',
    description: 'Reports original empirical research with methodology, results, and analysis.',
    wordLimit: '6,000-8,000 words',
    requirements: [
      'Abstract (250-300 words)',
      'Keywords (4-6 terms)',
      'Introduction with literature review',
      'Methodology section',
      'Results and analysis',
      'Discussion and conclusions',
      'References (APA 7th edition)',
      'Ethics approval documentation'
    ],
    examples: ['Community intervention studies', 'Quantitative/qualitative research', 'Mixed-methods studies']
  },
  'review': {
    title: 'Review Article',
    description: 'Comprehensive analysis of existing literature on a specific topic.',
    wordLimit: '5,000-7,000 words',
    requirements: [
      'Abstract (250-300 words)',
      'Keywords (4-6 terms)',
      'Systematic review methodology',
      'Critical analysis of literature',
      'Synthesis and conclusions',
      'Comprehensive reference list',
      'Search strategy documentation'
    ],
    examples: ['Systematic reviews', 'Meta-analyses', 'Scoping reviews', 'Literature syntheses']
  },
  'policy-brief': {
    title: 'Policy Brief',
    description: 'Concise analysis summarizing implications for governments and practitioners.',
    wordLimit: '2,000-3,000 words',
    requirements: [
      'Executive summary (150 words)',
      'Policy context and background',
      'Evidence-based recommendations',
      'Implementation strategies',
      'Key stakeholder analysis',
      'Clear action points'
    ],
    examples: ['Government policy analysis', 'NGO strategic recommendations', 'Legislative proposals']
  },
  'practice-note': {
    title: 'Practice Note',
    description: 'Highlighting innovations and best practices from the field.',
    wordLimit: '1,500-2,500 words',
    requirements: [
      'Brief abstract (150 words)',
      'Practice context description',
      'Innovation or intervention details',
      'Outcomes and impact',
      'Lessons learned',
      'Replication guidelines'
    ],
    examples: ['Community program innovations', 'Service delivery models', 'Intervention techniques']
  },
  'student-voice': {
    title: 'Student Voice',
    description: 'Short essays from African social work students to nurture scholarship.',
    wordLimit: '1,000-1,500 words',
    requirements: [
      'Brief introduction',
      'Personal perspective or experience',
      'Connection to social work theory/practice',
      'Reflection on learning',
      'Future implications',
      'Supervisor endorsement letter'
    ],
    examples: ['Field placement reflections', 'Research experiences', 'Community engagement insights']
  },
  'case-study': {
    title: 'Case Study',
    description: 'In-depth analysis of a specific case, program, or intervention.',
    wordLimit: '3,000-4,000 words',
    requirements: [
      'Abstract (200-250 words)',
      'Case background and context',
      'Methodology and data collection',
      'Analysis and findings',
      'Implications for practice',
      'Ethical considerations'
    ],
    examples: ['Individual case analyses', 'Program evaluations', 'Organizational studies']
  },
  'commentary': {
    title: 'Commentary',
    description: 'Critical perspective on current issues in African social work.',
    wordLimit: '2,000-3,000 words',
    requirements: [
      'Clear position statement',
      'Evidence-based arguments',
      'Critical analysis',
      'Implications for field',
      'Call to action or recommendations'
    ],
    examples: ['Professional debates', 'Current issue analysis', 'Field critiques']
  },
  'brief-communication': {
    title: 'Brief Communication',
    description: 'Short reports on preliminary findings or important announcements.',
    wordLimit: '1,000-1,500 words',
    requirements: [
      'Concise abstract (100-150 words)',
      'Clear methodology (if applicable)',
      'Key findings or information',
      'Brief discussion',
      'Limited references'
    ],
    examples: ['Preliminary research findings', 'Conference reports', 'Field updates']
  }
};

const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmissionComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileUploading, setFileUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const [formData, setFormData] = useState({
    // Step 1: Article Type & Basic Info
    manuscript_type: 'research' as keyof typeof ARTICLE_TYPES,
    title: '',
    abstract: '',
    
    // Step 2: Authors & Keywords
    authors: '',
    corresponding_author: '',
    keywords: '',
    research_areas: '',
    
    // Step 3: Content & Files
    content: '',
    manuscript_file: null as File | null,
    supplementary_files: [] as File[],
    
    // Step 4: Compliance & Metadata
    funding_information: '',
    conflict_of_interest: '',
    ethics_approval: '',
    data_availability: '',
    acknowledgments: '',
    
    // Additional fields for specific article types
    supervisor_endorsement: '', // For student voices
    policy_recommendations: '', // For policy briefs
    innovation_description: '', // For practice notes
    case_methodology: '', // For case studies
  });

  // Calculate word count for content
  useEffect(() => {
    const words = formData.content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [formData.content]);

  const selectedArticleType = ARTICLE_TYPES[formData.manuscript_type];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (name === 'manuscript_file') {
        const file = fileInput.files?.[0] || null;
        setFormData(prev => ({
          ...prev,
          manuscript_file: file
        }));
      } else if (name === 'supplementary_files') {
        const files = Array.from(fileInput.files || []);
        setFormData(prev => ({
          ...prev,
          supplementary_files: files
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const uploadFile = async (file: File, submissionId: string): Promise<string> => {
    setFileUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('submissionId', submissionId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);
      return result.fileUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    } finally {
      setFileUploading(false);
    }
  };

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!formData.manuscript_type) errors.push('Article type is required');
        if (!formData.title.trim()) errors.push('Title is required');
        if (!formData.abstract.trim()) errors.push('Abstract is required');
        if (formData.abstract.split(' ').length > 300) errors.push('Abstract must be 300 words or less');
        break;
      case 2:
        if (!formData.authors.trim()) errors.push('Authors are required');
        if (!formData.corresponding_author.trim()) errors.push('Corresponding author is required');
        if (!formData.keywords.trim()) errors.push('Keywords are required');
        if (!formData.research_areas.trim()) errors.push('Research areas are required');
        break;
      case 3:
        if (!formData.content.trim() && !formData.manuscript_file) errors.push('Either content or manuscript file is required');
        if (formData.manuscript_type === 'student-voice' && !formData.supervisor_endorsement.trim()) {
          errors.push('Supervisor endorsement is required for Student Voice submissions');
        }
        break;
      case 4:
        if (!formData.conflict_of_interest.trim()) errors.push('Conflict of interest statement is required');
        break;
    }
    
    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }
    setError(null);
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps
    const allErrors: string[] = [];
    for (let i = 1; i <= 4; i++) {
      allErrors.push(...validateStep(i));
    }
    
    if (allErrors.length > 0) {
      setError(allErrors.join('. '));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error('User authentication required');
      }

      // Prepare submission data
      const submissionData: ManuscriptSubmissionRequest = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        content: formData.content.trim(),
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        authors: formData.authors.split(',').map(a => a.trim()).filter(a => a),
        corresponding_author: formData.corresponding_author.trim(),
        manuscript_type: formData.manuscript_type as any,
        funding_information: formData.funding_information.trim(),
        conflict_of_interest: formData.conflict_of_interest.trim(),
        ethics_approval: formData.ethics_approval.trim(),
        data_availability: formData.data_availability.trim(),
        research_areas: formData.research_areas.trim(),
        author_id: user.id
      };

      console.log('Submitting manuscript:', { title: submissionData.title, author_id: submissionData.author_id });

      // Submit the manuscript first
      const response = await submitManuscript(submissionData);
      console.log('Submission response:', response);

      // Upload files if provided
      if (formData.manuscript_file && response.submission?.id) {
        try {
          const fileUrl = await uploadFile(formData.manuscript_file, response.submission.id);
          console.log('File uploaded successfully:', fileUrl);
        } catch (fileError) {
          console.error('File upload failed:', fileError);
          throw new Error('Failed to upload manuscript file. Please try again.');
        }
      }

      setSuccess(true);
      
      // Wait a bit then call the completion callback to refresh the dashboard
      setTimeout(() => {
        onSubmissionComplete();
      }, 1500);

    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Manuscript Submitted Successfully!</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Article Type:</strong> {selectedArticleType.title}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Title:</strong> {formData.title}
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              Your manuscript has been submitted and assigned a unique ID. You will receive an email confirmation shortly. 
              The editorial team will review your submission and contact you within 2-3 business days.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>1. Initial editorial review (3-5 days)</li>
                <li>2. Peer review assignment (1-2 weeks)</li>
                <li>3. Review process (4-6 weeks)</li>
                <li>4. Editorial decision notification</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">
              Redirecting to your manuscript dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            step <= currentStep 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-white border-gray-300 text-gray-500'
          }`}>
            {step < currentStep ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-sm font-semibold">{step}</span>
            )}
          </div>
          {step < 4 && (
            <div className={`h-1 w-16 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const stepTitles = [
    'Article Type & Basic Information',
    'Authors & Research Focus',
    'Content & Files',
    'Compliance & Final Details'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
              <option value="policy-brief">Policy Brief</option>
              <option value="practice-note">Practice Note</option>
              <option value="student-voice">Student Voice</option>
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
              Word count: {formData.abstract.split(' ').filter((word: string) => word.length > 0).length}/300
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

          <div>
            <label htmlFor="research_areas" className="block text-sm font-medium text-gray-700 mb-2">
              List up to 5 areas of research focus *
            </label>
            <input
              type="text"
              id="research_areas"
              name="research_areas"
              value={formData.research_areas}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your research focus areas separated by commas (e.g., decolonial social work, community development, mental health, social policy)"
            />
            <p className="mt-2 text-sm text-gray-500">
              List your main areas of research focus, up to 5 areas.
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

          {/* File Upload Section */}
          <div>
            <label htmlFor="manuscript_file" className="block text-sm font-medium text-gray-700 mb-2">
              Manuscript File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="manuscript_file"
                name="manuscript_file"
                accept=".pdf,.doc,.docx"
                onChange={handleInputChange}
                required
                className="hidden"
              />
              <label 
                htmlFor="manuscript_file" 
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-gray-600">
                  {formData.manuscript_file 
                    ? `Selected: ${formData.manuscript_file.name}` 
                    : 'Click to upload your complete manuscript'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC, or DOCX files up to 10MB (Required)
                </span>
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Please upload your complete manuscript including all text, figures, and tables. This ensures proper formatting and preserves all visual elements.
            </p>
            
            {fileUploading && (
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
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
    </div>
  );
};

export default SubmissionForm;