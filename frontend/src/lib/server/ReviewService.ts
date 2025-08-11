import { ReviewRepository } from '@/lib/server/ReviewRepository';
import { SubmissionRepository } from '@/lib/server/SubmissionRepository';
import { UserRepository } from '@/lib/server/UserRepository';
import { Review, CreateReviewRequest } from '@/types/api';

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private submissionRepository: SubmissionRepository;
  private userRepository: UserRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.submissionRepository = new SubmissionRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Assign a review to a reviewer
   */
  async assignReview(reviewData: CreateReviewRequest): Promise<Review> {
    // Validate submission exists
    const submission = await this.submissionRepository.findById(reviewData.submission_id);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Validate reviewer exists and has reviewer role
    const reviewer = await this.userRepository.findById(reviewData.reviewer_id);
    if (!reviewer) {
      throw new Error('Reviewer not found');
    }
    if (reviewer.role !== 'reviewer' && reviewer.role !== 'admin') {
      throw new Error('User is not a reviewer');
    }

    // Create review
    const review = await this.reviewRepository.create({
      submission_id: reviewData.submission_id,
      reviewer_id: reviewData.reviewer_id,
      status: 'pending',
      recommendation: 'accept', // Default, can be updated later
      comments: reviewData.comments || '',
      confidential_comments: reviewData.confidential_comments,
      rating: reviewData.rating,
      assigned_date: new Date().toISOString()
    });

    return review;
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string): Promise<Review | null> {
    return await this.reviewRepository.findById(id);
  }

  /**
   * Get reviews by submission
   */
  async getReviewsBySubmission(submissionId: string): Promise<Review[]> {
    return await this.reviewRepository.findAll({ submission_id: submissionId });
  }

  /**
   * Get reviews by reviewer with pagination
   */
  async getReviewsByReviewer(
    reviewerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
    return await this.reviewRepository.findWithPagination(page, limit, { reviewer_id: reviewerId });
  }

  /**
   * Get all reviews with pagination (admin/editor only)
   */
  async getAllReviews(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
    return await this.reviewRepository.findWithPagination(page, limit);
  }

  /**
   * Update review
   */
  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    return await this.reviewRepository.update(id, updates);
  }

  /**
   * Submit review (mark as completed)
   */
  async submitReview(id: string): Promise<Review | null> {
    return await this.reviewRepository.submitReview(id);
  }

  /**
   * Delete review
   */
  async deleteReview(id: string): Promise<boolean> {
    return await this.reviewRepository.delete(id);
  }

  /**
   * Assign reviewer to submission
   */
  async assignReviewer(submissionId: string, reviewerId: string): Promise<Review> {
    // Validate submission exists and is in correct status
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.status !== 'submitted' && submission.status !== 'under_review') {
      throw new Error('Submission must be in submitted or under_review status');
    }

    // Validate reviewer exists
    const reviewer = await this.userRepository.findById(reviewerId);
    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    if (reviewer.role !== 'reviewer' && reviewer.role !== 'admin') {
      throw new Error('User must be a reviewer');
    }

    // Check if reviewer is already assigned
    const existingReviews = await this.reviewRepository.findBySubmission(submissionId);
    const isAlreadyAssigned = existingReviews.some(review => review.reviewer_id === reviewerId);
    
    if (isAlreadyAssigned) {
      throw new Error('Reviewer is already assigned to this submission');
    }

    // Create review assignment
    const review = await this.reviewRepository.create({
      submission_id: submissionId,
      reviewer_id: reviewerId,
      status: 'pending',
      recommendation: 'minor_revisions',
      comments: '',
      confidential_comments: '',
      rating: 0,
      assigned_date: new Date().toISOString()
    });

    // Update submission status to under_review if not already
    if (submission.status === 'submitted') {
      await this.submissionRepository.updateStatus(submissionId, 'under_review');
    }

    return review;
  }
}
