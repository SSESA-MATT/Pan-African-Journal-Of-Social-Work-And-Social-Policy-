'use client';

import React, { useState, useEffect } from 'react';
import { User } from '../types/auth';

interface SystemSettingsProps {
  currentUser: User;
}

interface JournalSettings {
  id: string;
  journal_name: string;
  issn_print?: string;
  issn_online?: string;
  publisher: string;
  description: string;
  website_url?: string;
  contact_email: string;
  submission_guidelines: string;
  peer_review_policy: string;
  publication_frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'biannually' | 'annually';
  open_access: boolean;
  article_processing_charge?: number;
  copyright_policy: string;
  plagiarism_threshold: number;
  auto_assignment_enabled: boolean;
  reviewer_deadline_days: number;
  author_revision_days: number;
  editor_decision_days: number;
  notification_settings: {
    email_notifications: boolean;
    submission_notifications: boolean;
    review_notifications: boolean;
    publication_notifications: boolean;
  };
  manuscript_categories: string[];
  supported_file_types: string[];
  max_file_size_mb: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: 'submission' | 'review' | 'publication' | 'system';
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [journalSettings, setJournalSettings] = useState<JournalSettings | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      setLoading(true);

      // Mock journal settings data
      const mockSettings: JournalSettings = {
        id: '1',
        journal_name: 'Pan-African Journal of Social Work',
        issn_print: '2789-1234',
        issn_online: '2789-5678',
        publisher: 'Pan-African Social Work Consortium',
        description: 'A premier journal dedicated to advancing social work practice, education, and research across Africa and the global South.',
        website_url: 'https://paajsw.org',
        contact_email: 'editor@paajsw.org',
        submission_guidelines: 'Manuscripts should be original research articles, reviews, or case studies related to social work practice in African contexts. All submissions must follow APA 7th edition formatting.',
        peer_review_policy: 'All submissions undergo double-blind peer review by at least two experts in the field.',
        publication_frequency: 'quarterly',
        open_access: true,
        article_processing_charge: 0,
        copyright_policy: 'Creative Commons Attribution 4.0 International License',
        plagiarism_threshold: 15,
        auto_assignment_enabled: true,
        reviewer_deadline_days: 21,
        author_revision_days: 30,
        editor_decision_days: 14,
        notification_settings: {
          email_notifications: true,
          submission_notifications: true,
          review_notifications: true,
          publication_notifications: true
        },
        manuscript_categories: [
          'Community Development',
          'Child and Family Services',
          'Mental Health',
          'Social Policy',
          'Research Methods',
          'Education and Training',
          'Clinical Practice',
          'Human Rights',
          'Gender Studies',
          'Rural Development'
        ],
        supported_file_types: ['.docx', '.pdf', '.tex', '.rtf'],
        max_file_size_mb: 25
      };

