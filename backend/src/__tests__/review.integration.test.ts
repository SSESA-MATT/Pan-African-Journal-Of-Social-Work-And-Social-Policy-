import request from 'supertest';
import express from 'express';
import { ReviewService } from '../services/ReviewService';
import { ReviewController } from '../controllers/ReviewController';
import reviewRoutes from '../routes/reviews';
import { authenticate } from '../middleware/auth';

// Mock the dependencies
jest.mock('../services/ReviewService');
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn()
}));

const MockedReviewService = ReviewService as jest.MockedClass<typeof ReviewService>;
const mockedAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;

describe('Review Integration Tests', () => {
  let app: express.Application;
  let mockReviewService: jest.Mocked<ReviewService>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    mockedAuthenticate.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        userId: 'test-user-id',
        role: 'reviewer',
        email: 'test@example.com'
      };
      next();
    });

    app.use('/api/reviews', reviewRoutes);

    // Setup mock service
    mockReviewService = new MockedReviewService() as jest.Mocked<ReviewService>;
    MockedReviewService.mockImplementation(() => mockReviewService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/reviews', () => {
    it('should create a new review successfully', async () => {
      const mockReview = {
        id: 'review-id',
        submission_id: 'submission-id',
        reviewer_id: 'test-user-id',
        comments: 'This is a detailed review with constructive feedback.',
        recommendation: 'minor_revisions' as const,
        submitted_at: new Date(),
      };

      mockReviewService.createReview.mockResolvedValue(mockReview);

      const response = await request(app)
        .post('/api/reviews')
        .send({
          submissionId: 'submission-id',
          comments: 'This is a detailed review with constructive feedback.',
          recommendation: 'minor_revisions',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Review submitted successfully');
      expect(response.body.review).toEqual(mockReview);
      expect(mockReviewService.createReview).toHaveBeenCalledWith(
        'submission-id',
        'test-user-id',
        {
          comments: 'This is a detailed review with constructive feedback.',
          recommendation: 'minor_revisions',
        }
      );
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send({
          submissionId: 'submission-id',
          // Missing comments and recommendation
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 400 when service throws error', async () => {
      mockReviewService.createReview.mockRejectedValue(new Error('Reviewer has already reviewed this submission'));

      const response = await request(app)
        .post('/api/reviews')
        .send({
          submissionId: 'submission-id',
          comments: 'This is a detailed review.',
          recommendation: 'accept',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Failed to create review');
      expect(response.body.message).toBe('Reviewer has already reviewed this submission');
    });
  });

  describe('GET /api/reviews/dashboard', () => {
    it('should return reviewer dashboard data', async () => {
      const mockDashboardData = {
        pendingReviews: [
          {
            id: 'submission-1',
            title: 'Test Submission',
            abstract: 'Test abstract',
            status: 'under_review',
            submitted_at: '2024-01-01T00:00:00Z',
            author_first_name: 'John',
            author_last_name: 'Doe',
          },
        ],
        completedReviews: [
          {
            id: 'review-1',
            submission_id: 'submission-2',
            reviewer_id: 'test-user-id',
            comments: 'Good work',
            recommendation: 'accept' as const,
            submitted_at: '2024-01-01T00:00:00Z',
            title: 'Completed Submission',
            abstract: 'Completed abstract',
            status: 'accepted',
            submission_date: '2023-12-01T00:00:00Z',
            author_first_name: 'Jane',
            author_last_name: 'Smith',
          },
        ],
        reviewStats: {
          totalReviews: 1,
          pendingCount: 1,
        },
      };

      mockReviewService.getReviewerDashboard.mockResolvedValue(mockDashboardData);

      const response = await request(app)
        .get('/api/reviews/dashboard');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDashboardData);
      expect(mockReviewService.getReviewerDashboard).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('GET /api/reviews/pending', () => {
    it('should return pending reviews for reviewer', async () => {
      const mockPendingReviews = [
        {
          id: 'submission-1',
          title: 'Pending Review',
          abstract: 'Abstract for pending review',
          status: 'under_review',
          submitted_at: '2024-01-01T00:00:00Z',
          author_first_name: 'John',
          author_last_name: 'Doe',
        },
      ];

      mockReviewService.getPendingReviewsForReviewer.mockResolvedValue(mockPendingReviews);

      const response = await request(app)
        .get('/api/reviews/pending');

      expect(response.status).toBe(200);
      expect(response.body.pendingReviews).toEqual(mockPendingReviews);
      expect(mockReviewService.getPendingReviewsForReviewer).toHaveBeenCalledWith('test-user-id');
    });

    it('should return 403 for non-reviewer users', async () => {
      // Mock user with author role
      mockedAuthenticate.mockImplementation((req: any, res: any, next: any) => {
        req.user = {
          userId: 'test-user-id',
          role: 'author',
          email: 'author@example.com'
        };
        next();
      });

      const response = await request(app)
        .get('/api/reviews/pending');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });
  });

  describe('POST /api/reviews/assign', () => {
    beforeEach(() => {
      // Mock user with editor role for assignment tests
      mockedAuthenticate.mockImplementation((req: any, res: any, next: any) => {
        req.user = {
          userId: 'editor-user-id',
          role: 'editor',
          email: 'editor@example.com'
        };
        next();
      });
    });

    it('should assign reviewer successfully', async () => {
      mockReviewService.assignReviewer.mockResolvedValue();

      const response = await request(app)
        .post('/api/reviews/assign')
        .send({
          submissionId: 'submission-id',
          reviewerId: 'reviewer-id',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reviewer assigned successfully');
      expect(mockReviewService.assignReviewer).toHaveBeenCalledWith(
        'submission-id',
        'reviewer-id',
        'editor-user-id'
      );
    });

    it('should return 403 for non-editor users', async () => {
      // Mock user with reviewer role
      mockedAuthenticate.mockImplementation((req: any, res: any, next: any) => {
        req.user = {
          userId: 'reviewer-user-id',
          role: 'reviewer',
          email: 'reviewer@example.com'
        };
        next();
      });

      const response = await request(app)
        .post('/api/reviews/assign')
        .send({
          submissionId: 'submission-id',
          reviewerId: 'reviewer-id',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/reviews/assign')
        .send({
          submissionId: 'submission-id',
          // Missing reviewerId
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields');
    });
  });

  describe('GET /api/reviews/submission/:submissionId', () => {
    beforeEach(() => {
      // Mock user with editor role
      mockedAuthenticate.mockImplementation((req: any, res: any, next: any) => {
        req.user = {
          userId: 'editor-user-id',
          role: 'editor',
          email: 'editor@example.com'
        };
        next();
      });
    });

    it('should return reviews for submission', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          submission_id: 'submission-id',
          reviewer_id: 'reviewer-1',
          comments: 'Good work',
          recommendation: 'accept' as const,
          submitted_at: new Date(),
        },
      ];

      const mockSummary = {
        total_reviews: 1,
        recommendations: { accept: 1 },
      };

      mockReviewService.getReviewsForSubmission.mockResolvedValue(mockReviews);
      mockReviewService.getSubmissionReviewSummary.mockResolvedValue(mockSummary);

      const response = await request(app)
        .get('/api/reviews/submission/submission-id');

      expect(response.status).toBe(200);
      expect(response.body.reviews).toEqual(mockReviews);
      expect(response.body.summary).toEqual(mockSummary);
    });

    it('should return 403 for non-editor users', async () => {
      // Mock user with author role
      mockedAuthenticate.mockImplementation((req: any, res: any, next: any) => {
        req.user = {
          userId: 'author-user-id',
          role: 'author',
          email: 'author@example.com'
        };
        next();
      });

      const response = await request(app)
        .get('/api/reviews/submission/submission-id');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });
  });
});