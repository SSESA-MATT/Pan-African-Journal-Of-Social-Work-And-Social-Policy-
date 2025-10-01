'use client';

import React from 'react';
import Link from 'next/link';

export default function SubmissionProcessPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Submission Process</h1>
          <p className="text-xl text-neutral-300">
            Step-by-step guide to submitting your research to the African Journal of Social Work and Social Policy
          </p>
        </div>
      </div>

      {/* Process Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          
          {/* Quick Start */}
          <div className="bg-accent-green/10 border-l-4 border-accent-green p-6 mb-8">
            <h2 className="text-lg font-semibold text-accent-green mb-3">Quick Start Guide</h2>
            <p className="text-neutral-700 mb-4">
              Ready to submit? Here's what you need to get started with your manuscript submission to our journal.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-accent-green text-white px-3 py-1 rounded-full text-sm">Registered Account</span>
              <span className="bg-accent-green text-white px-3 py-1 rounded-full text-sm">Formatted Manuscript</span>
              <span className="bg-accent-green text-white px-3 py-1 rounded-full text-sm">Author Information</span>
              <span className="bg-accent-green text-white px-3 py-1 rounded-full text-sm">Ethics Approval</span>
            </div>
          </div>

          {/* Step-by-Step Process */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              Submission Steps
            </h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-neutral-800">Account Registration</h3>
                  <p className="text-neutral-700 mb-4">
                    Create your author account to access our submission system and track your manuscript's progress.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Required Information</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Full name and institutional affiliation</li>
                      <li>• Professional email address</li>
                      <li>• ORCID ID (recommended)</li>
                      <li>• Brief academic biography</li>
                      <li>• Areas of expertise</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/register"
                      className="bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-accent-green/80 transition-colors inline-block"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-neutral-800">Manuscript Preparation</h3>
                  <p className="text-neutral-700 mb-4">
                    Prepare your manuscript according to our formatting guidelines and ethical standards.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">Document Structure</h4>
                      <ul className="space-y-1 text-sm text-amber-700">
                        <li>• Title page with author details</li>
                        <li>• Abstract (250-300 words)</li>
                        <li>• Keywords (5-7 terms)</li>
                        <li>• Main manuscript text</li>
                        <li>• References in APA format</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Article Length Guidelines</h4>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li>• Research articles: 6,000-8,000 words</li>
                        <li>• Review articles: 6,000-8,000 words</li>
                        <li>• Policy briefs: 2,000-3,000 words</li>
                        <li>• Practice notes: 1,500-2,500 words</li>
                        <li>• Student voices: 1,000-1,500 words</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Cultural Considerations</h4>
                      <ul className="space-y-1 text-sm text-green-700">
                        <li>• Indigenous knowledge protocols</li>
                        <li>• Community consent documentation</li>
                        <li>• Cultural sensitivity review</li>
                        <li>• Decolonial framework alignment</li>
                        <li>• Traditional knowledge attribution</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-x-4">
                    <Link
                      href="/guidelines/authors"
                      className="bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-accent-green/80 transition-colors inline-block"
                    >
                      Author Guidelines
                    </Link>
                    <Link
                      href="/guidelines/ethics"
                      className="border border-accent-green text-accent-green px-4 py-2 rounded-lg hover:bg-accent-green hover:text-white transition-colors inline-block"
                    >
                      Ethics Guidelines
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-neutral-800">Online Submission</h3>
                  <p className="text-neutral-700 mb-4">
                    Submit your manuscript through our secure online submission system.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Upload Requirements</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-semibold text-purple-800 mb-1">Main Files</h5>
                        <ul className="space-y-1 text-purple-700">
                          <li>• Manuscript file (.docx)</li>
                          <li>• Title page (separate file)</li>
                          <li>• Figures/tables (if separate)</li>
                          <li>• Supplementary materials</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-purple-800 mb-1">Additional Documents</h5>
                        <ul className="space-y-1 text-purple-700">
                          <li>• Ethics approval certificate</li>
                          <li>• Copyright transfer form</li>
                          <li>• Conflict of interest statement</li>
                          <li>• Community consent forms</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-neutral-100 p-4 rounded-lg">
                    <p className="text-sm text-neutral-700">
                      <strong>Note:</strong> The submission system will guide you through each step and validate 
                      your files before final submission.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">4</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-neutral-800">Editorial Review</h3>
                  <p className="text-neutral-700 mb-4">
                    Your manuscript undergoes initial editorial screening for scope, quality, and ethical compliance.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Initial Screening (1-2 weeks)</h4>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li>• Journal scope alignment</li>
                        <li>• Technical quality assessment</li>
                        <li>• Ethics compliance check</li>
                        <li>• Cultural sensitivity review</li>
                      </ul>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">✓</div>
                        <h4 className="font-semibold text-green-800">Accepted for Review</h4>
                        <p className="text-sm text-green-700 mt-1">Proceeds to peer review</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">!</div>
                        <h4 className="font-semibold text-yellow-800">Revisions Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">Minor changes needed</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-2">✗</div>
                        <h4 className="font-semibold text-red-800">Not Suitable</h4>
                        <p className="text-sm text-red-700 mt-1">Outside journal scope</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">5</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-neutral-800">Peer Review Process</h3>
                  <p className="text-neutral-700 mb-4">
                    Manuscripts undergo rigorous double-blind peer review by experts in the field.
                  </p>
                  <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg mb-4">
                    <h4 className="font-semibold text-indigo-800 mb-3">Review Timeline (6-8 weeks)</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full mr-4"></div>
                        <span className="text-indigo-700"><strong>Week 1:</strong> Reviewer assignment</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full mr-4"></div>
                        <span className="text-indigo-700"><strong>Weeks 2-6:</strong> Review period</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full mr-4"></div>
                        <span className="text-indigo-700"><strong>Weeks 7-8:</strong> Editorial decision</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">Review Criteria</h4>
                      <ul className="space-y-1 text-sm text-neutral-700">
                        <li>• Methodological rigor</li>
                        <li>• Originality and significance</li>
                        <li>• Cultural appropriateness</li>
                        <li>• Decolonial framework application</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 mb-2">Possible Outcomes</h4>
                      <ul className="space-y-1 text-sm text-neutral-700">
                        <li>• Accept without revisions</li>
                        <li>• Accept with minor revisions</li>
                        <li>• Major revisions required</li>
                        <li>• Reject with resubmission option</li>
                        <li>• Reject</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">6</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-neutral-800">Publication & Dissemination</h3>
                  <p className="text-neutral-700 mb-4">
                    Accepted manuscripts undergo final editing and are published in our open access journal.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Publication Process</h4>
                      <ul className="space-y-1 text-sm text-green-700">
                        <li>• Copyediting and formatting</li>
                        <li>• Author proofs for review</li>
                        <li>• Final publication online</li>
                        <li>• DOI assignment and indexing</li>
                        <li>• Social media promotion</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Open Access Benefits</h4>
                      <p className="text-blue-700 text-sm mb-2">
                        Your research will be freely available worldwide under CC BY 4.0 license, maximizing 
                        impact and supporting knowledge democratization.
                      </p>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li>• Immediate global access</li>
                        <li>• Enhanced citation potential</li>
                        <li>• Broader community impact</li>
                        <li>• No paywalls or access barriers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-accent-black mb-6 border-b-2 border-accent-green pb-2">
              Need Help?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Editorial Support</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Get help with submission questions and technical issues.
                </p>
                <Link
                  href="/contact"
                  className="text-accent-green hover:underline"
                >
                  Contact Editors
                </Link>
              </div>
              
              <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Writing Resources</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Access templates, style guides, and formatting tools.
                </p>
                <Link
                  href="/guidelines/authors"
                  className="text-accent-green hover:underline"
                >
                  Author Resources
                </Link>
              </div>
              
              <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-lg text-center">
                <div className="w-12 h-12 bg-accent-green text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">FAQ</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Find answers to common submission questions.
                </p>
                <Link
                  href="/help"
                  className="text-accent-green hover:underline"
                >
                  Help Center
                </Link>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-accent-green to-accent-green/80 text-white p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Share Your Research?</h3>
            <p className="mb-6 text-lg">
              Join our community of scholars advancing Indigenous African knowledge in social work.
            </p>
            <div className="space-x-4">
              <Link
                href="/register"
                className="bg-white text-accent-green px-6 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors inline-block"
              >
                Start Submission
              </Link>
              <Link
                href="/articles"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-accent-green transition-colors inline-block"
              >
                Browse Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
