import express from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const reviewController = new ReviewController();

// All review routes require authentication
router.use(authenticate);

// Create a new review
router.post('/', reviewController.createReview);

// Get reviewer's own reviews
router.get('/my-reviews', reviewController.getMyReviews);

// Get pending reviews for reviewer
router.get('/pending', reviewController.getPendingReviews);

// Get reviewer dashboard data
router.get('/dashboard', reviewController.getReviewerDashboard);

// Assign reviewer to submission (admin/editor only)
router.post('/assign', reviewController.assignReviewer);

// Get available reviewers (admin/editor only)
router.get('/available-reviewers', reviewController.getAvailableReviewers);

// Get all reviews with details (admin/editor only)
router.get('/all', reviewController.getAllReviews);

// Get review statistics (admin/editor only)
router.get('/statistics', reviewController.getReviewStatistics);

// Get reviews for a specific submission (admin/editor only)
router.get('/submission/:submissionId', reviewController.getReviewsForSubmission);

export default router;