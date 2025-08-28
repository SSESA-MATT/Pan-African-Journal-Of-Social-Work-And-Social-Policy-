'use client';

import React from 'react';
import Link from 'next/link';

export default function ReviewerGuidelinesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Reviewer Guidelines</h1>
          <p className="text-xl text-neutral-300">
            Essential guidelines for peer reviewers of the African Journal of Social Work and Social Policy
          </p>
        </div>
      </div>

      {/* Guidelines Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          
          {/* Introduction */}
          <div className="bg-accent-green/10 border-l-4 border-accent-green p-6 mb-8">
            <h2 className="text-lg font-semibold text-accent-green mb-3">Thank You for Your Service</h2>
            <p className="text-neutral-700">
              As a peer reviewer for the African Journal of Social Work and Social Policy, you play a crucial 
              role in maintaining the quality and integrity of scholarly research that advances Indigenous 
              African knowledge systems and decolonial social work methodologies.
            </p>
          </div>

          {/* Reviewer Responsibilities */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              1. Reviewer Responsibilities
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-neutral-800">Core Duties</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-neutral-700">Provide timely, thorough, and constructive reviews</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-neutral-700">Maintain confidentiality of manuscripts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-neutral-700">Declare conflicts of interest</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-neutral-700">Respect cultural contexts and methodologies</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-neutral-800">Timeline Expectations</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Review Invitation Response</h4>
                    <p className="text-blue-700 text-sm">Within 3 days of invitation</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Review Completion</h4>
                    <p className="text-green-700 text-sm">Within 4-6 weeks of acceptance</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Review Criteria */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              2. Review Criteria
            </h2>
            
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">Cultural Competency Focus</h3>
                <p className="text-amber-700 mb-3">
                  Special attention should be given to how manuscripts engage with Indigenous African 
                  knowledge systems and decolonial approaches.
                </p>
                <ul className="space-y-2 text-amber-700 text-sm">
                  <li>• Respect for traditional healing and intervention methods</li>
                  <li>• Integration of Ubuntu philosophy and communalistic values</li>
                  <li>• Recognition of local context and cultural specificity</li>
                </ul>
              </div>
              
              <h3 className="text-xl font-semibold text-neutral-800">Standard Evaluation Areas</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-green mb-3">Methodology</h4>
                  <ul className="space-y-1 text-sm text-neutral-700">
                    <li>• Research design appropriateness</li>
                    <li>• Data collection methods</li>
                    <li>• Sample selection and size</li>
                    <li>• Ethical considerations</li>
                  </ul>
                </div>
                
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-green mb-3">Content Quality</h4>
                  <ul className="space-y-1 text-sm text-neutral-700">
                    <li>• Originality and significance</li>
                    <li>• Literature review depth</li>
                    <li>• Argument clarity</li>
                    <li>• Cultural relevance</li>
                  </ul>
                </div>
                
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-green mb-3">Presentation</h4>
                  <ul className="space-y-1 text-sm text-neutral-700">
                    <li>• Writing quality</li>
                    <li>• Organization structure</li>
                    <li>• Reference accuracy</li>
                    <li>• Format compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Review Process */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              3. Review Process
            </h2>
            
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-neutral-800">Step-by-Step Guide</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-accent-green text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">Initial Assessment</h4>
                    <p className="text-neutral-600 text-sm mt-1">
                      Read the abstract and introduction to understand the manuscript's scope and objectives.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-accent-green text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">Detailed Review</h4>
                    <p className="text-neutral-600 text-sm mt-1">
                      Thoroughly examine methodology, results, discussion, and conclusions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-accent-green text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">Cultural Context Review</h4>
                    <p className="text-neutral-600 text-sm mt-1">
                      Evaluate cultural sensitivity, Indigenous knowledge integration, and decolonial approach.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-accent-green text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">Recommendation</h4>
                    <p className="text-neutral-600 text-sm mt-1">
                      Provide clear recommendation: Accept, Minor Revisions, Major Revisions, or Reject.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Review Template */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              4. Review Template
            </h2>
            
            <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-neutral-800">Suggested Review Structure</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-accent-green">Summary</h4>
                  <p className="text-neutral-600 italic">Brief overview of the manuscript's main contributions and findings.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-accent-green">Strengths</h4>
                  <p className="text-neutral-600 italic">Highlight positive aspects, innovative approaches, and valuable contributions.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-accent-green">Areas for Improvement</h4>
                  <p className="text-neutral-600 italic">Identify specific issues and provide constructive suggestions.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-accent-green">Cultural Considerations</h4>
                  <p className="text-neutral-600 italic">Comment on Indigenous knowledge integration and decolonial methodology application.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-accent-green">Minor Comments</h4>
                  <p className="text-neutral-600 italic">Line-by-line feedback, grammatical corrections, formatting issues.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-accent-green">Recommendation</h4>
                  <p className="text-neutral-600 italic">Clear decision with justification for your recommendation.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Ethics for Reviewers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              5. Ethical Guidelines
            </h2>
            
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Confidentiality & Conflicts</h3>
              <div className="space-y-3 text-red-700">
                <p><strong>Confidentiality:</strong> Manuscripts must remain confidential during and after the review process.</p>
                <p><strong>Conflict of Interest:</strong> Decline reviews when you have personal, professional, or financial conflicts.</p>
                <p><strong>Bias Prevention:</strong> Provide objective reviews free from personal, cultural, or methodological bias.</p>
                <p><strong>Intellectual Property:</strong> Do not use unpublished data or ideas from reviewed manuscripts.</p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-accent-green to-accent-green/80 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Join Our Reviewer Community</h3>
            <p className="mb-6 text-lg">
              Help advance Indigenous African knowledge in social work through rigorous peer review.
            </p>
            <div className="space-x-4">
              <Link
                href="/reviewer"
                className="bg-white text-accent-green px-6 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors inline-block"
              >
                Reviewer Portal
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-accent-green transition-colors inline-block"
              >
                Contact Editors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
