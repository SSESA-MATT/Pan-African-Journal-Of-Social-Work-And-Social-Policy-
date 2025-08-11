import { BaseRepository } from '@/lib/server/BaseRepository';
import { Submission, CreateSubmissionRequest } from '@/types/api';

export class SubmissionRepository extends BaseRepository<Submission> {
  constructor() {
    super('submissions');
  }

  /**
   * Create submission with specific timestamp field
   */
  async createSubmission(data: CreateSubmissionRequest & { author_id: string }): Promise<Submission> {
    const { data: result, error } = await this.supabase
      .from('submissions')
      .insert([{
        ...data,
        status: 'draft',
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
   * Find submissions by author
   */
  async findByAuthor(authorId: string): Promise<Submission[]> {
    const { data, error } = await this.supabase
      .from('submissions')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

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
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Update submission status
   */
  async updateStatus(id: string, status: Submission['status']): Promise<Submission | null> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Set submitted_at when status changes to submitted
    if (status === 'submitted') {
      updateData.submitted_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Get submissions with pagination and filtering
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: Submission['status'];
      author_id?: string;
    }
  ): Promise<{ data: Submission[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    
    let query = this.supabase.from('submissions').select('*');
    let countQuery = this.supabase.from('submissions').select('*', { count: 'exact', head: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
      countQuery = countQuery.eq('status', filters.status);
    }

    if (filters?.author_id) {
      query = query.eq('author_id', filters.author_id);
      countQuery = countQuery.eq('author_id', filters.author_id);
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
