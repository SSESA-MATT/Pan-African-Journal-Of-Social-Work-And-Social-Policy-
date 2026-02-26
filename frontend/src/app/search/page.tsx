'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { articlesApi } from '@/lib/api-client';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery, 1);
  }, []);

  const doSearch = async (q: string, p: number) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await articlesApi.search(q, p, 12);
      setResults(res.articles || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(p);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    doSearch(query, 1);
  };

  const formatAuthors = (authors: any[]) => {
    if (!authors?.length) return 'Unknown Author';
    const names = authors.map((a: any) => (typeof a === 'string' ? a : a.name || 'Unknown'));
    return names.length <= 2 ? names.join(' and ') : `${names[0]} et al.`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Articles</h1>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, abstract, keywords, or author…"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-green focus:border-transparent text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-accent-green text-white rounded-lg hover:bg-accent-green/80 font-medium text-sm"
            >
              Search
            </button>
          </div>
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green mx-auto" />
          </div>
        )}

        {!loading && searched && (
          <>
            <p className="text-sm text-gray-600 mb-6">
              {total === 0 ? 'No results found' : `${total} result${total !== 1 ? 's' : ''} found`}
              {query && ` for "${query}"`}
            </p>

            <div className="space-y-6">
              {results.map((article: any) => (
                <div key={article.id || article._id} className="bg-white shadow rounded-lg p-6">
                  <Link href={`/articles/${article.slug || article.id || article._id}`}>
                    <h2 className="text-lg font-semibold text-gray-900 hover:text-accent-green transition-colors mb-2">
                      {article.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2">{formatAuthors(article.authors)}</p>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">{article.abstract}</p>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords?.slice(0, 4).map((kw: string) => (
                      <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{kw}</span>
                    ))}
                    {article.volume && (
                      <span className="text-xs text-gray-500 ml-2">
                        Vol. {article.volume.volumeNumber}, Issue {article.issue?.issueNumber}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button disabled={page <= 1} onClick={() => doSearch(query, page - 1)} className="px-4 py-2 border rounded-md text-sm disabled:opacity-50">Previous</button>
                <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => doSearch(query, page + 1)} className="px-4 py-2 border rounded-md text-sm disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}

        {!loading && !searched && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-4">🔍</p>
            <p>Enter a search query to find published articles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
