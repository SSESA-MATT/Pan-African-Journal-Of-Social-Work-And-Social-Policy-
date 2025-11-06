import express from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Get all published articles with pagination and filtering
 * GET /api/articles
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      volume_number,
      issue_number,
      year,
      author,
      keyword
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build the query
    let query = supabase
      .from('articles')
      .select(`
        *,
        volumes!inner(
          volume_number,
          year,
          description
        ),
        issues!inner(
          issue_number,
          description,
          published_at
        )
      `)
      .order('published_at', { ascending: false });

    // Apply filters
    if (volume_number) {
      query = query.eq('volumes.volume_number', volume_number);
    }
    
    if (issue_number) {
      query = query.eq('issues.issue_number', issue_number);
    }
    
    if (year) {
      query = query.eq('volumes.year', year);
    }
    
    if (author) {
      query = query.ilike('authors', `%${author}%`);
    }
    
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,abstract.ilike.%${keyword}%,keywords.cs.{${keyword}}`);
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data: articles, error } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      console.error('Error fetching articles:', error);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }

    // Transform the data to match frontend expectations
    const transformedArticles = articles?.map((article: any) => ({
      id: article.id,
      submission_id: article.submission_id,
      title: article.title,
      abstract: article.abstract,
      authors: Array.isArray(article.authors) ? article.authors : [article.authors],
      keywords: Array.isArray(article.keywords) ? article.keywords : [],
      pdf_url: article.pdf_url,
      issue_id: article.issue_id,
      volume_number: article.volumes?.volume_number,
      issue_number: article.issues?.issue_number,
      volume_year: article.volumes?.year,
      volume_description: article.volumes?.description,
      issue_description: article.issues?.description,
      published_at: article.published_at,
      created_at: article.created_at,
      updated_at: article.updated_at
    })) || [];

    const totalPages = Math.ceil((count || 0) / Number(limit));

    res.json({
      articles: transformedArticles,
      total: count || 0,
      page: Number(page),
      totalPages,
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error in articles route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get article by ID
 * GET /api/articles/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        volumes!inner(
          volume_number,
          year,
          description
        ),
        issues!inner(
          issue_number,
          description,
          published_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Article not found' });
      }
      console.error('Error fetching article:', error);
      return res.status(500).json({ error: 'Failed to fetch article' });
    }

    // Transform the data
    const transformedArticle = {
      id: article.id,
      submission_id: article.submission_id,
      title: article.title,
      abstract: article.abstract,
      authors: Array.isArray(article.authors) ? article.authors : [article.authors],
      keywords: Array.isArray(article.keywords) ? article.keywords : [],
      pdf_url: article.pdf_url,
      issue_id: article.issue_id,
      volume_number: article.volumes?.volume_number,
      issue_number: article.issues?.issue_number,
      volume_year: article.volumes?.year,
      volume_description: article.volumes?.description,
      issue_description: article.issues?.description,
      published_at: article.published_at,
      created_at: article.created_at,
      updated_at: article.updated_at
    };

    res.json({ article: transformedArticle });
  } catch (error) {
    console.error('Error in article detail route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Search articles
 * GET /api/articles/search
 */
router.get('/search', async (req, res) => {
  try {
    const {
      q: query,
      page = 1,
      limit = 10
    } = req.query;

    if (!query || String(query).trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const offset = (Number(page) - 1) * Number(limit);

    // Search in title, abstract, authors, and keywords
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        *,
        volumes!inner(
          volume_number,
          year,
          description
        ),
        issues!inner(
          issue_number,
          description,
          published_at
        )
      `)
      .or(`title.ilike.%${query}%,abstract.ilike.%${query}%,authors.cs.{${query}},keywords.cs.{${query}}`)
      .order('published_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      console.error('Error searching articles:', error);
      return res.status(500).json({ error: 'Failed to search articles' });
    }

    // Get total count for search results
    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .or(`title.ilike.%${query}%,abstract.ilike.%${query}%,authors.cs.{${query}},keywords.cs.{${query}}`);

    // Transform the data
    const transformedArticles = articles?.map((article: any) => ({
      id: article.id,
      submission_id: article.submission_id,
      title: article.title,
      abstract: article.abstract,
      authors: Array.isArray(article.authors) ? article.authors : [article.authors],
      keywords: Array.isArray(article.keywords) ? article.keywords : [],
      pdf_url: article.pdf_url,
      issue_id: article.issue_id,
      volume_number: article.volumes?.volume_number,
      issue_number: article.issues?.issue_number,
      volume_year: article.volumes?.year,
      volume_description: article.volumes?.description,
      issue_description: article.issues?.description,
      published_at: article.published_at,
      created_at: article.created_at,
      updated_at: article.updated_at
    })) || [];

    const totalPages = Math.ceil((count || 0) / Number(limit));

    res.json({
      articles: transformedArticles,
      total: count || 0,
      page: Number(page),
      totalPages,
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error in article search route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get all volumes with their issues
 * GET /api/volumes
 */
router.get('/volumes', async (req, res) => {
  try {
    const { data: volumes, error } = await supabase
      .from('volumes')
      .select(`
        *,
        issues(
          id,
          issue_number,
          description,
          published_at,
          created_at,
          updated_at
        )
      `)
      .order('year', { ascending: false });

    if (error) {
      console.error('Error fetching volumes:', error);
      return res.status(500).json({ error: 'Failed to fetch volumes' });
    }

    res.json({ volumes: volumes || [] });
  } catch (error) {
    console.error('Error in volumes route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get articles by volume and issue
 * GET /api/volumes/:volumeId/issues/:issueId/articles
 */
router.get('/volumes/:volumeId/issues/:issueId/articles', async (req, res) => {
  try {
    const { volumeId, issueId } = req.params;

    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        *,
        volumes!inner(
          volume_number,
          year,
          description
        ),
        issues!inner(
          issue_number,
          description,
          published_at
        )
      `)
      .eq('volume_id', volumeId)
      .eq('issue_id', issueId)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles by volume/issue:', error);
      return res.status(500).json({ error: 'Failed to fetch articles' });
    }

    // Transform the data
    const transformedArticles = articles?.map((article: any) => ({
      id: article.id,
      submission_id: article.submission_id,
      title: article.title,
      abstract: article.abstract,
      authors: Array.isArray(article.authors) ? article.authors : [article.authors],
      keywords: Array.isArray(article.keywords) ? article.keywords : [],
      pdf_url: article.pdf_url,
      issue_id: article.issue_id,
      volume_number: article.volumes?.volume_number,
      issue_number: article.issues?.issue_number,
      volume_year: article.volumes?.year,
      volume_description: article.volumes?.description,
      issue_description: article.issues?.description,
      published_at: article.published_at,
      created_at: article.created_at,
      updated_at: article.updated_at
    })) || [];

    res.json({ articles: transformedArticles });
  } catch (error) {
    console.error('Error in volume/issue articles route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;