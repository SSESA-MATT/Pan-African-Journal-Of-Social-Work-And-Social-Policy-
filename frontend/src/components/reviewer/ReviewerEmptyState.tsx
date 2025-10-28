'use client';

import React from 'react';
import { User } from '@/types/auth';

interface ReviewerEmptyStateProps {
  reviewer: User;
  isFirstTime?: boolean;
  onboardingCompleted?: boolean;
}

export const ReviewerEmptyState: React.FC<ReviewerEmptyStateProps> = ({
  reviewer,
  isFirstTime = false,
  onboardingCompleted = false
}) => {
  const reviewerName = `${reviewer.first_name} ${reviewer.last_name}`.trim() || reviewer.email;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-accent-green to-accent-green/80 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {isFirstTime ? `Welcome to the Review Team, ${reviewerName}!` : `Welcome back, ${reviewerName}!`}
        </h1>
        
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          {isFirstTime 
            ? "Thank you for joining the Pan-African Journal of Social Work and Social Policy as a peer reviewer. Your expertise will help maintain our publication's high standards."
            : "You currently have no pending review assignments. New assignments will appear here when they become available."
          }
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Pending Reviews</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">0</p>
          <p className="text-sm text-neutral-500">No assignments yet</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Completed Reviews</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">0</p>
          <p className="text-sm text-neutral-500">Ready to start</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Average Turnaround</h3>
          <p className="text-3xl font-bold text-accent-green mb-2">-</p>
          <p className="text-sm text-neutral-500">No data yet</p>
        </div>
      </div>

      {/* What to Expect Section */}
      <div className="bg-gradient-to-r from-accent-green/5 to-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
          <svg className="w-6 h-6 text-accent-green mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          What to Expect
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-neutral-800 mb-2">Assignment Timeline</h3>
            <ul className="space-y-2 text-neutral-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Reviews are typically assigned within 2-4 weeks of joining</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>You'll receive 2-4 weeks to complete each review</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-accent-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Most reviewers handle 2-4 manuscripts per year</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 mb-2">Review Process</h3>
            <ul className="space-y-2 text-neutral-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Receive assignment notification via email</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Accept or decline within 5 days</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Complete review using our online form</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button className="bg-white border border-neutral-200 rounded-lg p-4 text-left hover:border-accent-green hover:shadow-sm transition-all duration-200">
          <div className="w-8 h-8 bg-accent-green/10 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-1">Review Guidelines</h3>
          <p className="text-sm text-neutral-600">Learn our review criteria and standards</p>
        </button>

        <button className="bg-white border border-neutral-200 rounded-lg p-4 text-left hover:border-accent-green hover:shadow-sm transition-all duration-200">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-1">Sample Reviews</h3>
          <p className="text-sm text-neutral-600">See examples of high-quality reviews</p>
        </button>

        <button className="bg-white border border-neutral-200 rounded-lg p-4 text-left hover:border-accent-green hover:shadow-sm transition-all duration-200">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-1">Update Profile</h3>
          <p className="text-sm text-neutral-600">Set your expertise and availability</p>
        </button>

        <button className="bg-white border border-neutral-200 rounded-lg p-4 text-left hover:border-accent-green hover:shadow-sm transition-all duration-200">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-1">Contact Editors</h3>
          <p className="text-sm text-neutral-600">Get help or ask questions</p>
        </button>
      </div>

      {/* Support Information */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-accent-green mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
          </svg>
          Need Help?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-neutral-800 mb-2">Editorial Support</h3>
            <p className="text-neutral-600 mb-2">
              Our editorial team is here to help with any questions about the review process.
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-neutral-600">
                <span className="font-medium">Email:</span> editorial@pajswsp.org
              </p>
              <p className="text-neutral-600">
                <span className="font-medium">Response time:</span> Within 24 hours
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-neutral-800 mb-2">Technical Support</h3>
            <p className="text-neutral-600 mb-2">
              Having trouble with the platform? We're here to help.
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-neutral-600">
                <span className="font-medium">Email:</span> support@pajswsp.org
              </p>
              <p className="text-neutral-600">
                <span className="font-medium">Hours:</span> Monday-Friday, 9 AM - 5 PM EAT
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* First Time User Call to Action */}
      {isFirstTime && !onboardingCompleted && (
        <div className="mt-8 bg-gradient-to-r from-accent-green to-accent-green/80 rounded-lg p-6 text-white text-center">
          <h2 className="text-xl font-semibold mb-2">Ready to Get Started?</h2>
          <p className="mb-4 opacity-90">
            Take a quick tour of your reviewer dashboard and learn about our review process.
          </p>
          <button className="bg-white text-accent-green px-6 py-2 rounded-md font-medium hover:bg-neutral-50 transition-colors">
            Start Onboarding Tour
          </button>
        </div>
      )}
    </div>
  );
};