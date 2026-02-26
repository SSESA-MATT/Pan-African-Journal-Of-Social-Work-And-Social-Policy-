import { Router, Request, Response } from 'express';
import Review from '../models/Review';
import Manuscript from '../models/Manuscript';
import User from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';
import emailService from '../services/email-service';

const router = Router();

// All review routes require authentication
router.use(authenticate);

// ─── POST /api/reviews/assign — Assign reviewer to manuscript ─
router.post('/assign', requireRole('editor', 'admin'), async (req: Request, res: Response) => {
  try {
    const { manuscriptId, reviewerId, dueDate } = req.body;

    // Validate manuscript
    const manuscript = await Manuscript.findById(manuscriptId);
    if (!manuscript) {
      res.status(404).json({ error: 'Manuscript not found.' });
      return;
    }

    // Validate reviewer
    const reviewer = await User.findById(reviewerId);
    if (!reviewer || !['reviewer', 'editor'].includes(reviewer.role)) {
      res.status(400).json({ error: 'Invalid reviewer.' });
      return;
    }

    // Check for existing assignment
    const existingReview = await Review.findOne({
      manuscript: manuscriptId,
      reviewer: reviewerId,
      round: req.body.round || 1,
    });
    if (existingReview) {
      res.status(409).json({ error: 'This reviewer is already assigned to this manuscript.' });
      return;
    }

    // Create review assignment
    const review = await Review.create({
      manuscript: manuscriptId,
      reviewer: reviewerId,
      assignedBy: req.userId,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Default 3 weeks
      round: req.body.round || 1,
    });

    // Update manuscript status
    if (manuscript.status === 'submitted' || manuscript.status === 'revised') {
      manuscript.status = 'under_review';
      await manuscript.save();
    }

    // Send email to reviewer
    emailService
      .sendReviewAssignment(
        reviewer.email,
        reviewer.fullName,
        manuscript.title,
        review.dueDate
      )
      .catch(() => {});

    const populated = await Review.findById(review.id)
      .populate('manuscript', 'title abstract status')
      .populate('reviewer', 'firstName lastName email affiliation expertise')
      .populate('assignedBy', 'firstName lastName');

    res.status(201).json({ review: populated });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'This reviewer is already assigned to this manuscript for this round.' });
      return;
    }
    console.error('Review assignment error:', error);
    res.status(500).json({ error: 'Failed to assign reviewer.' });
  }
});

