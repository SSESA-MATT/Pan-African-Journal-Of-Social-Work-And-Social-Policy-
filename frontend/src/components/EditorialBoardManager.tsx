'use client';

import React, { useState, useEffect } from 'react';
import { User } from '../types/auth';

interface EditorialBoardProps {
  currentUser: User;
}

interface EditorialMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  institution: string;
  position: 'editor_in_chief' | 'associate_editor' | 'section_editor' | 'editorial_board_member';
  expertise_areas: string[];
  bio?: string;
  image_url?: string;
  joined_date: string;
  status: 'active' | 'inactive' | 'on_leave';
  workload: {
    manuscripts_assigned: number;
    manuscripts_completed: number;
    average_processing_time: number;
  };
  contact_info?: {
    phone?: string;
    orcid?: string;
    linkedin?: string;
    website?: string;
  };
}

interface NewMemberForm {
  first_name: string;
  last_name: string;
  email: string;
  institution: string;
  position: EditorialMember['position'];
  expertise_areas: string;
  bio: string;
}

const EditorialBoardManager: React.FC<EditorialBoardProps> = ({ currentUser }) => {
  const [editorialMembers, setEditorialMembers] = useState<EditorialMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<EditorialMember | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState<NewMemberForm>({
    first_name: '',
    last_name: '',
    email: '',
    institution: '',
    position: 'editorial_board_member',
    expertise_areas: '',
    bio: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState<'all' | EditorialMember['position']>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEditorialBoard();
  }, []);

  const loadEditorialBoard = async () => {
    try {
      setLoading(true);

      // Mock editorial board data
      const mockMembers: EditorialMember[] = [
        {
          id: '1',
          first_name: 'Dr. Patricia',
          last_name: 'Makena',
          email: 'p.makena@university.ke',
          institution: 'University of Nairobi',
          position: 'editor_in_chief',
          expertise_areas: ['Social Work Theory', 'Community Development', 'African Social Policy'],
          bio: 'Dr. Makena is a renowned social work educator and researcher with over 20 years of experience in community development and social policy analysis across East Africa.',
          joined_date: '2025-01-15T00:00:00Z',
          status: 'active',
          workload: {
            manuscripts_assigned: 45,
            manuscripts_completed: 42,
            average_processing_time: 18
          },
          contact_info: {
            orcid: '0000-0002-1234-5678',
            linkedin: 'patricia-makena',
            website: 'https://pmakena.university.ke'
          }
        },
        {
          id: '2',
          first_name: 'Prof. Ahmed',
          last_name: 'Hassan',
          email: 'a.hassan@university.eg',
          institution: 'Cairo University',
          position: 'associate_editor',
          expertise_areas: ['Mental Health', 'Clinical Social Work', 'Trauma Counseling'],
          bio: 'Prof. Hassan specializes in mental health interventions and has published extensively on trauma-informed social work practice in the Middle East and North Africa.',
          joined_date: '2025-02-01T00:00:00Z',
          status: 'active',
          workload: {
            manuscripts_assigned: 32,
            manuscripts_completed: 28,
            average_processing_time: 22
          },
          contact_info: {
            orcid: '0000-0002-9876-5432'
          }
        },
        {
          id: '3',
          first_name: 'Dr. Nomsa',
          last_name: 'Dlamini',
          email: 'n.dlamini@university.za',
          institution: 'University of the Witwatersrand',
          position: 'section_editor',
          expertise_areas: ['Child Protection', 'Family Social Work', 'Gender Studies'],
          bio: 'Dr. Dlamini is a leading expert in child protection services and family-centered social work practice, with extensive field experience in Southern Africa.',
          joined_date: '2025-02-15T00:00:00Z',
          status: 'active',
          workload: {
            manuscripts_assigned: 28,
            manuscripts_completed: 25,
            average_processing_time: 20
          }
        },
        {
          id: '4',
          first_name: 'Prof. Jean-Baptiste',
          last_name: 'Kouame',
          email: 'jb.kouame@university.ci',
          institution: 'Université Félix Houphouët-Boigny',
          position: 'editorial_board_member',
          expertise_areas: ['Rural Development', 'Agricultural Social Work', 'Community Organization'],
          bio: 'Prof. Kouame has dedicated his career to rural development and agricultural social work, focusing on community organization and sustainable development practices.',
          joined_date: '2025-03-01T00:00:00Z',
          status: 'active',
          workload: {
            manuscripts_assigned: 15,
            manuscripts_completed: 14,
            average_processing_time: 25
          }
        },
        {
          id: '5',
          first_name: 'Dr. Fatou',
          last_name: 'Seck',
          email: 'f.seck@university.sn',
          institution: 'Université Cheikh Anta Diop',
          position: 'editorial_board_member',
          expertise_areas: ['Women Empowerment', 'Microfinance', 'Social Entrepreneurship'],
          bio: 'Dr. Seck is a pioneer in women empowerment and social entrepreneurship, with groundbreaking research on microfinance and social enterprise development.',
          joined_date: '2025-03-15T00:00:00Z',
          status: 'active',
          workload: {
            manuscripts_assigned: 12,
            manuscripts_completed: 11,
            average_processing_time: 19
          }
        },
        {
          id: '6',
          first_name: 'Dr. Kofi',
          last_name: 'Asante',
          email: 'k.asante@university.gh',
          institution: 'University of Ghana',
          position: 'editorial_board_member',
          expertise_areas: ['Youth Development', 'Education Social Work', 'Community Health'],
          bio: 'Dr. Asante specializes in youth development programs and educational social work, with a focus on community health interventions for young people.',
          joined_date: '2025-04-01T00:00:00Z',
          status: 'on_leave',
          workload: {
            manuscripts_assigned: 8,
            manuscripts_completed: 7,
            average_processing_time: 23
          }
        }
      ];

      setEditorialMembers(mockMembers);

    } catch (error) {
      console.error('Error loading editorial board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      // Validate form
      if (!newMemberForm.first_name || !newMemberForm.last_name || !newMemberForm.email || !newMemberForm.institution) {
        alert('Please fill in all required fields');
        return;
      }

      const newMember: EditorialMember = {
        id: Date.now().toString(),
        first_name: newMemberForm.first_name,
        last_name: newMemberForm.last_name,
        email: newMemberForm.email,
        institution: newMemberForm.institution,
        position: newMemberForm.position,
        expertise_areas: newMemberForm.expertise_areas.split(',').map(area => area.trim()).filter(area => area),
        bio: newMemberForm.bio,
        joined_date: new Date().toISOString(),
        status: 'active',
        workload: {
          manuscripts_assigned: 0,
          manuscripts_completed: 0,
          average_processing_time: 0
        }
      };

      setEditorialMembers([...editorialMembers, newMember]);
      setShowAddMemberModal(false);
      setNewMemberForm({
        first_name: '',
        last_name: '',
        email: '',
        institution: '',
        position: 'editorial_board_member',
        expertise_areas: '',
        bio: ''
      });

    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleUpdateMemberStatus = async (memberId: string, newStatus: EditorialMember['status']) => {
    setEditorialMembers(prev =>
      prev.map(member =>
        member.id === memberId ? { ...member, status: newStatus } : member
      )
    );
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member from the editorial board?')) {
      setEditorialMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };

  const filteredMembers = editorialMembers.filter(member => {
    const matchesSearch = searchQuery === '' || 
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.expertise_areas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPosition = filterPosition === 'all' || member.position === filterPosition;
    
    return matchesSearch && matchesPosition;
  });

  const getPositionLabel = (position: EditorialMember['position']) => {
    switch (position) {
      case 'editor_in_chief': return 'Editor-in-Chief';
      case 'associate_editor': return 'Associate Editor';
      case 'section_editor': return 'Section Editor';
      case 'editorial_board_member': return 'Editorial Board Member';
    }
  };

  const getPositionColor = (position: EditorialMember['position']) => {
    switch (position) {
      case 'editor_in_chief': return 'bg-purple-100 text-purple-800';
      case 'associate_editor': return 'bg-blue-100 text-blue-800';
      case 'section_editor': return 'bg-green-100 text-green-800';
      case 'editorial_board_member': return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: EditorialMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading editorial board...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editorial Board Management</h1>
              <p className="text-gray-600 mt-2">Manage the journal's editorial board and governance structure</p>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Member
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Search by name, institution, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Positions</option>
                <option value="editor_in_chief">Editor-in-Chief</option>
                <option value="associate_editor">Associate Editor</option>
                <option value="section_editor">Section Editor</option>
                <option value="editorial_board_member">Board Member</option>
              </select>
            </div>
          </div>
        </div>

        {/* Editorial Board Members */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div key={member.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Member Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold text-lg">
                      {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-gray-600 text-sm">{member.institution}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(member)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>

              {/* Position and Status */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(member.position)}`}>
                  {getPositionLabel(member.position)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                  {member.status.replace('_', ' ')}
                </span>
              </div>

              {/* Expertise Areas */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-1">
                  {member.expertise_areas.slice(0, 3).map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {area}
                    </span>
                  ))}
                  {member.expertise_areas.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{member.expertise_areas.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Workload Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Workload</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{member.workload.manuscripts_assigned}</p>
                    <p className="text-xs text-gray-600">Assigned</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600">{member.workload.manuscripts_completed}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-blue-600">{member.workload.average_processing_time}</p>
                    <p className="text-xs text-gray-600">Avg. Days</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMember(member)}
                  className="flex-1 px-3 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 text-sm transition-colors"
                >
                  View Details
                </button>
                {member.status === 'active' ? (
                  <button
                    onClick={() => handleUpdateMemberStatus(member.id, 'inactive')}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 text-sm transition-colors"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateMemberStatus(member.id, 'active')}
                    className="px-3 py-2 text-green-600 border border-green-300 rounded-md hover:bg-green-50 text-sm transition-colors"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Add Editorial Board Member</h3>
                  <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={newMemberForm.first_name}
                        onChange={(e) => setNewMemberForm({...newMemberForm, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={newMemberForm.last_name}
                        onChange={(e) => setNewMemberForm({...newMemberForm, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={newMemberForm.email}
                      onChange={(e) => setNewMemberForm({...newMemberForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                    <input
                      type="text"
                      value={newMemberForm.institution}
                      onChange={(e) => setNewMemberForm({...newMemberForm, institution: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <select
                      value={newMemberForm.position}
                      onChange={(e) => setNewMemberForm({...newMemberForm, position: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="editorial_board_member">Editorial Board Member</option>
                      <option value="section_editor">Section Editor</option>
                      <option value="associate_editor">Associate Editor</option>
                      <option value="editor_in_chief">Editor-in-Chief</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expertise Areas</label>
                    <input
                      type="text"
                      value={newMemberForm.expertise_areas}
                      onChange={(e) => setNewMemberForm({...newMemberForm, expertise_areas: e.target.value})}
                      placeholder="Separate multiple areas with commas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={newMemberForm.bio}
                      onChange={(e) => setNewMemberForm({...newMemberForm, bio: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief professional biography..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMember}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Member Detail Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Editorial Board Member Details</h3>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start space-x-6 mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-2xl">
                      {selectedMember.first_name.charAt(0)}{selectedMember.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedMember.first_name} {selectedMember.last_name}
                    </h4>
                    <p className="text-gray-600 mb-2">{selectedMember.institution}</p>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(selectedMember.position)}`}>
                        {getPositionLabel(selectedMember.position)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMember.status)}`}>
                        {selectedMember.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-4">Contact Information</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2">{selectedMember.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Joined:</span>
                        <span className="ml-2">{new Date(selectedMember.joined_date).toLocaleDateString()}</span>
                      </div>
                      {selectedMember.contact_info?.orcid && (
                        <div>
                          <span className="text-gray-600">ORCID:</span>
                          <span className="ml-2">{selectedMember.contact_info.orcid}</span>
                        </div>
                      )}
                    </div>

                    <h5 className="font-semibold text-gray-900 mb-4 mt-6">Performance Metrics</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xl font-bold text-gray-900">{selectedMember.workload.manuscripts_assigned}</p>
                        <p className="text-xs text-gray-600">Assigned</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">{selectedMember.workload.manuscripts_completed}</p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-600">{selectedMember.workload.average_processing_time}</p>
                        <p className="text-xs text-gray-600">Avg. Days</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-4">Expertise Areas</h5>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedMember.expertise_areas.map((area, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>

                    {selectedMember.bio && (
                      <>
                        <h5 className="font-semibold text-gray-900 mb-4">Biography</h5>
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedMember.bio}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateMemberStatus(selectedMember.id, selectedMember.status === 'active' ? 'on_leave' : 'active')}
                      className="px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 text-sm transition-colors"
                    >
                      {selectedMember.status === 'active' ? 'Mark On Leave' : 'Mark Active'}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      handleRemoveMember(selectedMember.id);
                      setSelectedMember(null);
                    }}
                    className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 text-sm transition-colors"
                  >
                    Remove Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorialBoardManager;
