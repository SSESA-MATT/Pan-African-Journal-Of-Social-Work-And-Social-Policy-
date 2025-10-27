'use client';

import React, { useState } from 'react';

interface ReviewGuidelinesProps {
  onContinue: () => void;
  onBack: () => void;
}

export const ReviewGuidelines: React.FC<ReviewGuidelinesProps> = ({ onContinue, onBack }) => {
  const [acknowledgedGuidelines, setAcknowledgedGuidelines] = useState(false);
  const [acknowledgedEthics, setAcknowledgedEthics] = useState(false);

  const canContinue = acknowledgedGuidelines && acknowledgedEthics;

  const guidelines = [
    {
      title: "Manuscript Quality",
      items: [
        "Assess the originality and significance of the research",
        "Evaluate the methodology and research design",
        "Review the clarity and organization of the writing",
        "Check for appropriate use of literature and citations"
      ]
    },
    {
      title: "Technical Assessment",
      items: [
        "Verify that conclusions are supported by the data",
        "Assess the appropriateness of statistical methods",
        "Review figures, tables, and supplementary materials",
        "Check for any methodological limitations"
      ]
    },
    {
      title: "Relevance & Impact",
      items: [
        "Evaluate relevance to the journal's scope",
        "Assess potential impact on the field",
        "Consider the target audience and accessibility",
        "Review the contribution to existing knowledge"
      ]
    },
    {
      title: "Ethical Considerations",
      items: [
        "Check for proper ethical approvals and consent",
        "Verify appropriate acknowledgment of funding",
        "Look for potential conflicts of interest",
        "Ensure participant confidentiality is maintained"
      ]
    }
  ];

  const reviewCriteria = [
    {
      category: "Methodology",
      description: "Is the research methodology appropriate and well-executed?",
      weight: "25%"
    },
    {
      category: "Originality",
      description: "Does the work contribute new knowledge to the field?",
      weight: "25%"
    },
    {
      category: "Clarity",
      description: "Is the manuscript well-written and clearly presented?",
      weight: "20%"
    },
    {
      category: "Significance",
      description: "How important is this work to the field and practice?",
      weight: "20%"
    },
    {
      category: "Ethics",
      description: "Are ethical standards properly addressed?",
      weight: "10%"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Review Guidelines
          </h2>
          <p className="text-neutral-600 mt-1">
            Please review these guidelines before conducting your review to ensure consistency and quality.
          </p>
        </div>
      </div>

      {/* Review Guidelines */}
      <div className="grid md:grid-cols-2 gap-6">
        {guidelines.map((section, index) => (
          <div key={index} className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">{section.title}</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <svg className="w-5 h-5 text-accent-green mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Review Criteria */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Review Criteria & Weighting</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Consider these criteria when evaluating the manuscript and making your recommendation.
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reviewCriteria.map((criterion, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">{criterion.category}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{criterion.description}</p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-green/10 text-green-800">
                    {criterion.weight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Timeline */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Review Timeline & Expectations</h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-neutral-900">Review Duration</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Typically 2-3 weeks from assignment
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-neutral-900">Review Length</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Minimum 500 words of constructive feedback
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-medium text-neutral-900">Confidentiality</h4>
              <p className="text-sm text-neutral-600 mt-1">
                All reviews are confidential and anonymous
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acknowledgments */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Reviewer Acknowledgments</h3>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={acknowledgedGuidelines}
              onChange={(e) => setAcknowledgedGuidelines(e.target.checked)}
              className="mt-1 h-4 w-4 text-accent-green focus:ring-accent-green border-neutral-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-neutral-900">
                I have read and understood the review guidelines
              </span>
              <p className="text-sm text-neutral-600 mt-1">
                I will conduct my review according to the criteria and standards outlined above.
              </p>
            </div>
          </label>

          <label className="flex items-start">
            <input
              type="checkbox"
              checked={acknowledgedEthics}
              onChange={(e) => setAcknowledgedEthics(e.target.checked)}
              className="mt-1 h-4 w-4 text-accent-green focus:ring-accent-green border-neutral-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-neutral-900">
                I confirm no conflicts of interest
              </span>
              <p className="text-sm text-neutral-600 mt-1">
                I have no personal, financial, or professional conflicts of interest with this manuscript or its authors.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
        >
          ← Back to Submission
        </button>
        
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
            canContinue
              ? 'bg-accent-green text-white hover:bg-accent-green/80'
              : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
          }`}
        >
          Begin Review →
        </button>
      </div>
    </div>
  );
};