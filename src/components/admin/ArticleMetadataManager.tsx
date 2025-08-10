'use client';

import React, { useState, useEffect } from 'react';
import { articleApi } from '@/lib/articleApi';
import { ArticleWithDetails, ArticleSearchFilters } from '@/types/article';

export const ArticleMetadataManager: React.FC = () => {
  const [articles, setArticles] = useState<ArticleWithDetails[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticleWithDetails[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVolume, setSelectedVolume] = useState<number | ''>('');

  // Form data for editing article metadata
  const [editForm, setEditForm] = useState({
    title: '',
    abstract: '',
    authors: [] as string[],
    keywords: [] as string[]
  });

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedVolume]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all published articles
      const response = await articleApi.getPublishedArticles(1, 1000); // Get all articles
      if (response.articles) {
        setArticles(response.articles.sort((a, b) => 
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedVolume !== '') {
      filtered = filtered.filter(article => article.volume_number === selectedVolume);
    }

    setFilteredArticles(filtered);
  };

  const openEditModal = (article: ArticleWithDetails) => {
    setSelectedArticle(article);
    setEditForm({
      title: article.title,
      abstract: article.abstract,
      authors: [...article.authors],
      keywords: [...article.keywords]
    });
    setShowEditModal(true);
  };

  const handleUpdateArticle = async () => {
    if (!selectedArticle) return;

    try {
      setIsUpdating(true);
      setError(null);

      const response = await articleApi.updateArticle(selectedArticle.id, {
        title: editForm.title,
        abstract: editForm.abstract,
        authors: editForm.authors,
        keywords: editForm.keywords
      });

      if (response.article) {
        // Update the article in the list
        setArticles(prev => prev.map(article => 
          article.id === selectedArticle.id 
            ? { ...article, ...response.article }
            : article
        ));
        
        setShowEditModal(false);
        setSelectedArticle(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(articleId);
      setError(null);

      await articleApi.deleteArticle(articleId);
      
      // Remove the article from the list
      setArticles(prev => prev.filter(article => article.id !== articleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} et al.`;
  };

  const getUniqueVolumes = () => {
    const volumes = Array.from(new Set(articles.map(article => article.volume_number)))
      .sort((a, b) => b - a);
    return volumes;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
        <span className="ml-3 text-neutral-600">Loading articles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-purple-50 to-white">
          <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Article Metadata Management
          </h2>
          <p className="text-neutral-600 mt-1">Edit and manage published article metadata</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-accent-green/10 rounded-full">
              <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Published Articles</p>
              <p className="text-2xl font-bold text-neutral-900">{articles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Active Volumes</p>
              <p className="text-2xl font-bold text-neutral-900">{getUniqueVolumes().length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600">Filtered Results</p>
              <p className="text-2xl font-bold text-neutral-900">{filteredArticles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Search Articles
            </label>
            <input
              type="text"
              placeholder="Search by title, author, abstract, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Filter by Volume
            </label>
            <select
              value={selectedVolume}
              onChange={(e) => setSelectedVolume(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
            >
              <option value="">All Volumes</option>
              {getUniqueVolumes().map((volume) => (
                <option key={volume} value={volume}>
                  Volume {volume}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Published Articles ({filteredArticles.length})
          </h3>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-neutral-600">
              {articles.length === 0 ? 'No articles published yet' : 'No articles match your search criteria'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredArticles.map((article) => (
              <div key={article.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-neutral-900 truncate">
                        {article.title}
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-green-800 border border-green-200">
                        Published
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-3">
                      <span>by {formatAuthors(article.authors)}</span>
                      <span>•</span>
                      <span>Vol. {article.volume_number}, Issue {article.issue_number}</span>
                      <span>•</span>
                      <span>Published {formatDate(article.published_at)}</span>
                    </div>

                    <p className="text-sm text-neutral-700 line-clamp-2 mb-3">
                      {article.abstract}
                    </p>

                    {article.keywords && article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.keywords.slice(0, 5).map((keyword, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                            {keyword}
                          </span>
                        ))}
                        {article.keywords.length > 5 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                            +{article.keywords.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex-shrink-0 flex items-center space-x-2">
                    {article.pdf_url && (
                      <a
                        href={article.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                      >
                        View PDF
                      </a>
                    )}
                    
                    <button
                      onClick={() => openEditModal(article)}
                      className="px-3 py-1.5 text-sm font-medium text-accent-green border border-accent-green rounded-md hover:bg-accent-green hover:text-white transition-colors"
                    >
                      Edit Metadata
                    </button>
                    
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      disabled={isDeleting === article.id}
                      className="px-3 py-1.5 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isDeleting === article.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-red-700 mr-1"></div>
                          Deleting...
                        </div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Article Modal */}
      {showEditModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Edit Article Metadata
            </h3>
            
            <div className="space-y-4">
              {/* Article Info */}
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <p className="text-sm text-neutral-600">
                  <strong>Volume:</strong> {selectedArticle.volume_number}, <strong>Issue:</strong> {selectedArticle.issue_number}
                </p>
                <p className="text-sm text-neutral-600">
                  <strong>Published:</strong> {formatDate(selectedArticle.published_at)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Abstract
                </label>
                <textarea
                  value={editForm.abstract}
                  onChange={(e) => setEditForm(prev => ({ ...prev, abstract: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Authors (one per line)
                </label>
                <textarea
                  value={editForm.authors.join('\n')}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    authors: e.target.value.split('\n').filter(author => author.trim()) 
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  placeholder="Enter author names, one per line"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.keywords.join(', ')}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-green focus:border-transparent"
                  placeholder="Enter keywords separated by commas"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedArticle(null);
                }}
                disabled={isUpdating}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateArticle}
                disabled={isUpdating || !editForm.title.trim() || !editForm.abstract.trim() || editForm.authors.length === 0}
                className="px-4 py-2 bg-accent-green text-white rounded-md hover:bg-accent-green/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Article'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};