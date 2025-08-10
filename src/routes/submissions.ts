import express from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { authenticate } from '../middleware/auth';
import { uploadSingle, handleUploadError, validateUploadedFile } from '../middleware/upload';
import { submissionLimiter } from '../middleware/rateLimit';
import { auditAction } from '../middleware/auditLogger';
import { validateRequest } from '../middleware/validation';
import { submissionSchema } from '../middleware/validation';

const router = express.Router();
const submissionController = new SubmissionController();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route POST /api/submissions
 * @desc Create a new manuscript submission
 * @access Private (Authors only)
 */
router.post(
  '/',
  submissionLimiter,
  uploadSingle,
  handleUploadError,
  validateUploadedFile,
  validateRequest(submissionSchema),
  auditAction('Create Submission'),
  submissionController.createSubmission
);

/**
 * @route GET /api/submissions/my
 * @desc Get current user's submissions
 * @access Private (Authors)
 */
router.get('/my', 
  auditAction('View My Submissions'),
  submissionController.getMySubmissions
);

/**
 * @route GET /api/submissions/all
 * @desc Get all submissions (admin/editor only)
 * @access Private (Admin/Editor)
 */
router.get('/all', submissionController.getAllSubmissions);

/**
 * @route GET /api/submissions/pending-review
 * @desc Get submissions pending review (admin/editor only)
 * @access Private (Admin/Editor)
 */
router.get('/pending-review', submissionController.getSubmissionsPendingReview);

/**
 * @route GET /api/submissions/statistics
 * @desc Get submission statistics (admin/editor only)
 * @access Private (Admin/Editor)
 */
router.get('/statistics', submissionController.getSubmissionStatistics);

/**
 * @route GET /api/submissions/search
 * @desc Search submissions (admin/editor only)
 * @access Private (Admin/Editor)
 */
router.get('/search', submissionController.searchSubmissions);

/**
 * @route GET /api/submissions/:id
 * @desc Get submission by ID
 * @access Private (Author can only see own, Admin/Editor can see all)
 */
router.get('/:id', submissionController.getSubmissionById);

/**
 * @route PUT /api/submissions/:id/status
 * @desc Update submission status (admin/editor only)
 * @access Private (Admin/Editor)
 */
router.put('/:id/status', submissionController.updateSubmissionStatus);

/**
 * @route PUT /api/submissions/:id/manuscript
 * @desc Update submission manuscript (for revisions)
 * @access Private (Authors - own submissions only)
 */
router.put(
  '/:id/manuscript',
  uploadSingle,
  handleUploadError,
  validateUploadedFile,
  submissionController.updateSubmissionManuscript
);

export default router;