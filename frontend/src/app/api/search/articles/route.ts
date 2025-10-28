import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Create Supabase client inside the function to avoid build-time issues
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      message: 'Supabase configuration missing',
      error: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured'
    }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const query = searchParams.get('q') || '';
    const title = searchParams.get('title') || '';
    const authors = searchParams.get('authors')?.split(',').filter(Boolean) || [];
    const keywords = searchParams.get('keywords')?.split(',').filter(Boolean) || [];
    const dateFrom = searchParams.get('dateFrom') || null;
    const dateTo = searchParams.get('dateTo') || null;
    const volumes = searchParams.get('volumes')?.split(',').map(Number).filter(Boolean) || [];
    const issues = searchParams.get('issues')?.split(',').map(Number).filter(Boolean) || [];
    const types = searchParams.get('types')?.split(',').filter(Boolean) || [];
    const language = searchParams.get('language') || null;
    
    // Search options
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeFacets = searchParams.get('includeFacets') === 'true';
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    const startTime = Date.now();

    // Build search query using Supabase query builder
    let searchQuery = supabase
      .from('articles')
      .select(`
        id,
        title,
        abstract,
        authors,
        keywords,
        published_at,
        volume_id,
        issue_id,
        article_type,
        language_code,
        pdf_url
      `)
      .not('published_at', 'is', null);

    // Apply text search if query provided
    if (query) {
      searchQuery = searchQuery.or(`title.ilike.%${query}%,abstract.ilike.%${query}%`);
    }

    // Apply filters
    if (volumes.length > 0) {
      searchQuery = searchQuery.in('volume_id', volumes);
    }
    
    if (issues.length > 0) {
      searchQuery = searchQuery.in('issue_id', issues);
    }
    
    if (types.length > 0) {
      searchQuery = searchQuery.in('article_type', types);
    }
    
    if (language) {
      searchQuery = searchQuery.eq('language_code', language);
    }
    
    if (dateFrom) {
      searchQuery = searchQuery.gte('published_at', dateFrom);
    }
    
    if (dateTo) {
      searchQuery = searchQuery.lte('published_at', dateTo);
    }

    // Apply pagination and sorting
    searchQuery = searchQuery
      .order('published_at', { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    const { data: searchResults, error: searchError, count } = await searchQuery;

    if (searchError) {
      console.error('Search error:', searchError);
      return NextResponse.json({
        success: false,
        message: 'Search failed',
        error: searchError.message
      }, { status: 500 });
    }

    // Get facets if requested (simplified version)
    let facets = null;
    if (includeFacets) {
      try {
        // Get basic facets from articles table
        const { data: typesFacet } = await supabase
          .from('articles')
          .select('article_type')
          .not('published_at', 'is', null);

        const { data: yearsFacet } = await supabase
          .from('articles')
          .select('published_at')
          .not('published_at', 'is', null);

        // Build facets from the data
        const typeCounts: { [key: string]: number } = {};
        const yearCounts: { [key: string]: number } = {};

        typesFacet?.forEach(item => {
          const type = item.article_type || 'research_article';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        yearsFacet?.forEach(item => {
          const year = new Date(item.published_at).getFullYear().toString();
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        });

        facets = [
          {
            key: 'types',
            label: 'Article Types',
            type: 'checkbox',
            values: Object.entries(typeCounts).map(([type, count]) => ({
              value: type,
              label: type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              count,
              selected: types.includes(type)
            }))
          },
          {
            key: 'years',
            label: 'Publication Year',
            type: 'checkbox',
            values: Object.entries(yearCounts)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([year, count]) => ({
                value: parseInt(year),
                label: year,
                count,
                selected: false
              }))
          }
        ];
      } catch (facetError) {
        console.warn('Failed to generate facets:', facetError);
        facets = [];
      }
    }

    const searchTime = Date.now() - startTime;
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response = {
      results: searchResults?.map((result: any) => ({
        id: result.id.toString(),
        title: result.title,
        abstract: result.abstract,
        authors: Array.isArray(result.authors) ? result.authors : [],
        keywords: Array.isArray(result.keywords) ? result.keywords : [],
        published_at: result.published_at,
        volume_id: result.volume_id?.toString(),
        issue_id: result.issue_id?.toString(),
        article_type: result.article_type || 'research_article',
        language_code: result.language_code || 'en',
        pdf_url: result.pdf_url,
        rank: 1.0 // Simple ranking for now
      })) || [],
      facets,
      total,
      page,
      totalPages,
      searchTime,
      query
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getLanguageName(code: string): string {
  const languageMap: { [key: string]: string } = {
    'en': 'English',
    'fr': 'French',
    'ar': 'Arabic',
    'sw': 'Swahili',
    'pt': 'Portuguese',
    'es': 'Spanish'
  };
  return languageMap[code] || code.toUpperCase();
}