'use client';

import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../lib/api-client';

interface EnhancedReviewFormProps {
  submissionId: string;
  submission: any;
  onComplete: () => void;
  onBack: () => void;
}

interface ReviewSection {
  id: string;
  title: string;
  description: string;
  questions: ReviewQuestion[];
  required: boolean;
}

interface ReviewQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'boolean' | 'select';
  options?: string[];
  required: boolean;
  helpText?: string;
}

interface ReviewResponse {
  questionId: string;
  value: string | number | boolean;
}

export const EnhancedReviewForm: React.FC<EnhancedReviewFormProps> = ({
  submissionId,
  submission,
  onComplete,
  onBack
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [overallComments, setOverallComments] = useState('');
  const [confidentialComments, setConfidentialComments] = useState('');
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revisions' | 'major_revisions' | 'reject'>('minor_revisions');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  const reviewSections: ReviewSection[] = [
    {
      id: 'methodology',
      title: 'Methodology & Research Design',
      description: 'Evaluate the research methodology, design, and execution',
      required: true,
      questions: [
        {
          id: 'methodology_appropriateness',
          text: 'How appropriate is the research methodology for addressing the research questions?',
          type: 'rating',
          required: true,
          helpText: 'Consider whether the chosen methods align with the research objectives'
        },
        {
          id: 'sample_size',
          text: 'Is the sample size adequate and well-justified?',
          type: 'rating',
          required: true
        },
        {
          id: 'data_collection',
          text: 'Are the data collection procedures clearly described and appropriate?',
          type: 'rating',
          required: true
        },
        {
          id: 'methodology_comments',
          text: 'Detailed comments on methodology (strengths, weaknesses, suggestions)',
          type: 'text',
          required: true,
          helpText: 'Provide specific feedback on methodological aspects'
        }
      ]
    },
    {
      id: 'analysis',
      title: 'Data Analysis & Results',
      description: 'Review the data analysis approach and presentation of results',
      required: true,
      questions: [
        {
          id: 'analysis_appropriateness',
          text: 'Are the analytical methods appropriate for the data and research questions?',
          type: 'rating',
          required: true
        },
        {
          id: 'results_clarity',
          text: 'Are the results clearly presented and well-organized?',
          type: 'rating',
          required: true
        },
        {
          id: 'statistical_significance',
          text: 'Are statistical tests appropriate and correctly interpreted?',
          type: 'rating',
          required: true
        },
        {
          id: 'figures_tables',
          text: 'Are figures and tables clear, informative, and properly labeled?',
          type: 'rating',
          required: true
        },
        {
          id: 'analysis_comments',
          text: 'Detailed comments on analysis and results',
          type: 'text',
          required: true
        }
      ]
    },
    {
      id: 'content',
      title: 'Content & Contribution',
      description: 'Assess the originality, significance, and contribution to the field',
      required: true,
      questions: [
        {
          id: 'originality',
          text: 'How original is this research contribution?',
          type: 'rating',
          required: true
        },
        {
          id: 'significance',
          text: 'How significant is this work to the field of social work?',
          type: 'rating',
          required: true
        },
        {
          id: 'literature_review',
          text: 'Is the literature review comprehensive and current?',
          type: 'rating',
          required: true
        },
        {
          id: 'practical_implications',
          text: 'Are the practical implications for social work practice clearly articulated?',
          type: 'rating',
          required: true
        },
        {
          id: 'content_comments',
          text: 'Comments on content, contribution, and significance',
          type: 'text',
          required: true
        }
      ]
    },
    {
      id: 'presentation',
      title: 'Writing & Presentation',
      description: 'Evaluate the clarity, organization, and quality of writing',
      required: true,
      questions: [
        {
          id: 'writing_clarity',
          text: 'How clear and well-written is the manuscript?',
          type: 'rating',
          required: true
        },
        {
          id: 'organization',
          text: 'Is the manuscript well-organized and logically structured?',
          type: 'rating',
          required: true
        },
        {
          id: 'grammar_style',
          text: 'Are there significant grammar, spelling, or style issues?',
          type: 'select',
          options: ['None', 'Minor issues', 'Moderate issues', 'Major issues'],
          required: true
        },
        {
          id: 'length_appropriateness',
          text: 'Is the manuscript length appropriate for the content?',
          type: 'boolean',
          required: true
        },
        {
          id: 'presentation_comments',
          text: 'Comments on writing quality and presentation',
          type: 'text',
          required: true
        }
      ]
    },
    {
      id: 'ethics',
      title: 'Ethics & Standards',
      description: 'Review ethical considerations and adherence to standards',
      required: true,
      questions: [
        {
          id: 'ethical_approval',
          text: 'Are ethical approvals and procedures adequately addressed?',
          type: 'rating',
          required: true
        },
        {
          id: 'informed_consent',
          text: 'Is informed consent properly obtained and documented?',
          type: 'rating',
          required: true
        },
        {
          id: 'confidentiality',
          text: 'Are participant confidentiality and privacy protected?',
          type: 'rating',
          required: true
        },
        {
          id: 'conflicts_interest',
          text: 'Are potential conflicts of interest appropriately disclosed?',
          type: 'boolean',
          required: true
        },
        {
          id: 'ethics_comments',
          text: 'Comments on ethical considerations',
          type: 'text',
          required: false
        }
      ]
    }
  ];

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (Object.keys(responses).length > 0 || overallComments || confidentialComments) {
        saveProgress();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [responses, overallComments, confidentialComments]);

  const saveProgress = async () => {
    try {
      setAutoSaveStatus('saving');
      // In a real implementation, this would save to backend
      localStorage.setItem(`review_progress_${submissionId}`, JSON.stringify({
        responses,
        overallComments,
        confidentialComments,
        recommendation,
        currentSection,
        timestamp: new Date().toISOString()
      }));
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (err) {
      setAutoSaveStatus('error');
    }
  };

  // Load saved progress
  useEffect(() => {
    const savedProgress = localStorage.getItem(`review_progress_${submissionId}`);
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        setResponses(data.responses || {});
        setOverallComments(data.overallComments || '');
        setConfidentialComments(data.confidentialComments || '');
        setRecommendation(data.recommendation || 'minor_revisions');
        setCurrentSection(data.currentSection || 0);
      } catch (err) {
        console.error('Failed to load saved progress:', err);
      }
    }
  }, [submissionId]);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getRatingLabel = (rating: number) => {
    const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[rating - 1] || '';
  };

  const isCurrentSectionComplete = () => {
    const section = reviewSections[currentSection];
    return section.questions.every(question => {
      if (!question.required) return true;
      const response = responses[question.id];
      return response !== undefined && response !== '' && response !== null;
    });
  };

  const getCompletionPercentage = () => {
    const totalQuestions = reviewSections.reduce((sum, section) => sum + section.questions.length, 0) + 2; // +2 for overall comments and recommendation
    const completedQuestions = Object.keys(responses).length + (overallComments ? 1 : 0) + 1; // +1 for recommendation (always has default)
    return Math.round((completedQuestions / totalQuestions) * 100);
  };

  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Compile all responses into a comprehensive review
      const compiledReview = {
        sections: reviewSections.map(section => ({
          id: section.id,
          title: section.title,
          responses: section.questions.map(question => ({
            questionId: question.id,
            question: question.text,
            response: responses[question.id]
          }))
        })),
        overallComments,
        confidentialComments,
        recommendation
      };

      await reviewsApi.update(submissionId, {
        commentsToAuthor: JSON.stringify(compiledReview),
        commentsToEditor: confidentialComments || undefined,
        recommendation,
        status: 'completed',
      });

      // Clear saved progress
      localStorage.removeItem(`review_progress_${submissionId}`);
      
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: ReviewQuestion) => {
    const value = responses[question.id];

    switch (question.type) {
      case 'rating':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleResponseChange(question.id, rating)}
                  className={`w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                    value === rating
                      ? 'bg-accent-green border-accent-green text-white'
                      : 'border-neutral-300 text-neutral-600 hover:border-accent-green hover:text-accent-green'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            {value && (
              <p className="text-sm text-accent-green font-medium">
                {getRatingLabel(value)} ({value}/5)
              </p>
            )}
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            placeholder="Enter your detailed comments..."
          />
        );

      case 'boolean':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={question.id}
                checked={value === true}
                onChange={() => handleResponseChange(question.id, true)}
                className="h-4 w-4 text-accent-green focus:ring-accent-green border-neutral-300"
              />
              <span className="ml-2 text-sm text-neutral-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={question.id}
                checked={value === false}
                onChange={() => handleResponseChange(question.id, false)}
                className="h-4 w-4 text-accent-green focus:ring-accent-green border-neutral-300"
              />
              <span className="ml-2 text-sm text-neutral-700">No</span>
            </label>
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
          >
            <option value="">Select an option...</option>
            {question.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  const currentSectionData = reviewSections[currentSection];

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">
              Review Progress: {getCompletionPercentage()}% Complete
            </h2>
            {autoSaveStatus && (
              <div className={`flex items-center text-sm ${
                autoSaveStatus === 'saved' ? 'text-green-600' :
                autoSaveStatus === 'saving' ? 'text-blue-600' : 'text-red-600'
              }`}>
                {autoSaveStatus === 'saved' && '✓ Progress saved'}
                {autoSaveStatus === 'saving' && '⏳ Saving...'}
                {autoSaveStatus === 'error' && '⚠ Save failed'}
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-accent-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          
          {/* Section Navigation */}
          <div className="flex items-center space-x-2 mt-4 overflow-x-auto">
            {reviewSections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(index)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  index === currentSection
                    ? 'bg-accent-green text-white'
                    : index < currentSection
                    ? 'bg-green-100 text-green-800'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {index + 1}. {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Section */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            {currentSectionData.title}
          </h3>
          <p className="text-neutral-600 mt-1">{currentSectionData.description}</p>
        </div>
        
        <div className="p-6 space-y-8">
          {currentSectionData.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <label className="block text-sm font-medium text-neutral-900 flex-1">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {question.helpText && (
                  <div className="ml-4 group relative">
                    <svg className="w-4 h-4 text-neutral-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute right-0 top-6 w-64 p-2 bg-neutral-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {question.helpText}
                    </div>
                  </div>
                )}
              </div>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (currentSection > 0) {
              setCurrentSection(currentSection - 1);
            } else {
              onBack();
            }
          }}
          className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
        >
          ← {currentSection > 0 ? 'Previous Section' : 'Back to Guidelines'}
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={saveProgress}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors text-sm"
          >
            Save Progress
          </button>
          
          {currentSection < reviewSections.length - 1 ? (
            <button
              onClick={() => setCurrentSection(currentSection + 1)}
              disabled={!isCurrentSectionComplete()}
              className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                isCurrentSectionComplete()
                  ? 'bg-accent-green text-white hover:bg-accent-green/80'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              Next Section →
            </button>
          ) : (
            <button
              onClick={() => setCurrentSection(reviewSections.length)} // Go to final summary
              disabled={!isCurrentSectionComplete()}
              className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
                isCurrentSectionComplete()
                  ? 'bg-accent-green text-white hover:bg-accent-green/80'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              Review Summary →
            </button>
          )}
        </div>
      </div>

      {/* Final Summary Section */}
      {currentSection >= reviewSections.length && (
        <div className="space-y-6">
          {/* Overall Comments */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Overall Comments for Authors</h3>
              <p className="text-sm text-neutral-600 mt-1">
                Provide comprehensive feedback that will be shared with the authors
              </p>
            </div>
            <div className="p-6">
              <textarea
                value={overallComments}
                onChange={(e) => setOverallComments(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                placeholder="Summarize your review, highlighting key strengths and areas for improvement..."
                required
              />
              <p className="text-sm text-neutral-500 mt-2">
                Minimum 200 characters ({overallComments.length}/200)
              </p>
            </div>
          </div>

          {/* Confidential Comments */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Confidential Comments for Editors</h3>
              <p className="text-sm text-neutral-600 mt-1">
                Private comments for the editorial team (not shared with authors)
              </p>
            </div>
            <div className="p-6">
              <textarea
                value={confidentialComments}
                onChange={(e) => setConfidentialComments(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                placeholder="Any additional comments for the editorial team..."
              />
            </div>
          </div>

          {/* Final Recommendation */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Final Recommendation</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { value: 'accept', label: 'Accept', description: 'Ready for publication with minimal changes', color: 'text-green-600' },
                  { value: 'minor_revisions', label: 'Minor Revisions', description: 'Requires small changes before acceptance', color: 'text-blue-600' },
                  { value: 'major_revisions', label: 'Major Revisions', description: 'Significant improvements needed', color: 'text-orange-600' },
                  { value: 'reject', label: 'Reject', description: 'Not suitable for publication', color: 'text-red-600' }
                ].map(option => (
                  <label key={option.value} className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="recommendation"
                      value={option.value}
                      checked={recommendation === option.value}
                      onChange={(e) => setRecommendation(e.target.value as any)}
                      className="mt-1 h-4 w-4 text-accent-green focus:ring-accent-green border-neutral-300"
                    />
                    <div className="ml-3">
                      <span className={`font-medium ${option.color}`}>{option.label}</span>
                      <p className="text-sm text-neutral-600 mt-1">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Final Submit */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentSection(reviewSections.length - 1)}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              ← Back to Review Sections
            </button>

            <button
              onClick={handleSubmitReview}
              disabled={isSubmitting || overallComments.length < 200}
              className={`px-8 py-3 font-semibold rounded-lg transition-colors ${
                !isSubmitting && overallComments.length >= 200
                  ? 'bg-accent-green text-white hover:bg-accent-green/80'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                  Submitting Review...
                </div>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};