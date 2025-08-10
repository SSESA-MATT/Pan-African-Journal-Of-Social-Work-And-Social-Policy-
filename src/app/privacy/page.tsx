'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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

            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-neutral-200 max-w-3xl mx-auto">
              How we collect, use, and protect your personal information
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-8">
            <div className="prose prose-lg max-w-none text-neutral-700">
              <h2 className="text-2xl font-semibold text-accent-black mb-4">Introduction</h2>
              <p>
                The Pan African Journal Of Social Work And Social Policy ("the Journal") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, 
                create an account, submit manuscripts, or participate in the peer review process.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the site.
              </p>

              <h2 className="text-2xl font-semibold text-accent-black mb-4 mt-8">Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-accent-black mb-3">Personal Information</h3>
              <p>
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Register for an account</li>
                <li>Submit a manuscript</li>
                <li>Participate in the peer review process</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us with inquiries</li>
              </ul>
              <p>
                This information may include:
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Name and title</li>
                <li>Email address and contact information</li>
                <li>Academic affiliation</li>
                <li>Research interests and expertise</li>
                <li>Publication history and biographical information</li>
              </ul>

              <h3 className="text-xl font-medium text-accent-black mb-3">Usage Information</h3>
              <p>
                When you access our website, we may automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Geographic location (country level)</li>
                <li>Device information</li>
              </ul>

              <h2 className="text-2xl font-semibold text-accent-black mb-4 mt-8">How We Use Your Information</h2>
              <p>We may use the information we collect for various purposes, including to:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Process manuscript submissions and manage the peer review process</li>
                <li>Communicate with authors, reviewers, and editors about submissions</li>
                <li>Publish accepted articles with appropriate author attribution</li>
                <li>Send notifications about journal issues and announcements</li>
                <li>Improve our website and user experience</li>
                <li>Analyze usage patterns to enhance content and features</li>
                <li>Protect against unauthorized access and ensure data security</li>
              </ul>

              <h2 className="text-2xl font-semibold text-accent-black mb-4 mt-8">Information Sharing</h2>
              <p>
                We respect your privacy and are committed to protecting your personal information. We do not sell, 
                trade, or otherwise transfer your personal information to outside parties except in the following circumstances:
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>With editors and peer reviewers as part of the publication process</li>
                <li>With our trusted service providers who assist in operating our website and journal</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>

              <h2 className="text-2xl font-semibold text-accent-black mb-4 mt-8">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information. 
                However, no method of transmission over the internet or electronic storage is 100% secure, and we 
                cannot guarantee absolute security of your data.
              </p>

              <h2 className="text-2xl font-semibold text-accent-black mb-4 mt-8">Your Rights</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate or incomplete information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing of your personal information</li>
                <li>Data portability</li>
                <li>Objection to processing of your personal information</li>
              </ul>

              <h2 className="text-2xl font-semibold text-accent-black mb-4 mt-8">Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>

              <h2 className="text-2xl font-semibold text-accent-black mb-4 mt-8">Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy, please contact us at:
              </p>
              <p className="bg-neutral-50 p-4 rounded-md border border-neutral-200 mt-2">
                <strong>Email:</strong> privacy@africajournal.org<br />
                <strong>Address:</strong> East Africa Social Work Regional Resource Centre<br />
                P.O. Box 12345<br />
                Nairobi, Kenya
              </p>

              <div className="mt-8 text-sm text-neutral-500">
                <p>Last Updated: August 1, 2023</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 bg-accent-green text-white font-medium rounded-md hover:bg-accent-green/80 transition-colors"
          >
            Contact Us With Questions
          </Link>
        </div>
      </div>
    </div>
  );
}
