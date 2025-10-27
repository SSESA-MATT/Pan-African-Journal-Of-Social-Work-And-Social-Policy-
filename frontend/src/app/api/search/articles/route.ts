import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Create Supabase client inside the function to avoid build-time issues
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      message: 'Supabase configuration missing',
      error: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured'
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

    // Use the advanced search function
    const { data: searchResults, error: searchError } = await supabase
      .rpc('search_articles_advanced', {
        search_query: query || null,
        author_filter: authors.length > 0 ? authors[0] : null, // Simplified for now
        keyword_filter: keywords.length > 0 ? keywords : null,
        volume_filter: volumes.length > 0 ? volumes : null,
        issue_filter: issues.length > 0 ? issues : null,
        date_from: dateFrom ? new Date(dateFrom).toISOString() : null,
        date_to: dateTo ? new Date(dateTo).toISOString() : null,
        article_type_filter: types.length > 0 ? types : null,
        limit_count: limit,
        offset_count: (page - 1) * limit
      });

    if (searchError) {
      console.error('Search error:', searchError);
      return NextResponse.json({
        success: false,
        message: 'Search failed',
        error: searchError.message
      }, { status: 500 });
    }

    // Get facets if requested
    let facets = null;
    if (includeFacets) {
      const { data: facetData, error: facetError } = await supabase
        .rpc('get_search_facets', {
          search_query: query || null,
          author_filter: authors.length > 0 ? authors[0] : null,
          keyword_filter: keywords.length > 0 ? keywords : null,
          date_from: dateFrom ? new Date(dateFrom).toISOString() : null,
          date_to: dateTo ? new Date(dateTo).toISOString() : null
        });

      if (!facetError && facetData) {
        // Transform facet data into the expected format
        facets = [
          {
            key: 'types',
            label: 'Article Types',
            type: 'checkbox',
            values: facetData.types?.map((type: any) => ({
              value: type.article_type,
              label: type.article_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
              count: type.count,
              selected: types.includes(type.article_type)
            })) || []
          },
          {
            key: 'years',
            label: 'Publication Year',
            type: 'checkbox',
            values: facetData.years?.map((year: any) => ({
              value: year.year,
              label: year.year.toString(),
              count: year.count,
              selected: false
            })) || []
          },
          {
            key: 'languages',
            label: 'Language',
            type: 'radio',
            values: facetData.languages?.map((lang: any) => ({
              value: lang.language_code,
              label: getLanguageName(lang.language_code),
              count: lang.count,
              selected: language === lang.language_code
            })) || []
          }
        ];

        // Add volume facets if available
        if (facetData.volumes?.length > 0) {
          facets.push({
            key: 'volumes',
            label: 'Volumes',
            type: 'checkbox',
            values: facetData.volumes.map((vol: any) => ({
              value: vol.volume_number,
              label: `Volume ${vol.volume_number} (${vol.year})`,
              count: vol.count,
              selected: volumes.includes(vol.volume_number)
            }))
          });
        }

        // Add issue facets if available
        if (facetData.issues?.length > 0) {
          facets.push({
            key: 'issues',
            label: 'Issues',
            type: 'checkbox',
            values: facetData.issues.map((issue: any) => ({
              value: issue.issue_number,
              label: `Issue ${issue.issue_number}`,
              count: issue.count,
              selected: issues.includes(issue.issue_number)
            }))
          });
        }
      }
    }

    const searchTime = Date.now() - startTime;
    const total = searchResults?.[0]?.total_count || 0;
    const totalPages = Math.ceil(total / limit);

    const response = {
      results: searchResults?.map((result: any) => ({
        id: result.id.toString(),
        title: result.title,
        abstract: result.abstract,
        authors: result.authors || [],
        keywords: result.keywords || [],
        published_at: result.published_at,
        volume_id: result.volume_id?.toString(),
        issue_id: result.issue_id?.toString(),
        article_type: result.article_type,
        language_code: result.language_code,
        pdf_url: result.pdf_url,
        rank: result.rank
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