      // Mock email templates
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Submission Confirmation',
          subject: 'Manuscript Submission Received - {{manuscript_title}}',
          content: `Dear {{author_name}},

Thank you for submitting your manuscript "{{manuscript_title}}" to the Pan-African Journal of Social Work.

Submission Details:
- Manuscript ID: {{manuscript_id}}
- Submission Date: {{submission_date}}
- Category: {{category}}

Your manuscript is now undergoing initial editorial review. You will receive updates on the review progress via email.

Best regards,
Editorial Team
Pan-African Journal of Social Work`,
          variables: ['author_name', 'manuscript_title', 'manuscript_id', 'submission_date', 'category'],
          category: 'submission'
        },
        {
          id: '2',
          name: 'Review Invitation',
          subject: 'Invitation to Review Manuscript - {{manuscript_title}}',
          content: `Dear {{reviewer_name}},

We invite you to serve as a peer reviewer for the following manuscript submitted to the Pan-African Journal of Social Work:

Title: {{manuscript_title}}
Abstract: {{abstract}}
Keywords: {{keywords}}

Review Deadline: {{review_deadline}}

Please confirm your availability to review this manuscript by {{response_deadline}}.

Access the manuscript: {{review_link}}

Thank you for your contribution to advancing social work scholarship.

Best regards,
{{editor_name}}
{{editor_title}}`,
          variables: ['reviewer_name', 'manuscript_title', 'abstract', 'keywords', 'review_deadline', 'response_deadline', 'review_link', 'editor_name', 'editor_title'],
          category: 'review'
        },
        {
          id: '3',
          name: 'Review Decision - Accept',
          subject: 'Manuscript Accepted - {{manuscript_title}}',
          content: `Dear {{author_name}},

Congratulations! Your manuscript "{{manuscript_title}}" has been accepted for publication in the Pan-African Journal of Social Work.

Next Steps:
1. Complete the publication agreement
2. Prepare final manuscript files
3. Provide author biographies and photographs

Expected Publication: {{publication_date}}

Thank you for your valuable contribution to social work literature.

Best regards,
{{editor_name}}
Editor-in-Chief`,
          variables: ['author_name', 'manuscript_title', 'publication_date', 'editor_name'],
          category: 'publication'
        },
        {
          id: '4',
          name: 'System Maintenance Notice',
          subject: 'Scheduled System Maintenance - {{maintenance_date}}',
          content: `Dear Users,

This is to notify you of scheduled system maintenance for the Pan-African Journal of Social Work submission system.

Maintenance Window: {{maintenance_date}} from {{start_time}} to {{end_time}} ({{timezone}})

During this time, the system will be unavailable. Please plan your submissions accordingly.

We apologize for any inconvenience.

Best regards,
Technical Team`,
          variables: ['maintenance_date', 'start_time', 'end_time', 'timezone'],
          category: 'system'
        }
      ];

      setJournalSettings(mockSettings);
      setEmailTemplates(mockTemplates);

    } catch (error) {
      console.error('Error loading system settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!journalSettings) return;
    
    try {
      setSaving(true);
      // Here you would save to your backend
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const updatedTemplates = emailTemplates.map(template =>
        template.id === selectedTemplate.id ? selectedTemplate : template
      );
      setEmailTemplates(updatedTemplates);
      setShowTemplateModal(false);
      setSelectedTemplate(null);
      alert('Email template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'submission', name: 'Submission', icon: '📝' },
    { id: 'review', name: 'Review Process', icon: '👥' },
    { id: 'notifications', name: 'Notifications', icon: '📧' },
    { id: 'templates', name: 'Email Templates', icon: '📄' },
    { id: 'categories', name: 'Categories', icon: '📂' }
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading system settings...</div>;
  }

  if (!journalSettings) {
    return <div className="p-6 text-center text-red-600">Error loading settings</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure journal settings, policies, and system preferences</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">General Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Journal Name</label>
                  <input
                    type="text"
                    value={journalSettings.journal_name}
                    onChange={(e) => setJournalSettings({...journalSettings, journal_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
                  <input
                    type="text"
                    value={journalSettings.publisher}
                    onChange={(e) => setJournalSettings({...journalSettings, publisher: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ISSN (Print)</label>
                  <input
                    type="text"
                    value={journalSettings.issn_print || ''}
                    onChange={(e) => setJournalSettings({...journalSettings, issn_print: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ISSN (Online)</label>
                  <input
                    type="text"
                    value={journalSettings.issn_online || ''}
                    onChange={(e) => setJournalSettings({...journalSettings, issn_online: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={journalSettings.contact_email}
                    onChange={(e) => setJournalSettings({...journalSettings, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                  <input
                    type="url"
                    value={journalSettings.website_url || ''}
                    onChange={(e) => setJournalSettings({...journalSettings, website_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Journal Description</label>
                <textarea
                  value={journalSettings.description}
                  onChange={(e) => setJournalSettings({...journalSettings, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publication Frequency</label>
                  <select
                    value={journalSettings.publication_frequency}
                    onChange={(e) => setJournalSettings({...journalSettings, publication_frequency: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bimonthly">Bimonthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannually">Biannually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="open_access"
                    checked={journalSettings.open_access}
                    onChange={(e) => setJournalSettings({...journalSettings, open_access: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="open_access" className="ml-2 block text-sm text-gray-900">
                    Open Access Journal
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Submission Settings */}
          {activeTab === 'submission' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Submission Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submission Guidelines</label>
                <textarea
                  value={journalSettings.submission_guidelines}
                  onChange={(e) => setJournalSettings({...journalSettings, submission_guidelines: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum File Size (MB)</label>
                  <input
                    type="number"
                    value={journalSettings.max_file_size_mb}
                    onChange={(e) => setJournalSettings({...journalSettings, max_file_size_mb: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plagiarism Threshold (%)</label>
                  <input
                    type="number"
                    value={journalSettings.plagiarism_threshold}
                    onChange={(e) => setJournalSettings({...journalSettings, plagiarism_threshold: parseInt(e.target.value)})}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supported File Types</label>
                <input
                  type="text"
                  value={journalSettings.supported_file_types.join(', ')}
                  onChange={(e) => setJournalSettings({...journalSettings, supported_file_types: e.target.value.split(',').map(type => type.trim())})}
                  placeholder=".docx, .pdf, .tex, .rtf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Review Process Settings */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review Process Configuration</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peer Review Policy</label>
                <textarea
                  value={journalSettings.peer_review_policy}
                  onChange={(e) => setJournalSettings({...journalSettings, peer_review_policy: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Deadline (days)</label>
                  <input
                    type="number"
                    value={journalSettings.reviewer_deadline_days}
                    onChange={(e) => setJournalSettings({...journalSettings, reviewer_deadline_days: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author Revision (days)</label>
                  <input
                    type="number"
                    value={journalSettings.author_revision_days}
                    onChange={(e) => setJournalSettings({...journalSettings, author_revision_days: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Editor Decision (days)</label>
                  <input
                    type="number"
                    value={journalSettings.editor_decision_days}
                    onChange={(e) => setJournalSettings({...journalSettings, editor_decision_days: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto_assignment"
                  checked={journalSettings.auto_assignment_enabled}
                  onChange={(e) => setJournalSettings({...journalSettings, auto_assignment_enabled: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="auto_assignment" className="ml-2 block text-sm text-gray-900">
                  Enable Automatic Reviewer Assignment
                </label>
              </div>
            </div>
          )}

          {/* Email Templates */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Email Templates</h2>
                <button
                  onClick={() => {
                    setSelectedTemplate({
                      id: Date.now().toString(),
                      name: '',
                      subject: '',
                      content: '',
                      variables: [],
                      category: 'system'
                    });
                    setShowTemplateModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emailTemplates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-gray-600 text-sm">{template.category}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowTemplateModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">Subject:</p>
                      <p className="text-sm text-gray-900">{template.subject}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700">Variables:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.variables.map((variable, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Manuscript Categories</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Categories</label>
                <textarea
                  value={journalSettings.manuscript_categories.join('\n')}
                  onChange={(e) => setJournalSettings({...journalSettings, manuscript_categories: e.target.value.split('\n').filter(cat => cat.trim())})}
                  rows={10}
                  placeholder="Enter one category per line"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Categories:</h4>
                <div className="flex flex-wrap gap-2">
                  {journalSettings.manuscript_categories.map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Template Modal */}
        {showTemplateModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Edit Email Template</h3>
                  <button
                    onClick={() => setShowTemplateModal(false)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                      <input
                        type="text"
                        value={selectedTemplate.name}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={selectedTemplate.category}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, category: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="submission">Submission</option>
                        <option value="review">Review</option>
                        <option value="publication">Publication</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                    <input
                      type="text"
                      value={selectedTemplate.subject}
                      onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
                    <textarea
                      value={selectedTemplate.content}
                      onChange={(e) => setSelectedTemplate({...selectedTemplate, content: e.target.value})}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Variables</label>
                    <input
                      type="text"
                      value={selectedTemplate.variables.join(', ')}
                      onChange={(e) => setSelectedTemplate({...selectedTemplate, variables: e.target.value.split(',').map(v => v.trim()).filter(v => v)})}
                      placeholder="author_name, manuscript_title, submission_date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Variables can be used in subject and content using {`{{variable_name}}`} syntax</p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Template
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

export default SystemSettings;
