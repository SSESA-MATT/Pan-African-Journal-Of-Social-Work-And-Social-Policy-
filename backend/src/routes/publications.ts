import express from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All publication routes require authentication and admin/editor role
router.use(authenticate);

const requireAdminOrEditor = (req: any, res: any, next: any) => {
  if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Admin or editor role required.' });
  }
  next();
};

router.use(requireAdminOrEditor);

/**
 * Publish an accepted submission as an article
 * POST /api/publications/publish
 */
router.post('/publish', async (req, res) => {
  try {
    const { submission_id, volume_id, issue_id, published_at } = req.body;

    if (!submission_id || !volume_id || !issue_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: submission_id, volume_id, issue_id' 
      });
    }

    // Get the submission details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.status !== 'accepted') {
      return res.status(400).json({ 
        error: 'Only accepted submissions can be published' 
      });
    }

    // Check if article already exists for this submission
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('submission_id', submission_id)
      .single();

    if (existingArticle) {
      return res.status(400).json({ 
        error: 'Article already published for this submission' 
      });
    }

    // Create the article
    const articleData = {
      submission_id: submission.id,
      title: submission.title,
      abstract: submission.abstract,
      authors: submission.authors || [],
      keywords: submission.keywords || [],
      pdf_url: submission.manuscript_url,
      volume_id: volume_id,
      issue_id: issue_id,
      published_at: published_at || new Date().toISOString(),
    };

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (articleError) {
      console.error('Error creating article:', articleError);
      return res.status(500).json({ error: 'Failed to create article' });
    }

    // Update submission status to published
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ 
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', submission_id);

    if (updateError) {
      console.error('Error updating submission status:', updateError);
      // Note: Article was created but submission status update failed
      // This is not critical, but should be logged
    }

    res.json({
      message: 'Article published successfully',
      article: article
    });

  } catch (error) {
    console.error('Error in publish route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create a new volume
 * POST /api/publications/volumes
 */
router.post('/volumes', async (req, res) => {
  try {
    const { volume_number, year, description } = req.body;

    if (!volume_number || !year || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: volume_number, year, description' 
      });
    }

    // Check if volume already exists
    const { data: existingVolume } = await supabase
      .from('volumes')
      .select('id')
      .eq('volume_number', volume_number)
      .eq('year', year)
      .single();

    if (existingVolume) {
      return res.status(400).json({ 
        error: `Volume ${volume_number} for year ${year} already exists` 
      });
    }

    const { data: volume, error } = await supabase
      .from('volumes')
      .insert({
        volume_number,
        year,
        description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating volume:', error);
      return res.status(500).json({ error: 'Failed to create volume' });
    }

    res.json({
      message: 'Volume created successfully',
      volume: volume
    });

  } catch (error) {
    console.error('Error in create volume route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create a new issue
 * POST /api/publications/issues
 */
router.post('/issues', async (req, res) => {
  try {
    const { issue_number, volume_id, description, published_at } = req.body;

    if (!issue_number || !volume_id || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: issue_number, volume_id, description' 
      });
    }

    // Check if issue already exists for this volume
    const { data: existingIssue } = await supabase
      .from('issues')
      .select('id')
      .eq('issue_number', issue_number)
      .eq('volume_id', volume_id)
      .single();

    if (existingIssue) {
      return res.status(400).json({ 
        error: `Issue ${issue_number} already exists for this volume` 
      });
    }

    const { data: issue, error } = await supabase
      .from('issues')
      .insert({
        issue_number,
        volume_id,
        description,
        published_at: published_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating issue:', error);
      return res.status(500).json({ error: 'Failed to create issue' });
    }

    res.json({
      message: 'Issue created successfully',
      issue: issue
    });

  } catch (error) {
    console.error('Error in create issue route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get issues for a specific volume
 * GET /api/publications/volumes/:volumeId/issues
 */
router.get('/volumes/:volumeId/issues', async (req, res) => {
  try {
    const { volumeId } = req.params;

    const { data: issues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('volume_id', volumeId)
      .order('issue_number', { ascending: true });

    if (error) {
      console.error('Error fetching issues:', error);
      return res.status(500).json({ error: 'Failed to fetch issues' });
    }

    res.json({ issues: issues || [] });

  } catch (error) {
    console.error('Error in get issues route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;