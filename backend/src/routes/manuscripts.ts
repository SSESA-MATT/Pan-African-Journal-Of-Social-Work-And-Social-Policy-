import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { ManuscriptRepository } from '../models/ManuscriptRepository';

const router = Router();
const manuscriptRepo = new ManuscriptRepository();

// Author routes
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'author') {
      return res.status(403).json({ error: 'Only authors can submit manuscripts' });
    }

    const manuscriptData = {
      ...req.body,
      author_id: req.user.id,
      status: 'draft',
      submission_date: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };

    const manuscript = await manuscriptRepo.create(manuscriptData);
    res.status(201).json(manuscript);
  } catch (error) {
    console.error('Error submitting manuscript:', error);
    res.status(500).json({ error: 'Failed to submit manuscript' });
  }
});

router.get('/user/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!req.user || (req.user.id !== userId && !['admin', 'editor'].includes(req.user.role))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const manuscripts = await manuscriptRepo.findByAuthorId(userId);
    res.json(manuscripts);
  } catch (error) {
    console.error('Error fetching user manuscripts:', error);
    res.status(500).json({ error: 'Failed to fetch manuscripts' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const manuscript = await manuscriptRepo.findById(id);
    
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    // Check permissions
    if (!req.user || (
      manuscript.author_id !== req.user.id && 
      !['admin', 'editor', 'reviewer'].includes(req.user.role) &&
      !(req.user.role === 'reviewer' && manuscript.assigned_reviewers?.includes(req.user.id))
    )) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(manuscript);
  } catch (error) {
    console.error('Error fetching manuscript:', error);
    res.status(500).json({ error: 'Failed to fetch manuscript' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const manuscript = await manuscriptRepo.findById(id);
    
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    // Check permissions - only author can edit their own manuscript in draft status
    if (!req.user || manuscript.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (manuscript.status !== 'draft') {
      return res.status(400).json({ error: 'Can only edit manuscripts in draft status' });
    }

    const updateData = {
      ...req.body,
      last_updated: new Date().toISOString(),
    };

    const updatedManuscript = await manuscriptRepo.update(id, updateData);
    res.json(updatedManuscript);
  } catch (error) {
    console.error('Error updating manuscript:', error);
    res.status(500).json({ error: 'Failed to update manuscript' });
  }
});

router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const manuscript = await manuscriptRepo.findById(id);
    
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    // Check permissions - only author can delete their own manuscript in draft status
    if (!req.user || manuscript.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (manuscript.status !== 'draft') {
      return res.status(400).json({ error: 'Can only delete manuscripts in draft status' });
    }

    await manuscriptRepo.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting manuscript:', error);
    res.status(500).json({ error: 'Failed to delete manuscript' });
  }
});

// Admin/Editor routes
router.get('/admin/all', auth, async (req: Request, res: Response) => {
  try {
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const manuscripts = await manuscriptRepo.findAll();
    res.json(manuscripts);
  } catch (error) {
    console.error('Error fetching all manuscripts:', error);
    res.status(500).json({ error: 'Failed to fetch manuscripts' });
  }
});

router.post('/:id/assign-reviewer', auth, async (req: Request, res: Response) => {
  try {
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { reviewerId } = req.body;

    const manuscript = await manuscriptRepo.findById(id);
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    await manuscriptRepo.assignReviewer(id, reviewerId);
    res.json({ message: 'Reviewer assigned successfully' });
  } catch (error) {
    console.error('Error assigning reviewer:', error);
    res.status(500).json({ error: 'Failed to assign reviewer' });
  }
});

router.put('/:id/status', auth, async (req: Request, res: Response) => {
  try {
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const manuscript = await manuscriptRepo.findById(id);
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    const updatedManuscript = await manuscriptRepo.updateStatus(id, status);
    res.json(updatedManuscript);
  } catch (error) {
    console.error('Error updating manuscript status:', error);
    res.status(500).json({ error: 'Failed to update manuscript status' });
  }
});

// File upload routes
router.post('/upload', auth, async (req: Request, res: Response) => {
  try {
    // TODO: Implement file upload logic
    res.status(501).json({ error: 'File upload not yet implemented' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.get('/files/:fileId', auth, async (req: Request, res: Response) => {
  try {
    // TODO: Implement file download logic
    res.status(501).json({ error: 'File download not yet implemented' });
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

export default router;
