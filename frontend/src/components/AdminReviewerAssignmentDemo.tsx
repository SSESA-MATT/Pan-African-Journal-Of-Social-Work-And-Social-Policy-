'use client';

import React, { useState } from 'react';
import { Manuscript } from '../types/manuscript';
import { User } from '../types/auth';

interface AdminReviewerAssignmentDemoProps {
  currentUser: User;
}

const AdminReviewerAssignmentDemo: React.FC<AdminReviewerAssignmentDemoProps> = ({ currentUser }) => {
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [assignmentStep, setAssignmentStep] = useState<'manuscripts' | 'reviewers' | 'confirm'>('manuscripts');

  // Mock data for demonstration
  const pendingManuscripts: Manuscript[] = [
    {
      id: '1',
      title: 'Community-Based Social Work Interventions in Rural Kenya',
      authors: ['Dr. Sarah Johnson', 'Prof. Michael Okafor'],
      corresponding_author: 'Dr. Sarah Johnson',
      author_id: 'author-1',
      content: 'This study examines the effectiveness of community-based social work interventions...',
      abstract: 'This study examines community-based social work interventions in rural Kenya...',
      keywords: ['Community Development', 'Rural Social Work', 'Kenya', 'Intervention'],
      status: 'submitted',
      submission_date: '2025-08-15T10:00:00Z',
      last_updated: '2025-08-15T10:00:00Z',
    },
    {
      id: '2', 
      title: 'Policy Analysis of Social Protection Programs in West Africa',
      authors: ['Prof. Aminata Traore'],
      corresponding_author: 'Prof. Aminata Traore',
      author_id: 'author-2',
      content: 'An analysis of social protection programs implemented across West African countries...',
      abstract: 'This paper analyzes social protection programs in West Africa...',
      keywords: ['Social Policy', 'West Africa', 'Social Protection', 'Policy Analysis'],
      status: 'submitted',
      submission_date: '2025-08-20T14:30:00Z',
      last_updated: '2025-08-20T14:30:00Z',
    }
  ];

  const availableReviewers = [
    {
      id: 'rev-1',
      first_name: 'Dr. Patricia',
      last_name: 'Makena',
      email: 'p.makena@university.ke',
      institution: 'University of Nairobi',
      expertise: ['Community Development', 'Rural Social Work', 'African Social Policy'],
      current_workload: 3,
      avg_review_time: 18,
      match_score: 95,
      availability: 'available'
    },
    {
      id: 'rev-2',
      first_name: 'Prof. Ahmed',
      last_name: 'Hassan',
      email: 'a.hassan@university.eg',
      institution: 'Cairo University',
      expertise: ['Social Policy', 'Policy Analysis', 'MENA Region'],
      current_workload: 2,
      avg_review_time: 22,
      match_score: 88,
      availability: 'available'
    },
    {
      id: 'rev-3',
      first_name: 'Dr. Nomsa',
      last_name: 'Dlamini',
      email: 'n.dlamini@wits.ac.za',
      institution: 'University of the Witwatersrand',
      expertise: ['Community Intervention', 'Social Development', 'Southern Africa'],
      current_workload: 5,
      avg_review_time: 25,
      match_score: 78,
      availability: 'busy'
    }
  ];

  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);

  const handleSelectManuscript = (manuscript: Manuscript) => {
    setSelectedManuscript(manuscript);
    setAssignmentStep('reviewers');
  };

  const handleToggleReviewer = (reviewerId: string) => {
    if (selectedReviewers.includes(reviewerId)) {
      setSelectedReviewers(prev => prev.filter(id => id !== reviewerId));
    } else {
      setSelectedReviewers(prev => [...prev, reviewerId]);
    }
  };

  const handleAssignReviewers = async () => {
    if (!selectedManuscript || selectedReviewers.length === 0) return;
    
    // Simulate API call
    console.log('Assigning reviewers:', selectedReviewers, 'to manuscript:', selectedManuscript.id);
    
    // Mock assignment process
    alert(`Successfully assigned ${selectedReviewers.length} reviewers to "${selectedManuscript.title}". Email invitations will be sent automatically.`);
    
    // Reset state
    setSelectedManuscript(null);
    setSelectedReviewers([]);
    setAssignmentStep('manuscripts');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin: Reviewer Assignment</h1>
          <p className="text-gray-600 mt-2">Assign qualified reviewers to submitted manuscripts</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${assignmentStep === 'manuscripts' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                assignmentStep === 'manuscripts' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Select Manuscript</span>
            </div>
            
            <div className="flex-grow h-0.5 bg-gray-300 mx-4"></div>
            
            <div className={`flex items-center ${assignmentStep === 'reviewers' ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                assignmentStep === 'reviewers' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Assign Reviewers</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Manuscript */}
        {assignmentStep === 'manuscripts' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Manuscripts Awaiting Reviewer Assignment</h2>
              <p className="text-gray-600 mt-1">Select a manuscript to assign reviewers</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {pendingManuscripts.map(manuscript => (
                <div key={manuscript.id} className="p-6 hover:bg-gray-50 cursor-pointer" 
                     onClick={() => handleSelectManuscript(manuscript)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{manuscript.title}</h3>
                      <p className="text-gray-600 mb-2">
                        <strong>Authors:</strong> {manuscript.authors.join(', ')}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <strong>Keywords:</strong> {manuscript.keywords.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(manuscript.submission_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="ml-6">
                      <div className="flex items-center text-orange-600 bg-orange-100 px-3 py-1 rounded-full text-sm font-medium">
                        ⏳ Awaiting Assignment
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Assign Reviewers */}
        {assignmentStep === 'reviewers' && selectedManuscript && (
          <div className="space-y-6">
            {/* Selected Manuscript Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Manuscript</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">{selectedManuscript.title}</h3>
                <p className="text-blue-700 mt-1">by {selectedManuscript.authors.join(', ')}</p>
                <p className="text-sm text-blue-600 mt-2">
                  <strong>Keywords:</strong> {selectedManuscript.keywords.join(', ')}
                </p>
              </div>
            </div>

            {/* Reviewer Selection */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Available Reviewers</h2>
                <p className="text-gray-600 mt-1">Reviewers are ranked by expertise match and availability</p>
              </div>

              <div className="divide-y divide-gray-200">
                {availableReviewers.map(reviewer => (
                  <div key={reviewer.id} className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedReviewers.includes(reviewer.id)}
                          onChange={() => handleToggleReviewer(reviewer.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="ml-4 flex-grow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {reviewer.first_name} {reviewer.last_name}
                            </h3>
                            <p className="text-gray-600">{reviewer.institution}</p>
                            <p className="text-sm text-gray-500">{reviewer.email}</p>
                          </div>
                          
                          <div className="text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              reviewer.match_score >= 90 ? 'bg-green-100 text-green-800' :
                              reviewer.match_score >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {reviewer.match_score}% Match
                            </div>
                            <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              reviewer.availability === 'available' ? 'bg-green-100 text-green-800' :
                              reviewer.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {reviewer.availability}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Current workload: {reviewer.current_workload} reviews</span>
                            <span>Avg. review time: {reviewer.avg_review_time} days</span>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <strong>Expertise:</strong> {reviewer.expertise.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setAssignmentStep('manuscripts')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                ← Back to Manuscripts
              </button>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedReviewers.length} reviewer(s) selected
                </span>
                <button
                  onClick={handleAssignReviewers}
                  disabled={selectedReviewers.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Assign Reviewers & Send Invitations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewerAssignmentDemo;
