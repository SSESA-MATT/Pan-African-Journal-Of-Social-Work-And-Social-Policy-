import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // 'all', 'authors', 'keywords', 'titles'
    const limit = parseInt(searchParams.get('limit') || '10');

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const suggestions = [];

    // Get author suggestions
    if (type === 'all' || type === 'authors') {
      const { data: authorSuggestions, error: authorError } = await supabase
        .rpc('get_author_suggestions', {
          query_text: query,
          limit_count: Math.ceil(limit / 3)
        });

      if (!authorError && authorSuggestions) {
        suggestions.push(...authorSuggestions.map((item: any) => ({
          text: item.author,
          type: 'author',
          count: item.count
        })));
      }
    }

    // Get keyword suggestions
    if (type === 'all' || type === 'keywords') {
      const { data: keywordSuggestions, error: keywordError } = await supabase
        .rpc('get_keyword_suggestions', {
          query_text: query,
          limit_count: Math.ceil(limit / 3)
        });

      if (!keywordError && keywordSuggestions) {
        suggestions.push(...keywordSuggestions.map((item: any) => ({
          text: item.keyword,
          type: 'keyword',
          count: item.count
        })));
      }
    }

    // Get title suggestions (search in titles)
    if (type === 'all' || type === 'titles') {
      const { data: titleSuggestions, error: titleError } = await supabase
        .from('articles')
        .select('title')
        .ilike('title', `%${query}%`)
        .not('title', 'is', null)
        .limit(Math.ceil(limit / 3));

      if (!titleError && titleSuggestions) {
        // Extract unique phrases from titles
        const titlePhrases = new Set<string>();
        titleSuggestions.forEach((article: any) => {
          const title = article.title.toLowerCase();
          const words = title.split(/\s+/);
          
          // Find phrases that contain the query
          for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j <= Math.min(i + 4, words.length); j++) {
              const phrase = words.slice(i, j).join(' ');
              if (phrase.includes(query.toLowerCase()) && phrase.length > query.length) {
                titlePhrases.add(phrase);
              }
            }
          }
        });

        Array.from(titlePhrases).slice(0, Math.ceil(limit / 3)).forEach(phrase => {
          suggestions.push({
            text: phrase,
            type: 'title',
            count: 1 // We don't have exact counts for phrases
          });
        });
      }
    }

    // Add general query suggestions
    if (type === 'all') {
      suggestions.push({
        text: query,
        type: 'query',
        count: 0
      });
    }

    // Sort by count (descending) and limit results
    const sortedSuggestions = suggestions
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: sortedSuggestions
    });

  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get suggestions',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}