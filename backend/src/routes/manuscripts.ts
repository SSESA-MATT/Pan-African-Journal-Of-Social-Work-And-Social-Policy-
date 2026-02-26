import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Manuscript from '../models/Manuscript';
import { authenticate, requireRole } from '../middleware/auth';
import { uploadManuscript, handleUploadError } from '../middleware/upload';
import { validate } from '../middleware/validate';
import fileService from '../services/file-service';
import emailService from '../services/email-service';

const router = Router();

// All manuscript routes require authentication
router.use(authenticate);

// ─── POST /api/manuscripts — Submit a new manuscript ──────────
router.post('/', uploadManuscript, handleUploadError, async (req: Request, res: Response) => {
  try {
    const { title, abstract, keywords, authors, category } = req.body;

    // Parse JSON fields that come as strings from FormData
    const parsedKeywords = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
    const parsedAuthors = typeof authors === 'string' ? JSON.parse(authors) : authors;

    // Upload manuscript file
    let manuscriptFile;
    if (req.file) {
      manuscriptFile = await fileService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'manuscripts'
      );
    }

    const manuscript = await Manuscript.create({
      title,
      abstract,
      keywords: parsedKeywords || [],
      authors: parsedAuthors || [
        {
          userId: req.userId,
          name: `${req.user!.firstName} ${req.user!.lastName}`,
          email: req.user!.email,
          affiliation: req.user!.affiliation,
          isCorresponding: true,
        },
      ],
      submittedBy: req.userId,
      category: category || 'research-article',
      status: req.file ? 'submitted' : 'draft',
      submittedAt: req.file ? new Date() : undefined,
      manuscriptFile: manuscriptFile
        ? {
            url: manuscriptFile.url,
            publicId: manuscriptFile.publicId,
            filename: manuscriptFile.filename,
            size: manuscriptFile.size,
            mimeType: manuscriptFile.mimeType,
            uploadedAt: new Date(),
          }
        : undefined,
    });

    // Send confirmation email
    if (manuscript.status === 'submitted') {
      emailService
        .sendSubmissionConfirmation(req.user!.email, req.user!.firstName, title)
        .catch(() => {});
    }

    const populated = await Manuscript.findById(manuscript.id)
      .populate('submittedBy', 'firstName lastName email affiliation')
      .populate('assignedEditor', 'firstName lastName email');

    res.status(201).json({ manuscript: populated });
  } catch (error: any) {
    console.error('Manuscript submission error:', error);
    res.status(500).json({ error: 'Failed to submit manuscript.' });
  }
});

// ─── GET /api/manuscripts/my — Author's manuscripts ───────────
router.get('/my', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: any = { submittedBy: req.userId };
    if (status) query.status = status;

    const [manuscripts, total] = await Promise.all([
      Manuscript.find(query)
        .sort({ updatedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('assignedEditor', 'firstName lastName email'),
      Manuscript.countDocuments(query),
    ]);

    res.json({
      manuscripts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manuscripts.' });
  }
});

// ─── GET /api/manuscripts/all — Editor/Admin view ─────────────
router.get('/all', requireRole('editor', 'admin'), async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20', search } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search as string };
    }

    const [manuscripts, total] = await Promise.all([
      Manuscript.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('submittedBy', 'firstName lastName email affiliation')
        .populate('assignedEditor', 'firstName lastName email'),
      Manuscript.countDocuments(query),
    ]);

    res.json({
      manuscripts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manuscripts.' });
  }
});

// ─── GET /api/manuscripts/statistics — Dashboard stats ────────
router.get('/statistics', requireRole('editor', 'admin'), async (_req: Request, res: Response) => {
  try {
    const stats = await Manuscript.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result: Record<string, number> = {};
    stats.forEach((s) => {
      result[s._id] = s.count;
    });

    const totalThisMonth = await Manuscript.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    });

    res.json({ statistics: result, totalThisMonth });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

// ─── GET /api/manuscripts/:id — Single manuscript ─────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const manuscript = await Manuscript.findById(req.params.id)
      .populate('submittedBy', 'firstName lastName email affiliation')
      .populate('assignedEditor', 'firstName lastName email');

    if (!manuscript) {
      res.status(404).json({ error: 'Manuscript not found.' });
      return;
    }

    // Only allow owner, editor, or admin to see the full manuscript
    const isOwner = manuscript.submittedBy && (manuscript.submittedBy as any)._id.toString() === req.userId;
    const isPrivileged = ['editor', 'admin'].includes(req.user!.role);

    if (!isOwner && !isPrivileged) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    res.json({ manuscript });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manuscript.' });
  }
});