// ─── GET /api/reviews/my — Reviewer's assignments ─────────────
router.get('/my', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: any = { reviewer: req.userId };
    if (status) query.status = status;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('manuscript', 'title abstract status category keywords submittedAt')
        .populate('assignedBy', 'firstName lastName'),
      Review.countDocuments(query),
    ]);

    res.json({
      reviews,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// ─── GET /api/reviews/dashboard — Reviewer dashboard data ─────
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [pending, completed, totalAssigned] = await Promise.all([
      Review.find({ reviewer: req.userId, status: { $in: ['pending', 'in_progress'] } })
        .populate('manuscript', 'title abstract status category keywords submittedAt')
        .sort({ dueDate: 1 }),
      Review.find({ reviewer: req.userId, status: 'completed' })
        .populate('manuscript', 'title abstract status')
        .sort({ completedAt: -1 })
        .limit(10),
      Review.countDocuments({ reviewer: req.userId }),
    ]);

    res.json({
      pendingReviews: pending,
      completedReviews: completed,
      reviewStats: {
        totalReviews: totalAssigned,
        pendingCount: pending.length,
        completedCount: completed.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

// ─── GET /api/reviews/available-reviewers — for assignment ────
router.get('/available-reviewers', requireRole('editor', 'admin'), async (req: Request, res: Response) => {
  try {
    const { manuscriptId, expertise } = req.query;

    const query: any = { role: { $in: ['reviewer', 'editor'] }, isActive: true };

    // Exclude already assigned reviewers
    if (manuscriptId) {
      const existingReviews = await Review.find({
        manuscript: manuscriptId,
        status: { $nin: ['declined'] },
      }).select('reviewer');
      const assignedIds = existingReviews.map((r) => r.reviewer);
      query._id = { $nin: assignedIds };
    }

    // Filter by expertise if specified
    if (expertise) {
      query.expertise = { $in: (expertise as string).split(',').map((e) => e.trim()) };
    }

    const reviewers = await User.find(query)
      .select('firstName lastName email affiliation expertise')
      .sort({ lastName: 1 });

    res.json({ reviewers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available reviewers.' });
  }
});

// ─── GET /api/reviews/all — All reviews (editor/admin) ────────
router.get('/all', requireRole('editor', 'admin'), async (req: Request, res: Response) => {
  try {
    const { status, manuscriptId, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: any = {};
    if (status) query.status = status;
    if (manuscriptId) query.manuscript = manuscriptId;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('manuscript', 'title status')
        .populate('reviewer', 'firstName lastName email affiliation')
        .populate('assignedBy', 'firstName lastName'),
      Review.countDocuments(query),
    ]);

    res.json({
      reviews,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// ─── GET /api/reviews/statistics — Review stats ───────────────
router.get('/statistics', requireRole('editor', 'admin'), async (_req: Request, res: Response) => {
  try {
    const [statusStats, recommendationStats, avgCompletionDays] = await Promise.all([
      Review.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Review.aggregate([
        { $match: { recommendation: { $ne: null } } },
        { $group: { _id: '$recommendation', count: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $match: { completedAt: { $ne: null } } },
        {
          $project: {
            daysToComplete: {
              $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60 * 24],
            },
          },
        },
        { $group: { _id: null, avgDays: { $avg: '$daysToComplete' } } },
      ]),
    ]);

    res.json({
      byStatus: Object.fromEntries(statusStats.map((s) => [s._id, s.count])),
      byRecommendation: Object.fromEntries(recommendationStats.map((s) => [s._id, s.count])),
      averageCompletionDays: avgCompletionDays[0]?.avgDays ? Math.round(avgCompletionDays[0].avgDays) : 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review statistics.' });
  }
});

// ─── GET /api/reviews/:id — Single review ─────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('manuscript', 'title abstract status category keywords authors manuscriptFile')
      .populate('reviewer', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName');

    if (!review) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }

    // Only reviewer, editor, or admin can view
    const isReviewer = review.reviewer && (review.reviewer as any)._id.toString() === req.userId;
    const isPrivileged = ['editor', 'admin'].includes(req.user!.role);

    if (!isReviewer && !isPrivileged) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    res.json({ review });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review.' });
  }
});

// ─── PUT /api/reviews/:id — Submit/update review ──────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }

    const isReviewer = review.reviewer.toString() === req.userId;
    const isPrivileged = ['editor', 'admin'].includes(req.user!.role);

    if (!isReviewer && !isPrivileged) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const { recommendation, commentsToAuthor, commentsToEditor, ratings, status } = req.body;

    if (recommendation) review.recommendation = recommendation;
    if (commentsToAuthor) review.commentsToAuthor = commentsToAuthor;
    if (commentsToEditor) review.commentsToEditor = commentsToEditor;
    if (ratings) review.ratings = { ...review.ratings, ...ratings };

    // Handle status transitions
    if (status === 'completed' || (recommendation && commentsToAuthor)) {
      review.status = 'completed';
      review.completedAt = new Date();
    } else if (status === 'in_progress') {
      review.status = 'in_progress';
    } else if (status === 'declined') {
      review.status = 'declined';
      review.declinedAt = new Date();
      review.declineReason = req.body.declineReason || '';
    }

    await review.save();

    // If review is completed, notify author
    if (review.status === 'completed') {
      const manuscript = await Manuscript.findById(review.manuscript).populate('submittedBy', 'firstName lastName email');
      if (manuscript) {
        const author = manuscript.submittedBy as any;
        emailService
          .sendReviewCompleted(author.email, author.firstName, manuscript.title)
          .catch(() => {});
      }
    }

    const populated = await Review.findById(review.id)
      .populate('manuscript', 'title status')
      .populate('reviewer', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName');

    res.json({ review: populated });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review.' });
  }
});

export default router;
