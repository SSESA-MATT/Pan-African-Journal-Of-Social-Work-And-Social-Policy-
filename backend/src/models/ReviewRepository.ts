import { BaseRepository } from './BaseRepository';
import { Review } from './types';

export class ReviewRepository extends BaseRepository<Review> {
  constructor() {
    super('reviews');
  }

  /**
   * Create a new review (override to handle submitted_at)
   */
  async create(data: Omit<Review, 'id'>): Promise<Review> {
    const { data: result, error } = await this.supabase
      .from('reviews')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Find reviews by submission
   */
  async findBySubmission(submissionId: string): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('submission_id', submissionId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Find reviews by reviewer
   */
  async findByReviewer(reviewerId: string): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .eq('reviewer_id', reviewerId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get reviews with submission and reviewer details
   */
  async findWithDetails(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        submissions:submission_id (
          title,
          status
        ),
        users:reviewer_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get reviews for a specific reviewer with submission details
   */
  async findByReviewerWithSubmissions(reviewerId: string): Promise<any[]> {
    // When DB_HOST is set (test mode), use SQL directly
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const res = await this.query(
        `SELECT r.*, 
          s.title, s.abstract, s.status, s.submitted_at as submission_date,
          u.first_name as author_first_name, 
          u.last_name as author_last_name
         FROM reviews r
         LEFT JOIN submissions s ON r.submission_id = s.id
         LEFT JOIN users u ON s.author_id = u.id
         WHERE r.reviewer_id = $1
         ORDER BY r.submitted_at DESC`,
        [reviewerId]
      );
      return res.rows || [];
    }

    // Supabase implementation (production)
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        *,
        submissions:submission_id (
          title,
          abstract,
          status,
          submitted_at,
          users:author_id (
            first_name,
            last_name
          )
        )
      `)
      .eq('reviewer_id', reviewerId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Check if reviewer has already reviewed a submission
   */
  async hasReviewerReviewed(submissionId: string, reviewerId: string): Promise<boolean> {
    // When DB_HOST is set (test mode), use SQL directly
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const res = await this.query(
        'SELECT id FROM reviews WHERE submission_id = $1 AND reviewer_id = $2 LIMIT 1',
        [submissionId, reviewerId]
      );
      return (res.rows?.length || 0) > 0;
    }

    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('reviewer_id', reviewerId)
        .limit(1);

      if (error) {
        throw error;
      }

      return (data?.length || 0) > 0;
    } catch (err: any) {
      throw err;
    }
  }

  /**
   * Get review statistics by recommendation
   */
  async getReviewStats(): Promise<Record<string, number>> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('recommendation');

    if (error) {
      throw error;
    }

    const stats: Record<string, number> = {};
    data?.forEach((row: any) => {
      stats[row.recommendation] = (stats[row.recommendation] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get pending reviews for a reviewer (submissions assigned but not reviewed)
   */
  async findPendingForReviewer(reviewerId: string): Promise<any[]> {
    // When DB_HOST is set (test mode), use SQL directly
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const res = await this.query(
        `SELECT s.*, 
          u.first_name as author_first_name, 
          u.last_name as author_last_name
         FROM submissions s
         LEFT JOIN users u ON s.author_id = u.id
         WHERE s.status IN ('submitted', 'under_review')
           AND NOT EXISTS (
             SELECT 1 FROM reviews r 
             WHERE r.submission_id = s.id 
             AND r.reviewer_id = $1
           )
         ORDER BY s.submitted_at ASC`,
        [reviewerId]
      );
      return res.rows || [];
    }

    // Supabase implementation (production)
    const { data: submissions, error: submissionsError } = await this.supabase
      .from('submissions')
      .select(`
        *,
        users:author_id (
          first_name,
          last_name
        )
      `)
      .in('status', ['submitted', 'under_review'])
      .order('submitted_at', { ascending: true });

    if (submissionsError) {
      throw submissionsError;
    }

    // Filter out submissions already reviewed by this reviewer
    const pendingSubmissions = [];
    for (const submission of submissions || []) {
      const hasReviewed = await this.hasReviewerReviewed(submission.id, reviewerId);
      if (!hasReviewed) {
        pendingSubmissions.push(submission);
      }
    }

    return pendingSubmissions;
  }

  /**
   * Get review summary for a submission
   */
  async getSubmissionReviewSummary(submissionId: string): Promise<{
    total_reviews: number;
    recommendations: Record<string, number>;
  }> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('recommendation')
      .eq('submission_id', submissionId);

    if (error) {
      throw error;
    }

    const recommendations: Record<string, number> = {};
    data?.forEach((row: any) => {
      recommendations[row.recommendation] = (recommendations[row.recommendation] || 0) + 1;
    });

    return {
      total_reviews: data?.length || 0,
      recommendations
    };
  }

  /**
   * Get average review time (simplified calculation)
   * Returns average days between submission and review
   */
  async getAverageReviewTime(): Promise<number> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select(`
        submitted_at,
        submissions:submission_id (
          submitted_at
        )
      `)
      .limit(100); // Limit for performance

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    let totalDays = 0;
    let validReviews = 0;

    data.forEach((review: any) => {
      const reviewDate = new Date(review.submitted_at);
      const submissionDate = new Date(review.submissions.submitted_at);
      const daysDiff = (reviewDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff >= 0) { // Only count positive differences
        totalDays += daysDiff;
        validReviews++;
      }
    });

    return validReviews > 0 ? totalDays / validReviews : 0;
  }
}