// ─── PUT /api/manuscripts/:id — Update manuscript ─────────────
router.put('/:id', uploadManuscript, handleUploadError, async (req: Request, res: Response) => {
  try {
    const manuscript = await Manuscript.findById(req.params.id);
    if (!manuscript) {
      res.status(404).json({ error: 'Manuscript not found.' });
      return;
    }

    const isOwner = manuscript.submittedBy.toString() === req.userId;
    const isPrivileged = ['editor', 'admin'].includes(req.user!.role);

    if (!isOwner && !isPrivileged) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    // Authors can only update drafts or revisions
    if (isOwner && !isPrivileged && !['draft', 'revisions_required'].includes(manuscript.status)) {
      res.status(400).json({ error: 'Cannot edit manuscript in current status.' });
      return;
    }

    const { title, abstract, keywords, authors, category } = req.body;

    if (title) manuscript.title = title;
    if (abstract) manuscript.abstract = abstract;
    if (keywords) manuscript.keywords = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
    if (authors) manuscript.authors = typeof authors === 'string' ? JSON.parse(authors) : authors;
    if (category) manuscript.category = category;

    // Handle new file upload
    if (req.file) {
      // Delete old file if it exists
      if (manuscript.manuscriptFile?.publicId) {
        fileService.deleteFile(manuscript.manuscriptFile.publicId).catch(() => {});
      }

      const uploaded = await fileService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'manuscripts'
      );

      manuscript.manuscriptFile = {
        url: uploaded.url,
        publicId: uploaded.publicId,
        filename: uploaded.filename,
        size: uploaded.size,
        mimeType: uploaded.mimeType,
        uploadedAt: new Date(),
      };
    }

    // If resubmitting after revisions
    if (manuscript.status === 'revisions_required' && (req.file || req.body.submitRevision)) {
      manuscript.status = 'revised';
    }

    // If submitting a draft
    if (manuscript.status === 'draft' && req.body.submit) {
      manuscript.status = 'submitted';
      manuscript.submittedAt = new Date();
    }

    await manuscript.save();

    const populated = await Manuscript.findById(manuscript.id)
      .populate('submittedBy', 'firstName lastName email affiliation')
      .populate('assignedEditor', 'firstName lastName email');

    res.json({ manuscript: populated });
  } catch (error) {
    console.error('Update manuscript error:', error);
    res.status(500).json({ error: 'Failed to update manuscript.' });
  }
});

// ─── PUT /api/manuscripts/:id/status — Editor status update ──
router.put('/:id/status', requireRole('editor', 'admin'), async (req: Request, res: Response) => {
  try {
    const { status, editorComments, revisionDeadline } = req.body;

    const manuscript = await Manuscript.findById(req.params.id).populate('submittedBy', 'firstName lastName email');
    if (!manuscript) {
      res.status(404).json({ error: 'Manuscript not found.' });
      return;
    }

    manuscript.status = status;
    if (editorComments) manuscript.editorComments = editorComments;
    if (revisionDeadline) manuscript.revisionDeadline = new Date(revisionDeadline);

    if (status === 'accepted') manuscript.acceptedAt = new Date();
    if (status === 'rejected') manuscript.rejectedAt = new Date();

    await manuscript.save();

    // Notify author
    const author = manuscript.submittedBy as any;
    if (author?.email) {
      emailService
        .sendStatusUpdate(author.email, author.firstName, manuscript.title, status, editorComments)
        .catch(() => {});
    }

    res.json({ manuscript });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update manuscript status.' });
  }
});

// ─── PUT /api/manuscripts/:id/assign-editor — Assign editor ──
router.put('/:id/assign-editor', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { editorId } = req.body;

    const manuscript = await Manuscript.findByIdAndUpdate(
      req.params.id,
      { assignedEditor: editorId },
      { new: true }
    )
      .populate('submittedBy', 'firstName lastName email')
      .populate('assignedEditor', 'firstName lastName email');

    if (!manuscript) {
      res.status(404).json({ error: 'Manuscript not found.' });
      return;
    }

    res.json({ manuscript });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign editor.' });
  }
});

// ─── GET /api/manuscripts/:id/download — Download file ────────
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const manuscript = await Manuscript.findById(req.params.id);
    if (!manuscript || !manuscript.manuscriptFile?.publicId) {
      res.status(404).json({ error: 'File not found.' });
      return;
    }

    const isOwner = manuscript.submittedBy.toString() === req.userId;
    const isPrivileged = ['editor', 'admin', 'reviewer'].includes(req.user!.role);

    if (!isOwner && !isPrivileged) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const downloadUrl = fileService.getDownloadUrl(manuscript.manuscriptFile.publicId);
    res.json({ url: downloadUrl, filename: manuscript.manuscriptFile.filename });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate download link.' });
  }
});

export default router;
