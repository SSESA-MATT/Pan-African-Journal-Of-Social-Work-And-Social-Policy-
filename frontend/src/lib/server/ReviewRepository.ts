import { BaseRepository } from '@/lib/server/BaseRepository';
import { Review, CreateReviewRequest } from '@/types/api';

export class ReviewRepository extends BaseRepository<Review> {
  constructor() {
    super('reviews');
  }

  /**
   * Create review with specific timestamp field
   */
  async createReview(data: CreateReviewRequest & { reviewer_id: string }): Promise<Review> {
    const { data: result, error } = await this.supabase
      .from('reviews')
      .insert([{
        ...data,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
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
      .order('created_at', { ascending: false });

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
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Submit review (mark as completed)
   */
  async submitReview(id: string): Promise<Review | null> {
    const { data, error } = await this.supabase
      .from('reviews')
      .update({
        is_completed: true,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Get reviews with pagination and filtering
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: {
      submission_id?: string;
      reviewer_id?: string;
      is_completed?: boolean;
    }
  ): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    
    let query = this.supabase.from('reviews').select('*');
    let countQuery = this.supabase.from('reviews').select('*', { count: 'exact', head: true });

    if (filters?.submission_id) {
      query = query.eq('submission_id', filters.submission_id);
      countQuery = countQuery.eq('submission_id', filters.submission_id);
    }

    if (filters?.reviewer_id) {
      query = query.eq('reviewer_id', filters.reviewer_id);
      countQuery = countQuery.eq('reviewer_id', filters.reviewer_id);
    }

    if (filters?.is_completed !== undefined) {
      query = query.eq('is_completed', filters.is_completed);
      countQuery = countQuery.eq('is_completed', filters.is_completed);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const [{ data, error }, { count, error: countError }] = await Promise.all([
      query,
      countQuery
    ]);

    if (error) throw error;
    if (countError) throw countError;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  }
}
