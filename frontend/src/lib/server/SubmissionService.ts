import { SubmissionRepository } from '@/lib/server/SubmissionRepository';
import { UserRepository } from '@/lib/server/UserRepository';
import { Submission, CreateSubmissionRequest } from '@/types/api';

export class SubmissionService {
  private submissionRepository: SubmissionRepository;
  private userRepository: UserRepository;

  constructor() {
    this.submissionRepository = new SubmissionRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Create a new manuscript submission
   */
  async createSubmission(data: CreateSubmissionRequest & { author_id: string }): Promise<Submission> {
    // Validate author exists
    const author = await this.userRepository.findById(data.author_id);
    if (!author) {
      throw new Error('Author not found');
    }

    // Validate author role
    if (author.role !== 'author' && author.role !== 'admin') {
      throw new Error('Only authors can submit manuscripts');
    }

    return await this.submissionRepository.createSubmission(data);
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(id: string): Promise<Submission | null> {
    return await this.submissionRepository.findById(id);
  }

  /**
   * Get submissions by author with pagination
   */
  async getSubmissionsByAuthor(
    authorId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ data: Submission[]; total: number; page: number; limit: number }> {
    return await this.submissionRepository.findWithPagination(page, limit, { author_id: authorId });
  }

  /**
   * Get all submissions with pagination (admin/editor only)
   */
  async getAllSubmissions(
    page: number = 1, 
    limit: number = 10,
    status?: Submission['status']
  ): Promise<{ data: Submission[]; total: number; page: number; limit: number }> {
    const filters = status ? { status } : undefined;
    return await this.submissionRepository.findWithPagination(page, limit, filters);
  }

  /**
   * Update submission
   */
  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | null> {
    return await this.submissionRepository.update(id, updates);
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(id: string, status: Submission['status']): Promise<Submission | null> {
    return await this.submissionRepository.updateStatus(id, status);
  }

  /**
   * Delete submission
   */
  async deleteSubmission(id: string): Promise<boolean> {
    return await this.submissionRepository.delete(id);
  }

  /**
   * Get submissions by status
   */
  async getSubmissionsByStatus(status: Submission['status']): Promise<Submission[]> {
    return await this.submissionRepository.findByStatus(status);
  }
}
