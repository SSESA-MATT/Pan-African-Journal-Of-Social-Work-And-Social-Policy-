'use client';

import React, { useState, useEffect } from 'react';
import { Manuscript } from '../types/manuscript';
import { User } from '../types/auth';

interface PublicationManagerProps {
  currentUser: User;
}

interface PublicationStage {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignee?: string;
  due_date?: string;
  completed_date?: string;
  notes?: string;
}

interface ManuscriptPublication extends Manuscript {
  publication_stages: PublicationStage[];
  doi?: string;
  volume?: number;
  issue?: number;
  page_start?: number;
  page_end?: number;
  publication_date?: string;
  final_manuscript_url?: string;
  proof_version_url?: string;
}

interface VolumeIssue {
  id: string;
  volume: number;
  issue: number;
  title?: string;
  planned_publication_date: string;
  status: 'planning' | 'in_progress' | 'published';
  manuscripts_count: number;
  total_pages?: number;
}

const PublicationManager: React.FC<PublicationManagerProps> = ({ currentUser }) => {
  const [acceptedManuscripts, setAcceptedManuscripts] = useState<ManuscriptPublication[]>([]);
  const [volumes, setVolumes] = useState<VolumeIssue[]>([]);
  const [selectedManuscript, setSelectedManuscript] = useState<ManuscriptPublication | null>(null);
  const [activeTab, setActiveTab] = useState<'production' | 'scheduling' | 'published'>('production');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicationData();
  }, []);

  const loadPublicationData = async () => {
    try {
      setLoading(true);

      // Mock data for accepted manuscripts in production
      const mockManuscripts: ManuscriptPublication[] = [
        {
          id: '1',
          title: 'Community-Based Social Work Interventions in Rural Africa',
          authors: ['Dr. Sarah Johnson', 'Prof. Michael Okafor'],
          corresponding_author: 'Dr. Sarah Johnson',
          author_id: 'author-1',
          content: 'Full manuscript content would be here...',
          status: 'accepted',
          submission_date: '2025-07-15T10:00:00Z',
          last_updated: '2025-08-25T14:30:00Z',
          keywords: ['Social Work', 'Rural Development', 'Community Intervention'],
          abstract: 'This study examines the effectiveness of community-based social work interventions...',
          manuscript_url: '/files/manuscript-1.pdf',
          doi: '10.1234/ajsw.2025.1.001',
          volume: 1,
          issue: 2,
          publication_stages: [
            {
              id: 'copyedit',
              name: 'Copy Editing',
              status: 'completed',
              assignee: 'editor@journal.com',
              due_date: '2025-08-20T00:00:00Z',
              completed_date: '2025-08-18T16:30:00Z',
              notes: 'Minor grammatical corrections made'
            },
            {
              id: 'typeset',
              name: 'Typesetting & Layout',
              status: 'in_progress',
              assignee: 'designer@journal.com',
              due_date: '2025-08-30T00:00:00Z',
              notes: 'Formatting according to journal style guide'
            },
            {
              id: 'proofread',
              name: 'Proofreading',
              status: 'pending',
              due_date: '2025-09-05T00:00:00Z'
            },
            {
              id: 'author_approval',
              name: 'Author Proof Approval',
              status: 'pending',
              due_date: '2025-09-10T00:00:00Z'
            },
            {
              id: 'final_check',
              name: 'Final Quality Check',
              status: 'pending',
              due_date: '2025-09-12T00:00:00Z'
            },
            {
              id: 'publish',
              name: 'Publication',
              status: 'pending',
              due_date: '2025-09-15T00:00:00Z'
            }
          ]
        },
        {
          id: '2',
          title: 'Policy Analysis of Social Protection Programs in West Africa',
          authors: ['Prof. Aminata Traore'],
          corresponding_author: 'Prof. Aminata Traore',
          author_id: 'author-2',
          content: 'Full manuscript content would be here...',
          status: 'accepted',
          submission_date: '2025-07-10T09:15:00Z',
          last_updated: '2025-08-26T11:20:00Z',
          keywords: ['Social Policy', 'Social Protection', 'West Africa'],
          abstract: 'An analysis of social protection programs implemented across West African countries...',
          manuscript_url: '/files/manuscript-2.pdf',
          publication_stages: [
            {
              id: 'copyedit',
              name: 'Copy Editing',
              status: 'pending',
              assignee: 'editor@journal.com',
              due_date: '2025-08-28T00:00:00Z'
            },
            {
              id: 'typeset',
              name: 'Typesetting & Layout',
              status: 'pending',
              due_date: '2025-09-05T00:00:00Z'
            },
            {
              id: 'proofread',
              name: 'Proofreading',
              status: 'pending',
              due_date: '2025-09-10T00:00:00Z'
            },
            {
              id: 'author_approval',
              name: 'Author Proof Approval',
              status: 'pending',
              due_date: '2025-09-15T00:00:00Z'
            },
            {
              id: 'final_check',
              name: 'Final Quality Check',
              status: 'pending',
              due_date: '2025-09-17T00:00:00Z'
            },
            {
              id: 'publish',
              name: 'Publication',
              status: 'pending',
              due_date: '2025-09-20T00:00:00Z'
            }
          ]
        }
      ];

      const mockVolumes: VolumeIssue[] = [
        {
          id: 'v1-i1',
          volume: 1,
          issue: 1,
          title: 'Inaugural Issue: Foundations of African Social Work',
          planned_publication_date: '2025-06-15T00:00:00Z',
          status: 'published',
          manuscripts_count: 8,
          total_pages: 120
        },
        {
          id: 'v1-i2',
          volume: 1,
          issue: 2,
          title: 'Community Development and Social Policy',
          planned_publication_date: '2025-09-15T00:00:00Z',
          status: 'in_progress',
          manuscripts_count: 6,
          total_pages: 95
        },
        {
          id: 'v1-i3',
          volume: 1,
          issue: 3,
          title: 'Special Issue: Youth and Social Change',
          planned_publication_date: '2025-12-15T00:00:00Z',
          status: 'planning',
          manuscripts_count: 4,
          total_pages: 80
        }
      ];

      setAcceptedManuscripts(mockManuscripts);
      setVolumes(mockVolumes);

    } catch (error) {
      console.error('Error loading publication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStageStatus = async (manuscriptId: string, stageId: string, newStatus: PublicationStage['status'], notes?: string) => {
    setAcceptedManuscripts(prev => 
      prev.map(manuscript => {
        if (manuscript.id === manuscriptId) {
          return {
            ...manuscript,
            publication_stages: manuscript.publication_stages.map(stage => {
              if (stage.id === stageId) {
                return {
                  ...stage,
                  status: newStatus,
                  completed_date: newStatus === 'completed' ? new Date().toISOString() : stage.completed_date,
                  notes: notes || stage.notes
                };
              }
              return stage;
            })
          };
        }
        return manuscript;
      })
    );
  };

  const assignManuscriptToIssue = async (manuscriptId: string, volumeId: string) => {
    // TODO: Implementation would assign manuscript to specific volume/issue
  };

  const generateDOI = async (manuscriptId: string) => {
    // Implementation would generate DOI for manuscript
    const doi = `10.1234/ajsw.2025.${Math.floor(Math.random() * 1000)}`;
    setAcceptedManuscripts(prev =>
      prev.map(manuscript =>
        manuscript.id === manuscriptId ? { ...manuscript, doi } : manuscript
      )
    );
  };

  const getStageStatusColor = (status: PublicationStage['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVolumeStatusColor = (status: VolumeIssue['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageProgress = (stages: PublicationStage[]) => {
    const completed = stages.filter(s => s.status === 'completed').length;
    return (completed / stages.length) * 100;
  };

  if (loading) {
    return <div className="p-6 text-center">Loading publication data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Publication Management</h1>
          <p className="text-gray-600 mt-2">Manage the production and publication of accepted manuscripts</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { key: 'production', label: 'Production Pipeline', count: acceptedManuscripts.length },
                { key: 'scheduling', label: 'Volume Scheduling', count: volumes.filter(v => v.status !== 'published').length },
                { key: 'published', label: 'Published', count: volumes.filter(v => v.status === 'published').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium ${
                    activeTab === tab.key
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Production Pipeline Tab */}
            {activeTab === 'production' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Manuscripts in Production</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Add to Production
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {acceptedManuscripts.map(manuscript => (
                    <div key={manuscript.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900 line-clamp-2">{manuscript.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">by {manuscript.authors.join(', ')}</p>
                          {manuscript.doi && (
                            <p className="text-blue-600 text-sm mt-1">DOI: {manuscript.doi}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedManuscript(manuscript)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-4"
                        >
                          Manage
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Production Progress</span>
                          <span className="text-sm text-gray-500">
                            {Math.round(getStageProgress(manuscript.publication_stages))}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${getStageProgress(manuscript.publication_stages)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Current Stage */}
                      <div className="space-y-2">
                        {manuscript.publication_stages.map(stage => (
                          <div key={stage.id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{stage.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageStatusColor(stage.status)}`}>
                              {stage.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        {manuscript.volume && manuscript.issue ? (
                          <span className="text-sm text-gray-600">
                            Vol. {manuscript.volume}, Issue {manuscript.issue}
                          </span>
                        ) : (
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Assign to Issue
                          </button>
                        )}
                        
                        {!manuscript.doi && (
                          <button 
                            onClick={() => generateDOI(manuscript.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Generate DOI
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Volume Scheduling Tab */}
            {activeTab === 'scheduling' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Volume & Issue Planning</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Create New Issue
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {volumes.map(volume => (
                    <div key={volume.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Volume {volume.volume}, Issue {volume.issue}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">{volume.title}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVolumeStatusColor(volume.status)}`}>
                          {volume.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Manuscripts</span>
                          <span className="font-medium">{volume.manuscripts_count}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Pages</span>
                          <span className="font-medium">{volume.total_pages || 'TBD'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Publication Date</span>
                          <span className="font-medium">
                            {new Date(volume.planned_publication_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Manage Issue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Published Tab */}
            {activeTab === 'published' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Published Issues</h3>
                <div className="space-y-4">
                  {volumes.filter(v => v.status === 'published').map(volume => (
                    <div key={volume.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Volume {volume.volume}, Issue {volume.issue}: {volume.title}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">
                            Published: {new Date(volume.planned_publication_date).toLocaleDateString()} •{' '}
                            {volume.manuscripts_count} articles • {volume.total_pages} pages
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                            View Issue
                          </button>
                          <button className="px-3 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 text-sm">
                            Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manuscript Detail Modal */}
        {selectedManuscript && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Production Management</h3>
                  <button
                    onClick={() => setSelectedManuscript(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 mt-1">{selectedManuscript.title}</p>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {selectedManuscript.publication_stages.map((stage, index) => (
                    <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{stage.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageStatusColor(stage.status)}`}>
                          {stage.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Due Date:</span>
                          <span className="ml-2">
                            {stage.due_date ? new Date(stage.due_date).toLocaleDateString() : 'Not set'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Assignee:</span>
                          <span className="ml-2">{stage.assignee || 'Unassigned'}</span>
                        </div>
                        {stage.completed_date && (
                          <div>
                            <span className="text-gray-600">Completed:</span>
                            <span className="ml-2">{new Date(stage.completed_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {stage.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{stage.notes}</p>
                        </div>
                      )}

                      <div className="mt-4 flex items-center space-x-2">
                        {stage.status === 'pending' && (
                          <button
                            onClick={() => updateStageStatus(selectedManuscript.id, stage.id, 'in_progress')}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            Start
                          </button>
                        )}
                        {stage.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => updateStageStatus(selectedManuscript.id, stage.id, 'completed')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateStageStatus(selectedManuscript.id, stage.id, 'blocked')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                            >
                              Block
                            </button>
                          </>
                        )}
                        {stage.status === 'blocked' && (
                          <button
                            onClick={() => updateStageStatus(selectedManuscript.id, stage.id, 'in_progress')}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            Unblock
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicationManager;
