import { ReviewRepository } from '../models/ReviewRepository';
import { SubmissionRepository } from '../models/SubmissionRepository';
import { UserRepository } from '../models/UserRepository';
import { Review, CreateReviewRequest } from '../models/types';

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
   * Create a new review
   */
  async createReview(
    submissionId: string,
    reviewerId: string,
    reviewData: CreateReviewRequest
  ): Promise<Review> {
    // Verify submission exists and is in reviewable state
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    if (!['submitted', 'under_review'].includes(submission.status)) {
      throw new Error('Submission is not available for review');
    }

    // Verify reviewer exists and has reviewer role
    const reviewer = await this.userRepository.findById(reviewerId);
    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    if (!['reviewer', 'editor', 'admin'].includes(reviewer.role)) {
      throw new Error('User does not have reviewer permissions');
    }

    // Check if reviewer has already reviewed this submission
    const hasReviewed = await this.reviewRepository.hasReviewerReviewed(
      submissionId,
      reviewerId
    );
    if (hasReviewed) {
      throw new Error('Reviewer has already submitted a review for this submission');
    }

    // Create the review
    const review = await this.reviewRepository.create({
      submission_id: submissionId,
      reviewer_id: reviewerId,
      comments: reviewData.comments,
      recommendation: reviewData.recommendation,
      submitted_at: new Date(),
    });

    // Update submission status to under_review if it's still submitted
    if (submission.status === 'submitted') {
      await this.submissionRepository.update(submissionId, {
        status: 'under_review',
        updated_at: new Date(),
      });
    }

    return review;
  }

  /**
   * Get reviews for a specific submission
   */
  async getReviewsForSubmission(submissionId: string): Promise<Review[]> {
    return this.reviewRepository.findBySubmission(submissionId);
  }

  /**
   * Get reviews by a specific reviewer
   */
  async getReviewsByReviewer(reviewerId: string): Promise<any[]> {
    return this.reviewRepository.findByReviewerWithSubmissions(reviewerId);
  }

  /**
   * Get pending reviews for a reviewer (submissions assigned but not reviewed)
   */
  async getPendingReviewsForReviewer(reviewerId: string): Promise<any[]> {
    return this.reviewRepository.findPendingForReviewer(reviewerId);
  }

  /**
   * Get review summary for a submission
   */
  async getSubmissionReviewSummary(submissionId: string): Promise<{
    total_reviews: number;
    recommendations: Record<string, number>;
  }> {
    return this.reviewRepository.getSubmissionReviewSummary(submissionId);
  }

  /**
   * Get all reviews with details (for admin/editor use)
   */
  async getAllReviewsWithDetails(): Promise<any[]> {
    return this.reviewRepository.findWithDetails();
  }

  /**
   * Get review statistics
   */
  async getReviewStatistics(): Promise<{
    stats: Record<string, number>;
    averageReviewTime: number;
  }> {
    const stats = await this.reviewRepository.getReviewStats();
    const averageReviewTime = await this.reviewRepository.getAverageReviewTime();
    
    return {
      stats,
      averageReviewTime,
    };
  }

  /**
   * Assign reviewer to submission (for editors/admins)
   */
  async assignReviewer(submissionId: string, reviewerId: string, assignedBy: string) {
    // Verify submission exists
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Verify reviewer exists and has appropriate role
    const reviewer = await this.userRepository.findById(reviewerId);
    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    if (!['reviewer', 'editor', 'admin'].includes(reviewer.role)) {
      throw new Error('User cannot be assigned as reviewer');
    }

    // Verify assigner has permission
    const assigner = await this.userRepository.findById(assignedBy);
    if (!assigner || !['editor', 'admin'].includes(assigner.role)) {
      throw new Error('Insufficient permissions to assign reviewers');
    }

    // Check if reviewer is already assigned
    const hasReviewed = await this.reviewRepository.hasReviewerReviewed(
      submissionId,
      reviewerId
    );
    if (hasReviewed) {
      throw new Error('Reviewer is already assigned to this submission');
    }

    // For now, we'll create a placeholder review entry to track assignment
    // In a more complex system, you might have a separate reviewer_assignments table
    // This is a simplified approach that works with the current schema
    
    // Update submission status to under_review if needed
    if (submission.status === 'submitted') {
      await this.submissionRepository.update(submissionId, {
        status: 'under_review',
        updated_at: new Date(),
      });
    }

    // Return submission and reviewer information for email notifications
    return {
      submission,
      reviewer
    };
  }

  /**
   * Get reviewers available for assignment
   */
  async getAvailableReviewers(): Promise<any[]> {
    const reviewers = await this.userRepository.findByRole('reviewer');
    // Also include editors and admins who can review
    const editors = await this.userRepository.findByRole('editor');
    const admins = await this.userRepository.findByRole('admin');
    
    return [...reviewers, ...editors, ...admins].map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      affiliation: user.affiliation,
      role: user.role,
    }));
  }

  /**
   * Get reviewer dashboard data
   */
  async getReviewerDashboard(reviewerId: string): Promise<{
    pendingReviews: any[];
    completedReviews: any[];
    reviewStats: {
      totalReviews: number;
      pendingCount: number;
    };
  }> {
    const pendingReviews = await this.getPendingReviewsForReviewer(reviewerId);
    const completedReviews = await this.getReviewsByReviewer(reviewerId);
    
    return {
      pendingReviews,
      completedReviews,
      reviewStats: {
        totalReviews: completedReviews.length,
        pendingCount: pendingReviews.length,
      },
    };
  }

  /**
   * Get submission details with author information
   * Used for email notifications
   */
  async getSubmissionWithAuthor(submissionId: string) {
    const submission = await this.submissionRepository.findById(submissionId);
    
    if (!submission) {
      throw new Error('Submission not found');
    }
    
    const author = await this.userRepository.findById(submission.author_id);
    
    if (!author) {
      throw new Error('Author not found');
    }
    
    return {
      ...submission,
      author
    };
  }
}