'use client';

import React from 'react';
import Link from 'next/link';
import { ArticleWithDetails } from '@/types/article';

interface ArticleViewProps {
  article: ArticleWithDetails;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ article }) => {
  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    if (authors.length <= 4) return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
    return `${authors.slice(0, 3).join(', ')}, et al.`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-neutral-600">
            <Link href="/" className="hover:text-accent-green transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/articles" className="hover:text-accent-green transition-colors">
              Articles
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-neutral-900 font-medium">Article</span>
          </div>
        </nav>

        {/* Article Header */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm mb-8">
          <div className="p-8">
            {/* Publication Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-green/10 text-green-800 border border-green-200">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Published Article
                </span>
                <span className="text-sm text-neutral-600">
                  Volume {article.volume_number}, Issue {article.issue_number} ({article.volume_year})
                </span>
              </div>
              
              {article.pdf_url && (
                <a
                  href={article.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-accent-red text-white rounded-md hover:bg-accent-red/80 transition-colors font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Authors */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-800 mb-2">Authors</h2>
              <p className="text-neutral-700 text-lg">
                {formatAuthors(article.authors)}
              </p>
            </div>

            {/* Publication Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-1">Publication Date</h3>
                <p className="text-neutral-600">{formatDate(article.published_at)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-1">Issue</h3>
                <p className="text-neutral-600">
                  Volume {article.volume_number}, Issue {article.issue_number}
                </p>
              </div>
              {article.volume_description && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-1">Volume Description</h3>
                  <p className="text-neutral-600">{article.volume_description}</p>
                </div>
              )}
            </div>

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-neutral-700 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-800 border border-neutral-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Abstract */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Abstract
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {article.abstract}
              </p>
            </div>
          </div>
        </div>

        {/* Citation */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Cite
            </h2>
            <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
              <p className="text-sm text-neutral-700 font-mono leading-relaxed">
                {formatAuthors(article.authors)} ({article.volume_year}). {article.title}. 
                <em> Pan African Journal Of Social Work And Social Policy</em>, 
                <em>{article.volume_number}</em>({article.issue_number}).
              </p>
              <button
                onClick={() => {
                  const citation = `${formatAuthors(article.authors)} (${article.volume_year}). ${article.title}. Pan African Journal Of Social Work And Social Policy, ${article.volume_number}(${article.issue_number}).`;
                  navigator.clipboard.writeText(citation);
                }}
                className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-accent-green border border-accent-green rounded-md hover:bg-accent-green hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Citation
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Actions</h2>
            <div className="flex flex-wrap gap-4">
              {article.pdf_url && (
                <a
                  href={article.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-accent-red text-white rounded-md hover:bg-accent-red/80 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Full Text PDF
                </a>
              )}
              
              <button
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                }}
                className="inline-flex items-center px-6 py-3 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Article
              </button>

              <Link
                href={`/articles?volume=${article.volume_number}`}
                className="inline-flex items-center px-6 py-3 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View Volume {article.volume_number}
              </Link>

              <Link
                href="/articles"
                className="inline-flex items-center px-6 py-3 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Browse All Articles
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Articles */}
        <div className="mt-8 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center text-accent-green hover:text-accent-green/80 font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Articles
          </Link>
        </div>
      </div>
    </div>
  );
};