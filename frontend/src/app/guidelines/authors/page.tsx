'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthorGuidelinesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Author Guidelines</h1>
          <p className="text-xl text-neutral-300">
            Comprehensive guidelines for submitting manuscripts to the African Journal of Social Work and Social Policy
          </p>
        </div>
      </div>

      {/* Guidelines Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          
          {/* Table of Contents */}
          <div className="bg-accent-green/5 border-l-4 border-accent-green p-6 mb-8">
            <h2 className="text-lg font-semibold text-accent-green mb-4">Quick Navigation</h2>
            <div className="grid md:grid-cols-2 gap-2">
              <a href="#submission" className="text-accent-green hover:underline">• Submission Requirements</a>
              <a href="#formatting" className="text-accent-green hover:underline">• Manuscript Formatting</a>
              <a href="#content" className="text-accent-green hover:underline">• Content Guidelines</a>
              <a href="#ethics" className="text-accent-green hover:underline">• Ethical Standards</a>
              <a href="#review" className="text-accent-green hover:underline">• Review Process</a>
              <a href="#publication" className="text-accent-green hover:underline">• Publication Rights</a>
            </div>
          </div>

          {/* Submission Requirements */}
          <section id="submission" className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              1. Submission Requirements
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-800">Manuscript Types</h3>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                  <li><strong>Research Articles:</strong> Original empirical research (4,000-8,000 words)</li>
                  <li><strong>Review Articles:</strong> Systematic literature reviews (5,000-10,000 words)</li>
                  <li><strong>Case Studies:</strong> Detailed analysis of specific cases (3,000-6,000 words)</li>
                  <li><strong>Brief Communications:</strong> Short research notes (1,500-3,000 words)</li>
                  <li><strong>Commentary:</strong> Opinion pieces on current issues (2,000-4,000 words)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-800">Submission Checklist</h3>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-accent-green rounded-full mr-3"></span>
                      Manuscript follows formatting guidelines
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-accent-green rounded-full mr-3"></span>
                      Title page with author information
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-accent-green rounded-full mr-3"></span>
                      Abstract (250-300 words)
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-accent-green rounded-full mr-3"></span>
                      Keywords (5-7 keywords)
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-accent-green rounded-full mr-3"></span>
                      References in APA format
                    </li>
                    <li className="flex items-center">
                      <span className="w-4 h-4 bg-accent-green rounded-full mr-3"></span>
                      Author declaration and conflict of interest statement
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Manuscript Formatting */}
          <section id="formatting" className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              2. Manuscript Formatting
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-neutral-800">General Format</h3>
                <ul className="space-y-2 text-neutral-700">
                  <li>• Font: Times New Roman, 12pt</li>
                  <li>• Line spacing: Double</li>
                  <li>• Margins: 1 inch on all sides</li>
                  <li>• Page numbers: Bottom center</li>
                  <li>• File format: Microsoft Word (.docx)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-neutral-800">Structure</h3>
                <ul className="space-y-2 text-neutral-700">
                  <li>• Title Page</li>
                  <li>• Abstract & Keywords</li>
                  <li>• Main Text</li>
                  <li>• References</li>
                  <li>• Appendices (if applicable)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Content Guidelines */}
          <section id="content" className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              3. Content Guidelines
            </h2>
            
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-3">Focus Areas</h3>
              <p className="text-amber-700">
                The African Journal of Social Work and Social Policy prioritizes research that promotes 
                Indigenous African knowledge systems and decolonial social work methodologies.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-neutral-800">Preferred Topics</h3>
              <ul className="grid md:grid-cols-2 gap-2 list-disc pl-6 text-neutral-700">
                <li>Indigenous social work practices</li>
                <li>Decolonial methodologies</li>
                <li>Community-based interventions</li>
                <li>African social policy analysis</li>
                <li>Cultural competency in practice</li>
                <li>Ubuntu philosophy in social work</li>
                <li>Traditional healing systems</li>
                <li>Social justice advocacy</li>
              </ul>
            </div>
          </section>

          {/* Ethical Standards */}
          <section id="ethics" className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              4. Ethical Standards
            </h2>
            
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-3">Research Ethics</h3>
                <ul className="space-y-2 text-red-700">
                  <li>• Institutional Review Board (IRB) approval required for human subjects research</li>
                  <li>• Informed consent documentation</li>
                  <li>• Protection of participant confidentiality</li>
                  <li>• Cultural sensitivity in research design</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 text-neutral-800">Publication Ethics</h3>
                <ul className="space-y-2 text-neutral-700 list-disc pl-6">
                  <li>Original work that has not been published elsewhere</li>
                  <li>Proper attribution of all sources</li>
                  <li>Declaration of conflicts of interest</li>
                  <li>Author contribution statements</li>
                  <li>Adherence to copyright policies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Review Process */}
          <section id="review" className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              5. Review Process
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Peer Review Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-4"></div>
                  <span className="text-blue-700"><strong>Initial Review:</strong> 2-3 weeks</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-4"></div>
                  <span className="text-blue-700"><strong>Peer Review:</strong> 6-8 weeks</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-4"></div>
                  <span className="text-blue-700"><strong>Final Decision:</strong> 10-12 weeks</span>
                </div>
              </div>
            </div>
          </section>

          {/* Publication Rights */}
          <section id="publication" className="mb-8">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              6. Publication Rights
            </h2>
            
            <div className="space-y-4 text-neutral-700">
              <p>
                The African Journal of Social Work and Social Policy operates under an 
                <strong> Open Access</strong> model, ensuring broad dissemination of research.
              </p>
              
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Creative Commons License</h3>
                <p className="text-green-700">
                  Published articles are licensed under <strong>CC BY 4.0</strong>, allowing for 
                  maximum reuse and distribution with proper attribution.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-accent-green to-accent-green/80 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Submit?</h3>
            <p className="mb-6 text-lg">
              Join our community of scholars advancing Indigenous African knowledge in social work.
            </p>
            <div className="space-x-4">
              <Link
                href="/register"
                className="bg-white text-accent-green px-6 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors inline-block"
              >
                Create Account
              </Link>
              <Link
                href="/guidelines/submission"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-accent-green transition-colors inline-block"
              >
                Submission Process
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
