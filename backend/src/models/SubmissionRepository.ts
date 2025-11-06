import { BaseRepository } from './BaseRepository';
import { Submission } from './types';

export class SubmissionRepository extends BaseRepository<Submission> {
  constructor() {
    super('submissions');
  }

  /**
   * Create a new submission (override to handle submitted_at)
   */
  async create(data: Omit<Submission, 'id' | 'updated_at'>): Promise<Submission> {
    const { data: result, error } = await this.supabase
      .from('submissions')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Find submissions by author
   */
  async findByAuthor(authorId: string): Promise<Submission[]> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const result = await this.query(
        'SELECT * FROM submissions WHERE author_id = $1 ORDER BY submitted_at DESC',
        [authorId]
      );
      return result.rows;
    }

    const { data, error } = await this.supabase
      .from('submissions')
      .select('*')
      .eq('author_id', authorId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Find submissions by status
   */
  async findByStatus(status: Submission['status']): Promise<Submission[]> {
    const { data, error } = await this.supabase
      .from('submissions')
      .select('*')
      .eq('status', status)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Update submission status
   */
  async updateStatus(
    id: string, 
    status: Submission['status'], 
    editorComments?: string
  ): Promise<Submission | null> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const result = await this.query(
        'UPDATE submissions SET status = $1, editor_comments = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [status, editorComments, id]
      );
      return result.rows[0] || null;
    }

    const { data, error } = await this.supabase
      .from('submissions')
      .update({ 
        status, 
        editor_comments: editorComments,
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
   * Get submissions with author details
   */
  async findWithAuthorDetails(): Promise<any[]> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const result = await this.query(`
        SELECT 
          s.*,
          json_build_object(
            'first_name', u.first_name,
            'last_name', u.last_name,
            'email', u.email,
            'affiliation', u.affiliation
          ) as users
        FROM submissions s
        JOIN users u ON s.author_id = u.id
        ORDER BY s.submitted_at DESC
      `);
      return result.rows;
    }

    const { data, error } = await this.supabase
      .from('submissions')
      .select(`
        *,
        users:author_id (
          first_name,
          last_name,
          email,
          affiliation
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get submission statistics
   */
  async getSubmissionStats(): Promise<Record<string, number>> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const result = await this.query(
        'SELECT status, COUNT(*) as count FROM submissions WHERE status IS NOT NULL GROUP BY status'
      );
      
      const stats: Record<string, number> = {};
      result.rows.forEach((row: any) => {
        stats[row.status] = parseInt(row.count, 10);
      });
      
      return stats;
    }

    const { data, error } = await this.supabase
      .from('submissions')
      .select('status')
      .neq('status', null);

    if (error) {
      throw error;
    }

    const stats: Record<string, number> = {};
    data?.forEach((row: any) => {
      stats[row.status] = (stats[row.status] || 0) + 1;
    });

    return stats;
  }

  /**
   * Search submissions by title or keywords
   */
  async search(searchTerm: string): Promise<Submission[]> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const searchPattern = `%${searchTerm}%`;
      const result = await this.query(`
        SELECT * FROM submissions 
        WHERE title ILIKE $1 
           OR abstract ILIKE $1 
           OR array_to_string(keywords, ' ') ILIKE $1
        ORDER BY submitted_at DESC
      `, [searchPattern]);
      return result.rows;
    }

    const { data, error } = await this.supabase
      .from('submissions')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,abstract.ilike.%${searchTerm}%,keywords.ilike.%${searchTerm}%`)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get submissions pending review (for reviewer assignment)
   */
  async findPendingReview(): Promise<Submission[]> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const result = await this.query(`
        SELECT 
          s.*,
          json_build_object(
            'first_name', u.first_name,
            'last_name', u.last_name,
            'email', u.email
          ) as users
        FROM submissions s
        JOIN users u ON s.author_id = u.id
        WHERE s.status IN ('submitted', 'under_review')
        ORDER BY s.submitted_at ASC
      `);
      return result.rows;
    }

    const { data, error } = await this.supabase
      .from('submissions')
      .select(`
        *,
        users:author_id (
          first_name,
          last_name,
          email
        )
      `)
      .in('status', ['submitted', 'under_review'])
      .order('submitted_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get submissions with review count
   */
  async findWithReviewCount(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('submissions')
      .select(`
        *,
        users:author_id (
          first_name,
          last_name
        ),
        reviews(count)
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get submissions by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Submission[]> {
    const { data, error } = await this.supabase
      .from('submissions')
      .select('*')
      .gte('submitted_at', startDate.toISOString())
      .lte('submitted_at', endDate.toISOString())
      .order('submitted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }
}