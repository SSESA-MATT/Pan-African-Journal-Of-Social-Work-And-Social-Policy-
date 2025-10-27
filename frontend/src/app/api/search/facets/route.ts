import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters for filtering facets
    const query = searchParams.get('q') || null;
    const authors = searchParams.get('authors')?.split(',').filter(Boolean) || [];
    const keywords = searchParams.get('keywords')?.split(',').filter(Boolean) || [];
    const dateFrom = searchParams.get('dateFrom') || null;
    const dateTo = searchParams.get('dateTo') || null;

    const startTime = Date.now();

    // Get facets using the database function
    const { data: facetData, error: facetError } = await supabase
      .rpc('get_search_facets', {
        search_query: query,
        author_filter: authors.length > 0 ? authors[0] : null,
        keyword_filter: keywords.length > 0 ? keywords : null,
        date_from: dateFrom ? new Date(dateFrom).toISOString() : null,
        date_to: dateTo ? new Date(dateTo).toISOString() : null
      });

    if (facetError) {
      console.error('Facets error:', facetError);
      return NextResponse.json({
        success: false,
        message: 'Failed to get facets',
        error: facetError.message
      }, { status: 500 });
    }

    const searchTime = Date.now() - startTime;

    // Transform facet data into the expected format
    const facets = [];

    // Article Types
    if (facetData?.types?.length > 0) {
      facets.push({
        key: 'types',
        label: 'Article Types',
        type: 'checkbox',
        multiSelect: true,
        values: facetData.types.map((type: any) => ({
          value: type.article_type,
          label: formatArticleType(type.article_type),
          count: type.count,
          selected: false
        }))
      });
    }

    // Publication Years
    if (facetData?.years?.length > 0) {
      facets.push({
        key: 'years',
        label: 'Publication Year',
        type: 'checkbox',
        multiSelect: true,
        values: facetData.years
          .sort((a: any, b: any) => b.year - a.year) // Sort by year descending
          .map((year: any) => ({
            value: year.year,
            label: year.year.toString(),
            count: year.count,
            selected: false
          }))
      });
    }

    // Languages
    if (facetData?.languages?.length > 0) {
      facets.push({
        key: 'languages',
        label: 'Language',
        type: 'radio',
        multiSelect: false,
        values: facetData.languages.map((lang: any) => ({
          value: lang.language_code,
          label: getLanguageName(lang.language_code),
          count: lang.count,
          selected: false
        }))
      });
    }

    // Volumes
    if (facetData?.volumes?.length > 0) {
      facets.push({
        key: 'volumes',
        label: 'Volumes',
        type: 'checkbox',
        multiSelect: true,
        values: facetData.volumes
          .sort((a: any, b: any) => b.volume_number - a.volume_number) // Sort by volume descending
          .map((vol: any) => ({
            value: vol.volume_number,
            label: `Volume ${vol.volume_number} (${vol.year})`,
            count: vol.count,
            selected: false
          }))
      });
    }

    // Issues
    if (facetData?.issues?.length > 0) {
      facets.push({
        key: 'issues',
        label: 'Issues',
        type: 'checkbox',
        multiSelect: true,
        values: facetData.issues
          .sort((a: any, b: any) => a.issue_number - b.issue_number) // Sort by issue ascending
          .map((issue: any) => ({
            value: issue.issue_number,
            label: `Issue ${issue.issue_number}`,
            count: issue.count,
            selected: false
          }))
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        facets,
        searchTime,
        query
      }
    });

  } catch (error) {
    console.error('Facets API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function formatArticleType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'research_article': 'Research Article',
    'review_article': 'Review Article',
    'case_study': 'Case Study',
    'brief_communication': 'Brief Communication',
    'commentary': 'Commentary',
    'policy_brief': 'Policy Brief',
    'practice_note': 'Practice Note',
    'student_voice': 'Student Voice'
  };
  return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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