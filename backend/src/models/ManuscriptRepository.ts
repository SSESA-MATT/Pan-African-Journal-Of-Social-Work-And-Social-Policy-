import { BaseRepository } from './BaseRepository';

export interface Manuscript {
  id: string;
  title: string;
  abstract: string;
  content: string;
  keywords: string[];
  authors: string[];
  corresponding_author: string;
  author_id: string;
  status: ManuscriptStatus;
  submission_date: string;
  last_updated: string;
  assigned_reviewers?: string[];
  reviews?: Review[];
  files?: ManuscriptFile[];
  metadata?: ManuscriptMetadata;
}

export interface ManuscriptMetadata {
  word_count: number;
  manuscript_type: 'research' | 'review' | 'case-study' | 'commentary' | 'brief-communication';
  funding_information?: string;
  conflict_of_interest?: string;
  ethics_approval?: string;
  data_availability?: string;
}

export interface ManuscriptFile {
  id: string;
  manuscript_id: string;
  filename: string;
  file_type: 'manuscript' | 'figure' | 'table' | 'supplementary';
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export type ManuscriptStatus = 
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'awaiting-revision'
  | 'revised-submitted'
  | 'accepted'
  | 'rejected'
  | 'published';

export interface Review {
  id: string;
  manuscript_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  status: ReviewStatus;
  recommendation: ReviewRecommendation;
  comments_to_author?: string;
  comments_to_editor?: string;
  quality_rating: number;
  originality_rating: number;
  significance_rating: number;
  presentation_rating: number;
  overall_rating: number;
  submitted_date?: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 
  | 'assigned'
  | 'in-progress'
  | 'completed'
  | 'overdue';

export type ReviewRecommendation = 
  | 'accept'
  | 'minor-revisions'
  | 'major-revisions'
  | 'reject-resubmit'
  | 'reject';

export class ManuscriptRepository extends BaseRepository<Manuscript> {
  constructor() {
    super('manuscripts');
  }

  async findByAuthorId(authorId: string): Promise<Manuscript[]> {
    const { data, error } = await this.supabase
      .from('manuscripts')
      .select(`
        *,
        manuscript_reviews(
          id, status, recommendation, submitted_date, reviewer_id
        ),
        manuscript_files(
          id, filename, file_type, file_size, uploaded_at
        )
      `)
      .eq('author_id', authorId)
      .order('last_updated', { ascending: false });
    
    if (error) {
      throw error;
    }

    return (data || []).map(row => this.mapRowToEntity(row));
  }

  async findById(id: string): Promise<Manuscript | null> {
    const { data, error } = await this.supabase
      .from('manuscripts')
      .select(`
        *,
        manuscript_reviews(
          id, status, recommendation, comments_to_author, comments_to_editor,
          quality_rating, originality_rating, significance_rating,
          presentation_rating, overall_rating, submitted_date, due_date,
          reviewer_id, users(first_name, last_name)
        ),
        manuscript_files(
          id, filename, file_type, file_path, file_size, uploaded_at
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return this.mapRowToEntity(data);
  }

  async findAll(): Promise<Manuscript[]> {
    const { data, error } = await this.supabase
      .from('manuscripts')
      .select(`
        *,
        manuscript_reviews(reviewer_id, status)
      `)
      .order('submission_date', { ascending: false });
    
    if (error) {
      throw error;
    }

    return (data || []).map(row => this.mapRowToEntity(row));
  }

  async assignReviewer(manuscriptId: string, reviewerId: string): Promise<void> {
    // Check if reviewer is already assigned
    const { data: existing } = await this.supabase
      .from('manuscript_reviews')
      .select('id')
      .eq('manuscript_id', manuscriptId)
      .eq('reviewer_id', reviewerId)
      .single();
    
    if (existing) {
      throw new Error('Reviewer already assigned to this manuscript');
    }

    // Create new review assignment
    const { error: insertError } = await this.supabase
      .from('manuscript_reviews')
      .insert({
        manuscript_id: manuscriptId,
        reviewer_id: reviewerId,
        status: 'assigned',
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      throw insertError;
    }

    // Update manuscript status to under-review if it's submitted
    const { data: manuscript } = await this.supabase
      .from('manuscripts')
      .select('status')
      .eq('id', manuscriptId)
      .single();

    if (manuscript?.status === 'submitted') {
      await this.supabase
        .from('manuscripts')
        .update({ 
          status: 'under-review',
          last_updated: new Date().toISOString()
        })
        .eq('id', manuscriptId);
    }
  }

  async updateStatus(id: string, status: ManuscriptStatus): Promise<Manuscript | null> {
    const { data, error } = await this.supabase
      .from('manuscripts')
      .update({ 
        status,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return data ? this.mapRowToEntity(data) : null;
  }

  async findByReviewerId(reviewerId: string): Promise<Manuscript[]> {
    const { data, error } = await this.supabase
      .from('manuscripts')
      .select(`
        *,
        manuscript_reviews!inner(
          id, status, due_date, recommendation
        )
      `)
      .eq('manuscript_reviews.reviewer_id', reviewerId)
      .order('manuscript_reviews.due_date', { ascending: true });
    
    if (error) {
      throw error;
    }

    return (data || []).map(row => this.mapRowToEntity(row));
  }

  protected mapRowToEntity(row: any): Manuscript {
    return {
      id: row.id,
      title: row.title,
      abstract: row.abstract,
      content: row.content,
      keywords: Array.isArray(row.keywords) ? row.keywords : [],
      authors: Array.isArray(row.authors) ? row.authors : [],
      corresponding_author: row.corresponding_author,
      author_id: row.author_id,
      status: row.status,
      submission_date: row.submission_date,
      last_updated: row.last_updated,
      assigned_reviewers: row.manuscript_reviews ? row.manuscript_reviews.map((r: any) => r.reviewer_id) : [],
      reviews: row.manuscript_reviews ? row.manuscript_reviews.map((r: any) => ({
        ...r,
        reviewer_name: r.users ? `${r.users.first_name} ${r.users.last_name}` : undefined
      })) : [],
      files: row.manuscript_files || [],
      metadata: row.metadata || {}
    };
  }

  async create(data: Partial<Manuscript>): Promise<Manuscript> {
    const manuscriptData = {
      title: data.title,
      abstract: data.abstract,
      content: data.content,
      keywords: data.keywords || [],
      authors: data.authors || [],
      corresponding_author: data.corresponding_author,
      author_id: data.author_id,
      status: data.status || 'draft',
      submission_date: data.submission_date || new Date().toISOString(),
      last_updated: data.last_updated || new Date().toISOString(),
      metadata: data.metadata || {}
    };
    
    const { data: result, error } = await this.supabase
      .from('manuscripts')
      .insert(manuscriptData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return this.mapRowToEntity(result);
  }

  async update(id: string, data: Partial<Manuscript>): Promise<Manuscript | null> {
    const updateData: any = {
      last_updated: new Date().toISOString()
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.abstract !== undefined) updateData.abstract = data.abstract;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.keywords !== undefined) updateData.keywords = data.keywords;
    if (data.authors !== undefined) updateData.authors = data.authors;
    if (data.corresponding_author !== undefined) updateData.corresponding_author = data.corresponding_author;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    const { data: result, error } = await this.supabase
      .from('manuscripts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result ? this.mapRowToEntity(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('manuscripts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  }
}
