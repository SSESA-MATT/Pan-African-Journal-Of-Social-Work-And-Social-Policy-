import { Router, Request, Response } from 'express';
import slugify from 'slugify';
import { Article, Volume, Issue } from '../models/Article';
import Manuscript from '../models/Manuscript';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth';

const router = Router();

// ═══════════════════════════════════════════════════════════════
//  PUBLIC ROUTES (no auth required)
// ═══════════════════════════════════════════════════════════════

// ─── GET /api/articles — Published articles (public) ──────────
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '12', volume, issue, category, keyword, author, search, sort = 'newest' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: any = {};

    if (volume) query.volume = volume;
    if (issue) query.issue = issue;
    if (category) query.category = category;
    if (keyword) query.keywords = { $in: [keyword] };
    if (author) query['authors.name'] = { $regex: author, $options: 'i' };
    if (search) query.$text = { $search: search as string };

    let sortOption: any = { publishedAt: -1 }; // newest first
    if (sort === 'oldest') sortOption = { publishedAt: 1 };
    if (sort === 'most-viewed') sortOption = { viewCount: -1 };
    if (sort === 'most-cited') sortOption = { citationCount: -1 };

    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('volume', 'volumeNumber year')
        .populate('issue', 'issueNumber title'),
      Article.countDocuments(query),
    ]);

    res.json({
      articles,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Fetch articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles.' });
  }
});

// ─── GET /api/articles/search — Search published articles ─────
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, page = '1', limit = '12' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (!q) {
      res.status(400).json({ error: 'Search query is required.' });
      return;
    }

    const query = { $text: { $search: q as string } };

    const [articles, total] = await Promise.all([
      Article.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('volume', 'volumeNumber year')
        .populate('issue', 'issueNumber title'),
      Article.countDocuments(query),
    ]);

    res.json({
      articles,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed.' });
  }
});

// ─── GET /api/articles/volumes — List all volumes ─────────────
router.get('/volumes', async (_req: Request, res: Response) => {
  try {
    const volumes = await Volume.find().sort({ volumeNumber: -1 });

    // Get issues for each volume
    const volumesWithIssues = await Promise.all(
      volumes.map(async (volume) => {
        const issues = await Issue.find({ volume: volume.id }).sort({ issueNumber: 1 });
        return { ...volume.toJSON(), issues };
      })
    );

    res.json({ volumes: volumesWithIssues });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch volumes.' });
  }
});

// ─── GET /api/articles/volumes/:volumeId/issues/:issueId ──────
router.get('/volumes/:volumeId/issues/:issueId', async (req: Request, res: Response) => {
  try {
    const { volumeId, issueId } = req.params;

    const articles = await Article.find({ volume: volumeId, issue: issueId })
      .sort({ pages: 1, publishedAt: 1 })
      .populate('volume', 'volumeNumber year')
      .populate('issue', 'issueNumber title');

    const issue = await Issue.findById(issueId).populate('volume', 'volumeNumber year');

    res.json({ articles, issue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch issue articles.' });
  }
});

// ─── GET /api/articles/:idOrSlug — Single article ─────────────
router.get('/:idOrSlug', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    let article;
    // Try finding by slug first, then by ID
    article = await Article.findOne({ slug: idOrSlug })
      .populate('volume', 'volumeNumber year title')
      .populate('issue', 'issueNumber title');

    if (!article) {
      article = await Article.findById(idOrSlug)
        .populate('volume', 'volumeNumber year title')
        .populate('issue', 'issueNumber title');
    }

    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    // Increment view count
    article.viewCount += 1;
    await article.save();

    res.json({ article });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article.' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  ADMIN / EDITOR ROUTES
// ═══════════════════════════════════════════════════════════════

// ─── POST /api/articles/volumes — Create volume ───────────────
router.post('/volumes', authenticate, requireRole('editor', 'admin'), async (req: Request, res: Response) => {
  try {
    const { volumeNumber, year, title, description } = req.body;
    const volume = await Volume.create({ volumeNumber, year, title, description });
    res.status(201).json({ volume });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Volume number already exists.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create volume.' });
  }
});

// ─── POST /api/articles/issues — Create issue ────────────────
router.post('/issues', authenticate, requireRole('editor', 'admin'), async (req: Request, res: Response) => {
  try {
    const { volumeId, issueNumber, title, description } = req.body;
    const issue = await Issue.create({ volume: volumeId, issueNumber, title, description });
    res.status(201).json({ issue });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Issue number already exists for this volume.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create issue.' });
  }
});

// ─── POST /api/articles/publish — Publish an accepted manuscript ─
router.post('/publish', authenticate, requireRole('editor', 'admin'), async (req: Request, res: Response) => {
  try {
    const { manuscriptId, volumeId, issueId, doi, pages } = req.body;

    const manuscript = await Manuscript.findById(manuscriptId);
    if (!manuscript) {
      res.status(404).json({ error: 'Manuscript not found.' });
      return;
    }

    if (manuscript.status !== 'accepted') {
      res.status(400).json({ error: 'Only accepted manuscripts can be published.' });
      return;
    }

    // Create slug from title
    const slug = slugify(manuscript.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);

    const article = await Article.create({
      manuscript: manuscript.id,
      volume: volumeId,
      issue: issueId,
      title: manuscript.title,
      abstract: manuscript.abstract,
      authors: manuscript.authors.map((a) => ({
        name: a.name,
        email: a.email,
        affiliation: a.affiliation,
        isCorresponding: a.isCorresponding,
      })),
      keywords: manuscript.keywords,
      doi: doi || '',
      pdfUrl: manuscript.manuscriptFile?.url || '',
      pdfPublicId: manuscript.manuscriptFile?.publicId || '',
      slug,
      pages: pages || { start: 0, end: 0 },
      category: manuscript.category,
      publishedAt: new Date(),
    });

    // Update manuscript status
    manuscript.status = 'published';
    await manuscript.save();

    const populated = await Article.findById(article.id)
      .populate('volume', 'volumeNumber year')
      .populate('issue', 'issueNumber title');

    res.status(201).json({ article: populated });
  } catch (error) {
    console.error('Publish article error:', error);
    res.status(500).json({ error: 'Failed to publish article.' });
  }
});

export default router;
