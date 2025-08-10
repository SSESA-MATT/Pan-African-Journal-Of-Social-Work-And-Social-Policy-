import { Request, Response } from 'express';
import { ReviewService } from '../services/ReviewService';
import { EmailService } from '../services';
import { CreateReviewRequest } from '../models/types';

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  /**
   * Create a new review
   * POST /api/reviews
   */
  createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { submissionId, comments, recommendation } = req.body;
      const reviewerId = req.user?.userId;

      if (!reviewerId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!submissionId || !comments || !recommendation) {
        res.status(400).json({ 
          error: 'Missing required fields',
          message: 'submissionId, comments, and recommendation are required'
        });
        return;
      }

      const reviewData: CreateReviewRequest = {
        comments,
        recommendation,
      };

      const review = await this.reviewService.createReview(
        submissionId,
        reviewerId,
        reviewData
      );

      // Send email notification to the submission author
      try {
        const submission = await this.reviewService.getSubmissionWithAuthor(submissionId);
        
        if (submission && submission.author) {
          await EmailService.sendReviewCompletedEmail(
            submission.author.email,
            `${submission.author.first_name} ${submission.author.last_name}`,
            submission.title
          );
          
          console.log(`Review completed email sent to ${submission.author.email}`);
        }
      } catch (emailError) {
        console.error('Error sending review completed email:', emailError);
        // Continue the process even if email fails
      }

      res.status(201).json({
        message: 'Review submitted successfully',
        review,
      });
    } catch (error: any) {
      console.error('Error creating review:', error);
      res.status(400).json({
        error: 'Failed to create review',
        message: error.message,
      });
    }
  };

  /**
   * Get reviews for a submission
   * GET /api/reviews/submission/:submissionId
   */
  getReviewsForSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const userRole = req.user?.role;

      // Only editors and admins can view all reviews for a submission
      if (!['editor', 'admin'].includes(userRole || '')) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'Only editors and admins can view submission reviews'
        });
        return;
      }

      const reviews = await this.reviewService.getReviewsForSubmission(submissionId);
      const summary = await this.reviewService.getSubmissionReviewSummary(submissionId);

      res.json({
        reviews,
        summary,
      });
    } catch (error: any) {
      console.error('Error fetching submission reviews:', error);
      res.status(500).json({
        error: 'Failed to fetch reviews',
        message: error.message,
      });
    }
  };

  /**
   * Get reviewer's own reviews
   * GET /api/reviews/my-reviews
   */
  getMyReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviewerId = req.user?.userId;

      if (!reviewerId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const reviews = await this.reviewService.getReviewsByReviewer(reviewerId);

      res.json({
        reviews,
      });
    } catch (error: any) {
      console.error('Error fetching reviewer reviews:', error);
      res.status(500).json({
        error: 'Failed to fetch reviews',
        message: error.message,
      });
    }
  };

  /**
   * Get pending reviews for reviewer
   * GET /api/reviews/pending
   */
  getPendingReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviewerId = req.user?.userId;
      const userRole = req.user?.role;

      if (!reviewerId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Only reviewers, editors, and admins can access pending reviews
      if (!['reviewer', 'editor', 'admin'].includes(userRole || '')) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'Only reviewers can access pending reviews'
        });
        return;
      }

      const pendingReviews = await this.reviewService.getPendingReviewsForReviewer(reviewerId);

      res.json({
        pendingReviews,
      });
    } catch (error: any) {
      console.error('Error fetching pending reviews:', error);
      res.status(500).json({
        error: 'Failed to fetch pending reviews',
        message: error.message,
      });
    }
  };

  /**
   * Get reviewer dashboard data
   * GET /api/reviews/dashboard
   */
  getReviewerDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const reviewerId = req.user?.userId;
      const userRole = req.user?.role;

      if (!reviewerId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!['reviewer', 'editor', 'admin'].includes(userRole || '')) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'Only reviewers can access dashboard'
        });
        return;
      }

      const dashboardData = await this.reviewService.getReviewerDashboard(reviewerId);

      res.json(dashboardData);
    } catch (error: any) {
      console.error('Error fetching reviewer dashboard:', error);
      res.status(500).json({
        error: 'Failed to fetch dashboard data',
        message: error.message,
      });
    }
  };

  /**
   * Assign reviewer to submission (admin/editor only)
   * POST /api/reviews/assign
   */
  assignReviewer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { submissionId, reviewerId } = req.body;
      const assignerId = req.user?.userId;
      const userRole = req.user?.role;

      if (!assignerId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!['editor', 'admin'].includes(userRole || '')) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'Only editors and admins can assign reviewers'
        });
        return;
      }

      if (!submissionId || !reviewerId) {
        res.status(400).json({ 
          error: 'Missing required fields',
          message: 'submissionId and reviewerId are required'
        });
        return;
      }

      const assignmentResult = await this.reviewService.assignReviewer(submissionId, reviewerId, assignerId);

      // Send email notification to the assigned reviewer
      try {
        if (assignmentResult.reviewer && assignmentResult.submission) {
          const reviewer = assignmentResult.reviewer;
          const submission = assignmentResult.submission;
          
          // Due date is 30 days from now
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);
          
          await EmailService.sendReviewAssignmentEmail(
            reviewer.email,
            `${reviewer.first_name} ${reviewer.last_name}`,
            submission.title,
            dueDate
          );
          
          console.log(`Review assignment email sent to ${reviewer.email}`);
        }
      } catch (emailError) {
        console.error('Error sending review assignment email:', emailError);
        // Continue with the assignment process even if email fails
      }

      res.json({
        message: 'Reviewer assigned successfully',
      });
    } catch (error: any) {
      console.error('Error assigning reviewer:', error);
      res.status(400).json({
        error: 'Failed to assign reviewer',
        message: error.message,
      });
    }
  };

  /**
   * Get available reviewers (admin/editor only)
   * GET /api/reviews/available-reviewers
   */
  getAvailableReviewers = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!['editor', 'admin'].includes(userRole || '')) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'Only editors and admins can view available reviewers'
        });
        return;
      }

      const reviewers = await this.reviewService.getAvailableReviewers();

      res.json({
        reviewers,
      });
    } catch (error: any) {
      console.error('Error fetching available reviewers:', error);
      res.status(500).json({
        error: 'Failed to fetch reviewers',
        message: error.message,
      });
    }
  };

  /**
   * Get all reviews with details (admin/editor only)
   * GET /api/reviews/all
   */
  getAllReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!['editor', 'admin'].includes(userRole || '')) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'Only editors and admins can view all reviews'
        });
        return;
      }

      const reviews = await this.reviewService.getAllReviewsWithDetails();

      res.json({
        reviews,
      });
    } catch (error: any) {
      console.error('Error fetching all reviews:', error);
      res.status(500).json({
        error: 'Failed to fetch reviews',
        message: error.message,
      });
    }
  };

  /**
   * Get review statistics (admin/editor only)
   * GET /api/reviews/statistics
   */
  getReviewStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRole = req.user?.role;

      if (!['editor', 'admin'].includes(userRole || '')) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'Only editors and admins can view review statistics'
        });
        return;
      }

      const statistics = await this.reviewService.getReviewStatistics();

      res.json(statistics);
    } catch (error: any) {
      console.error('Error fetching review statistics:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics',
        message: error.message,
      });
    }
  };
}