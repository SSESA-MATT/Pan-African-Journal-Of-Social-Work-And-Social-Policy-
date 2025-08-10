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
              Promoting Indigenous African knowledge systems and decolonial social work methodologies through scholarly research and community engagement
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
                  Submit Your Research
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
            Indigenous knowledge systems, decolonial methodologies, and community-centered research that addresses 
            the unique challenges and opportunities across the continent.
          </p>
        </div>

        {/* Features Section with African aesthetics */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-accent-red p-8 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-accent-black mb-4">Indigenous Knowledge</h3>
            <p className="text-neutral-600 leading-relaxed">
              Promoting African-centered approaches to social work practice and policy development rooted in traditional wisdom and contemporary scholarship.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border-l-4 border-accent-green p-8 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-accent-black mb-4">Community Focus</h3>
            <p className="text-neutral-600 leading-relaxed">
              Research that addresses real community needs, promotes social justice, and empowers local voices in shaping social work practice.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border-l-4 border-accent-black p-8 text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-accent-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-accent-black mb-4">Peer Reviewed</h3>
            <p className="text-neutral-600 leading-relaxed">
              Rigorous academic standards ensuring high-quality research publication while maintaining cultural sensitivity and relevance.
            </p>
          </div>
        </div>

        {/* Latest Issues Section */}
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
              {latestVolumes.map((volume) => (
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
              {latestArticles.map((article) => (
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