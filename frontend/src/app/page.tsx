'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../components/AuthProvider';
import { articleApi } from '../lib/articleApi';
import { ArticleWithDetails, VolumeWithIssues } from '../types/article';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [latestArticles, setLatestArticles] = useState<ArticleWithDetails[]>([]);
  const [latestVolumes, setLatestVolumes] = useState<VolumeWithIssues[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLatestContent();
  }, []);

  const loadLatestContent = async () => {
    try {
      setIsLoading(true);

      // Load latest articles
      const articlesResponse = await articleApi.getPublishedArticles(1, 6);
      if (articlesResponse.articles) {
        setLatestArticles(articlesResponse.articles);
      }

      // Load latest volumes
      const volumesResponse = await articleApi.getVolumes();
      if (volumesResponse.volumes) {
        setLatestVolumes(volumesResponse.volumes.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load latest content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} et al.`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Hero Section with African-inspired design */}
      <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            {/* African-inspired decorative elements */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-accent-red rounded-full"></div>
                <div className="w-6 h-6 bg-accent-green rounded-full"></div>
                <div className="w-4 h-4 bg-white rounded-full"></div>
                <div className="w-8 h-8 bg-accent-red rounded-full"></div>
                <div className="w-4 h-4 bg-accent-green rounded-full"></div>
                <div className="w-6 h-6 bg-white rounded-full"></div>
                <div className="w-4 h-4 bg-accent-red rounded-full"></div>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Pan African Journal Of Social Work
              <span className="block text-accent-green">And Social Policy</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-200 mb-8 max-w-4xl mx-auto leading-relaxed">
              Connecting scholarship, practice, and policy for Africa's social transformation
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              {isAuthenticated && (user?.role === 'author' || user?.role === 'admin' || user?.role === 'editor') ? (
                <Link
                  href="/author"
                  className="inline-flex items-center px-8 py-4 bg-accent-red text-white font-semibold rounded-lg hover:bg-accent-red/80 transition-colors shadow-lg text-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Author Portal
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 bg-accent-red text-white font-semibold rounded-lg hover:bg-accent-red/80 transition-colors shadow-lg text-lg"
                >
                  Submit Your Article
                </Link>
              )}
              
              <Link
                href="/articles"
                className="inline-flex items-center px-8 py-4 bg-accent-green text-white font-semibold rounded-lg hover:bg-accent-green/80 transition-colors shadow-lg text-lg"
              >
                Browse Articles
              </Link>
              
              <Link
                href="/about"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-accent-black transition-colors text-lg"
              >
                Learn More
              </Link>
            </div>

            {/* African-inspired decorative pattern */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-red rounded-full"></div>
                <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-4 h-4 bg-accent-red rounded-full"></div>
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-accent-red rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Statement */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-accent-black mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-neutral-700 max-w-4xl mx-auto leading-relaxed">
            We are committed to advancing social work practice and policy in Africa by providing a platform for 
            promoting African-centered approaches to social work and policy, grounded in indigenous knowledge 
            and enriched by decolonial scholarship.
          </p>
        </div>

        {/* Priority Areas of Focus */}
        <div className="bg-gradient-to-r from-accent-green/5 to-accent-red/5 rounded-2xl p-8 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-accent-black mb-6">
              Priority Areas of Focus
            </h2>
            <p className="text-lg text-neutral-700 max-w-3xl mx-auto">
              Our journal addresses critical themes shaping Africa's social transformation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-accent-red rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-accent-black mb-2">Decolonizing and re-centering African social work</h4>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-accent-black mb-2">Families, youth, and changing social structures</h4>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-accent-red rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-accent-black mb-2">Social protection and social development</h4>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-accent-black mb-2">Inequality, and inclusive development</h4>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-accent-red rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-accent-black mb-2">Eco-social work and community resilience</h4>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-accent-black mb-2">Social work in humanitarian action</h4>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-accent-red rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-accent-black mb-2">Mental health and wellbeing</h4>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-accent-green rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-accent-black mb-2">Refugees, internally displaced persons, and migration-related policy debates</h4>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-accent-red rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-accent-black mb-2">Innovative approaches in social work pedagogy</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Volumes Section */}
        {!isLoading && latestVolumes.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-accent-black">Latest Issues</h2>
              <Link
                href="/articles"
                className="text-accent-green hover:text-accent-green/80 font-semibold flex items-center transition-colors"
              >
                View All Issues
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {latestVolumes.map((volume: VolumeWithIssues) => (
                <div key={volume.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-r from-accent-green to-accent-green/80 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">
                      Volume {volume.volume_number}
                    </h3>
                    <p className="text-green-100 text-sm">
                      {volume.year} • {volume.issues.length} issue{volume.issues.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="p-6">
                    {volume.description && (
                      <p className="text-neutral-600 mb-4 line-clamp-3">
                        {volume.description}
                      </p>
                    )}
                    <Link
                      href={`/articles?volume=${volume.volume_number}`}
                      className="inline-flex items-center text-accent-green hover:text-accent-green/80 font-semibold transition-colors"
                    >
                      Browse Articles
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Articles Section */}
        {!isLoading && latestArticles.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-accent-black">Recent Publications</h2>
              <Link
                href="/articles"
                className="text-accent-red hover:text-accent-red/80 font-semibold flex items-center transition-colors"
              >
                View All Articles
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article: ArticleWithDetails) => (
                <div key={article.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-green-800 border border-green-200 mb-3">
                      Vol. {article.volume_number}, Issue {article.issue_number}
                    </span>
                    <h3 className="text-lg font-semibold text-accent-black mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      by {formatAuthors(article.authors)}
                    </p>
                    <p className="text-sm text-neutral-700 line-clamp-3 mb-4">
                      {article.abstract}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      {formatDate(article.published_at)}
                    </span>
                    <Link
                      href={`/articles/${article.id}`}
                      className="text-accent-red hover:text-accent-red/80 font-semibold text-sm transition-colors"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-accent-black via-neutral-900 to-accent-black rounded-lg p-8 md:p-12 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Community</h2>
              <p className="text-xl text-neutral-200 mb-8 leading-relaxed">
                Become part of a growing network of scholars, practitioners, and researchers committed to advancing social work in Africa through Indigenous knowledge and decolonial methodologies.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 bg-accent-red text-white font-semibold rounded-lg hover:bg-accent-red/80 transition-colors text-lg"
                >
                  Register as Author
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-accent-black transition-colors text-lg"
                >
                  Learn About Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}