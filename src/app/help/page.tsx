'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('general');

  // Help content by category
  const helpContent = {
    general: [
      {
        question: 'What is the Pan African Journal Of Social Work And Social Policy?',
        answer: `The Pan African Journal Of Social Work And Social Policy is a scholarly publishing platform that promotes Indigenous African knowledge systems and decolonial social work methodologies. We publish peer-reviewed research that contributes to the advancement of social work practice and policy across Africa.`
      },
      {
        question: 'How can I access published articles?',
        answer: `All published articles are freely available through our open access platform. You can browse articles by volume, issue, or topic on our Articles page. Each article can be viewed online and downloaded as a PDF.`
      },
      {
        question: 'Is there a fee to access the journal?',
        answer: `No, the Pan African Journal Of Social Work And Social Policy is an open access publication. All content is freely available to readers worldwide without subscription fees or paywalls.`
      }
    ],
    authors: [
      {
        question: 'How do I submit a manuscript?',
        answer: `To submit a manuscript, you need to create an author account and use our online submission system. Navigate to the Author Portal, log in, and follow the step-by-step submission process. You'll need to provide manuscript details, upload your PDF file, and complete the required metadata.`
      },
      {
        question: 'What types of articles does the journal publish?',
        answer: `We publish original research articles, systematic reviews, conceptual papers, and case studies related to social work practice, social policy, community development, and social welfare in African contexts. We particularly value research that centers Indigenous knowledge systems and decolonial approaches.`
      },
      {
        question: 'What is the peer review process?',
        answer: `All submissions undergo double-blind peer review by at least two expert reviewers. The review process typically takes 6-8 weeks. Reviewers evaluate manuscripts for originality, methodological rigor, significance of contribution, and relevance to social work in Africa.`
      },
      {
        question: 'Are there publication fees?',
        answer: `The journal does not currently charge submission or publication fees. We are committed to making publication accessible to researchers across Africa and the Global South.`
      }
    ],
    reviewers: [
      {
        question: 'How can I become a reviewer?',
        answer: `Experienced researchers and practitioners in social work, social policy, and related fields can apply to become reviewers. Create an account, complete your reviewer profile with your areas of expertise, and submit your application through the Reviewer Portal.`
      },
      {
        question: 'What is expected of reviewers?',
        answer: `Reviewers are expected to provide constructive, thorough, and timely feedback on manuscripts within their area of expertise. Reviews should evaluate the scholarly merit, methodological soundness, and contribution to the field while respecting the author's voice and perspective.`
      },
      {
        question: 'How long do I have to complete a review?',
        answer: `Reviewers typically have 3-4 weeks to complete their review. If you need more time, please contact the editorial office as soon as possible.`
      }
    ],
    technical: [
      {
        question: 'I forgot my password. How do I reset it?',
        answer: `Click on the "Login" button, then select "Forgot Password." Enter the email address associated with your account, and you'll receive instructions for resetting your password.`
      },
      {
        question: 'How do I update my profile information?',
        answer: `Log in to your account, navigate to your profile page, and select "Edit Profile." You can update your personal information, affiliations, research interests, and contact details.`
      },
      {
        question: "I'm having trouble uploading my manuscript. What should I do?",
        answer: `Ensure your manuscript is in PDF format and doesn't exceed 10MB in size. If you continue to experience issues, try using a different browser, clearing your cache, or contact our technical support team through the Contact page.`
      }
    ]
  };

  const categories = [
    { id: 'general', label: 'General Questions' },
    { id: 'authors', label: 'For Authors' },
    { id: 'reviewers', label: 'For Reviewers' },
    { id: 'technical', label: 'Technical Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            {/* African-inspired decorative elements */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent-red rounded-full"></div>
                <div className="w-4 h-4 bg-accent-green rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-5 h-5 bg-accent-red rounded-full"></div>
                <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                <div className="w-4 h-4 bg-white rounded-full"></div>
                <div className="w-3 h-3 bg-accent-red rounded-full"></div>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-neutral-200 max-w-3xl mx-auto">
              Find answers to frequently asked questions about the journal
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="md:flex">
            {/* Categories Sidebar */}
            <div className="md:w-64 bg-neutral-50 p-6 border-r border-neutral-200">
              <h2 className="text-lg font-semibold mb-4 text-accent-black">Categories</h2>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeCategory === category.id
                        ? 'bg-accent-green/10 text-accent-green font-medium border-l-4 border-accent-green'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 p-4 bg-accent-red/10 rounded-md border border-accent-red/20">
                <h3 className="font-medium text-neutral-800 mb-2">Need more help?</h3>
                <p className="text-sm text-neutral-600 mb-3">
                  If you can't find the answer to your question, please contact our support team.
                </p>
                <Link
                  href="/contact"
                  className="text-accent-red text-sm font-medium hover:text-accent-red/80 transition-colors"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
            
            {/* FAQ Content */}
            <div className="p-6 md:p-8 md:flex-1">
              <h2 className="text-2xl font-bold mb-6 text-accent-black">
                {categories.find(c => c.id === activeCategory)?.label}
              </h2>
              
              <div className="space-y-6">
                {helpContent[activeCategory as keyof typeof helpContent].map((item, index) => (
                  <div 
                    key={index} 
                    className="border border-neutral-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                      <h3 className="font-medium text-accent-black">{item.question}</h3>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-neutral-700">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Resources */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-accent-black">Author Guidelines</h3>
            <p className="text-neutral-600 mb-4">
              Detailed instructions for preparing and submitting your manuscript to the journal.
            </p>
            <Link 
              href="/policies"
              className="text-accent-green font-medium hover:text-accent-green/80 transition-colors"
            >
              View Guidelines →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-accent-black">Peer Review Process</h3>
            <p className="text-neutral-600 mb-4">
              Learn about our review process, criteria, and timelines for manuscript evaluation.
            </p>
            <Link 
              href="/policies#peer-review-policy"
              className="text-accent-red font-medium hover:text-accent-red/80 transition-colors"
            >
              Learn More →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="w-12 h-12 bg-accent-black/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-accent-black">Newsletter Subscription</h3>
            <p className="text-neutral-600 mb-4">
              Subscribe to our newsletter to receive updates about new issues and calls for papers.
            </p>
            <Link 
              href="/contact"
              className="text-accent-black font-medium hover:text-accent-black/80 transition-colors"
            >
              Subscribe →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
