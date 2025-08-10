import { ReviewService } from '../services/ReviewService';
import { ReviewRepository } from '../models/ReviewRepository';
import { SubmissionRepository } from '../models/SubmissionRepository';
import { UserRepository } from '../models/UserRepository';

// Mock the repositories
jest.mock('../models/ReviewRepository');
jest.mock('../models/SubmissionRepository');
jest.mock('../models/UserRepository');

const MockedReviewRepository = ReviewRepository as jest.MockedClass<typeof ReviewRepository>;
const MockedSubmissionRepository = SubmissionRepository as jest.MockedClass<typeof SubmissionRepository>;
const MockedUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let mockReviewRepository: jest.Mocked<ReviewRepository>;
  let mockSubmissionRepository: jest.Mocked<SubmissionRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockReviewRepository = new MockedReviewRepository() as jest.Mocked<ReviewRepository>;
    mockSubmissionRepository = new MockedSubmissionRepository() as jest.Mocked<SubmissionRepository>;
    mockUserRepository = new MockedUserRepository() as jest.Mocked<UserRepository>;

    MockedReviewRepository.mockImplementation(() => mockReviewRepository);
    MockedSubmissionRepository.mockImplementation(() => mockSubmissionRepository);
    MockedUserRepository.mockImplementation(() => mockUserRepository);

    reviewService = new ReviewService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create a review successfully', async () => {
      const submissionId = 'submission-id';
      const reviewerId = 'reviewer-id';
      const reviewData = {
        comments: 'This is a detailed review with constructive feedback.',
        recommendation: 'minor_revisions' as const,
      };

      const mockSubmission = {
        id: submissionId,
        title: 'Test Submission',
        abstract: 'Test abstract',
        keywords: ['test'],
        author_id: 'author-id',
        co_authors: [],
        status: 'submitted' as const,
        manuscript_url: 'test-url',
        submitted_at: new Date(),
        updated_at: new Date(),
      };

      const mockReviewer = {
        id: reviewerId,
        email: 'reviewer@example.com',
        password_hash: 'hash',
        first_name: 'John',
        last_name: 'Reviewer',
        affiliation: 'Test University',
        role: 'reviewer' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockReview = {
        id: 'review-id',
        submission_id: submissionId,
        reviewer_id: reviewerId,
        comments: reviewData.comments,
        recommendation: reviewData.recommendation,
        submitted_at: new Date(),
      };

      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);
      mockUserRepository.findById.mockResolvedValue(mockReviewer);
      mockReviewRepository.hasReviewerReviewed.mockResolvedValue(false);
      mockReviewRepository.create.mockResolvedValue(mockReview);
      mockSubmissionRepository.update.mockResolvedValue(mockSubmission);

      const result = await reviewService.createReview(submissionId, reviewerId, reviewData);

      expect(result).toEqual(mockReview);
      expect(mockSubmissionRepository.findById).toHaveBeenCalledWith(submissionId);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(reviewerId);
      expect(mockReviewRepository.hasReviewerReviewed).toHaveBeenCalledWith(submissionId, reviewerId);
      expect(mockReviewRepository.create).toHaveBeenCalled();
      expect(mockSubmissionRepository.update).toHaveBeenCalledWith(submissionId, {
        status: 'under_review',
        updated_at: expect.any(Date),
      });
    });

    it('should throw error if submission not found', async () => {
      const submissionId = 'non-existent-id';
      const reviewerId = 'reviewer-id';
      const reviewData = {
        comments: 'Test comments',
        recommendation: 'accept' as const,
      };

      mockSubmissionRepository.findById.mockResolvedValue(null);

      await expect(reviewService.createReview(submissionId, reviewerId, reviewData))
        .rejects.toThrow('Submission not found');
    });

    it('should throw error if reviewer not found', async () => {
      const submissionId = 'submission-id';
      const reviewerId = 'non-existent-reviewer';
      const reviewData = {
        comments: 'Test comments',
        recommendation: 'accept' as const,
      };

      const mockSubmission = {
        id: submissionId,
        title: 'Test Submission',
        abstract: 'Test abstract',
        keywords: ['test'],
        author_id: 'author-id',
        co_authors: [],
        status: 'submitted' as const,
        manuscript_url: 'test-url',
        submitted_at: new Date(),
        updated_at: new Date(),
      };

      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(reviewService.createReview(submissionId, reviewerId, reviewData))
        .rejects.toThrow('Reviewer not found');
    });

    it('should throw error if reviewer has already reviewed', async () => {
      const submissionId = 'submission-id';
      const reviewerId = 'reviewer-id';
      const reviewData = {
        comments: 'Test comments',
        recommendation: 'accept' as const,
      };

      const mockSubmission = {
        id: submissionId,
        title: 'Test Submission',
        abstract: 'Test abstract',
        keywords: ['test'],
        author_id: 'author-id',
        co_authors: [],
        status: 'submitted' as const,
        manuscript_url: 'test-url',
        submitted_at: new Date(),
        updated_at: new Date(),
      };

      const mockReviewer = {
        id: reviewerId,
        email: 'reviewer@example.com',
        password_hash: 'hash',
        first_name: 'John',
        last_name: 'Reviewer',
        affiliation: 'Test University',
        role: 'reviewer' as const,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSubmissionRepository.findById.mockResolvedValue(mockSubmission);
      mockUserRepository.findById.mockResolvedValue(mockReviewer);
      mockReviewRepository.hasReviewerReviewed.mockResolvedValue(true);

      await expect(reviewService.createReview(submissionId, reviewerId, reviewData))
        .rejects.toThrow('Reviewer has already submitted a review for this submission');
    });
  });

  describe('getReviewerDashboard', () => {
    it('should return dashboard data', async () => {
      const reviewerId = 'reviewer-id';
      const mockPendingReviews = [
        {
          id: 'submission-1',
          title: 'Pending Review',
          abstract: 'Abstract',
          status: 'under_review',
          submitted_at: '2024-01-01T00:00:00Z',
          author_first_name: 'John',
          author_last_name: 'Doe',
        },
      ];
      const mockCompletedReviews = [
        {
          id: 'review-1',
          submission_id: 'submission-2',
          reviewer_id: reviewerId,
          comments: 'Good work',
          recommendation: 'accept' as const,
          submitted_at: '2024-01-01T00:00:00Z',
          title: 'Completed Review',
          abstract: 'Abstract',
          status: 'accepted',
          submission_date: '2023-12-01T00:00:00Z',
          author_first_name: 'Jane',
          author_last_name: 'Smith',
        },
      ];

      mockReviewRepository.findPendingForReviewer.mockResolvedValue(mockPendingReviews);
      mockReviewRepository.findByReviewerWithSubmissions.mockResolvedValue(mockCompletedReviews);

      const result = await reviewService.getReviewerDashboard(reviewerId);

      expect(result).toEqual({
        pendingReviews: mockPendingReviews,
        completedReviews: mockCompletedReviews,
        reviewStats: {
          totalReviews: 1,
          pendingCount: 1,
        },
      });
    });
  });
});