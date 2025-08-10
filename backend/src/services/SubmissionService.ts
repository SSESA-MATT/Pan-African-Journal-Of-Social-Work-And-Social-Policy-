import { SubmissionRepository } from '../models/SubmissionRepository';
import { UserRepository } from '../models/UserRepository';
import { FileService } from './FileService';
import { Submission, CreateSubmissionRequest, UpdateSubmissionStatusRequest } from '../models/types';

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
  async createSubmission(
    authorId: string,
    submissionData: CreateSubmissionRequest,
    manuscriptFile?: Express.Multer.File
  ): Promise<Submission> {
    // Validate author exists
    const author = await this.userRepository.findById(authorId);
    if (!author) {
      throw new Error('Author not found');
    }

    // Validate author role
    if (author.role !== 'author' && author.role !== 'admin') {
      throw new Error('Only authors can submit manuscripts');
    }

    // Upload manuscript file if provided
    let manuscriptUrl = '';
    if (manuscriptFile) {
      // Validate file first
      const validation = FileService.validateFile(manuscriptFile);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file');
      }

      const uploadResult = await FileService.uploadPDF(
        manuscriptFile.buffer,
        manuscriptFile.originalname,
        'manuscripts'
      );
      manuscriptUrl = uploadResult.secureUrl;
    }

    // Create submission
    const submission: Omit<Submission, 'id' | 'updated_at'> = {
      title: submissionData.title.trim(),
      abstract: submissionData.abstract.trim(),
      keywords: submissionData.keywords.map(k => k.trim()),
      author_id: authorId,
      co_authors: submissionData.co_authors.map(ca => ca.trim()),
      status: 'submitted',
      manuscript_url: manuscriptUrl,
      editor_comments: undefined,
      submitted_at: new Date()
    };

    return await this.submissionRepository.create(submission);
  }

  /**
   * Get submission by ID with author validation
   */
  async getSubmissionById(submissionId: string, userId: string, userRole: string): Promise<Submission | null> {
    const submission = await this.submissionRepository.findById(submissionId);
    
    if (!submission) {
      return null;
    }

    // Authors can only see their own submissions
    if (userRole === 'author' && submission.author_id !== userId) {
      throw new Error('Access denied: You can only view your own submissions');
    }

    return submission;
  }

  /**
   * Get submissions by author
   */
  async getSubmissionsByAuthor(authorId: string): Promise<Submission[]> {
    return await this.submissionRepository.findByAuthor(authorId);
  }

  /**
   * Get all submissions (admin/editor only)
   */
  async getAllSubmissions(userRole: string): Promise<any[]> {
    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new Error('Access denied: Only admins and editors can view all submissions');
    }

    return await this.submissionRepository.findWithAuthorDetails();
  }

  /**
   * Update submission status (admin/editor only)
   */
  async updateSubmissionStatus(
    submissionId: string,
    statusUpdate: UpdateSubmissionStatusRequest,
    userId: string,
    userRole: string
  ): Promise<Submission | null> {
    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new Error('Access denied: Only admins and editors can update submission status');
    }

    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    return await this.submissionRepository.updateStatus(
      submissionId,
      statusUpdate.status,
      statusUpdate.editor_comments
    );
  }

  /**
   * Update submission manuscript (author only, when revisions required)
   */
  async updateSubmissionManuscript(
    submissionId: string,
    authorId: string,
    manuscriptFile: Express.Multer.File
  ): Promise<Submission | null> {
    const submission = await this.submissionRepository.findById(submissionId);
    
    if (!submission) {
      throw new Error('Submission not found');
    }

    if (submission.author_id !== authorId) {
      throw new Error('Access denied: You can only update your own submissions');
    }

    if (submission.status !== 'revisions_required') {
      throw new Error('Manuscript can only be updated when revisions are required');
    }

    // Validate file first
    const validation = FileService.validateFile(manuscriptFile);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid file');
    }

    // Upload new manuscript file
    const uploadResult = await FileService.uploadPDF(
      manuscriptFile.buffer,
      manuscriptFile.originalname,
      'manuscripts'
    );
    
    // Update submission with new manuscript URL and reset status
    const updatedSubmission = await this.submissionRepository.update(submissionId, {
      manuscript_url: uploadResult.secureUrl,
      status: 'under_review',
      updated_at: new Date()
    });

    return updatedSubmission;
  }

  /**
   * Get submission statistics (admin/editor only)
   */
  async getSubmissionStatistics(userRole: string): Promise<Record<string, number>> {
    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new Error('Access denied: Only admins and editors can view statistics');
    }

    return await this.submissionRepository.getSubmissionStats();
  }

  /**
   * Search submissions (admin/editor only)
   */
  async searchSubmissions(searchTerm: string, userRole: string): Promise<Submission[]> {
    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new Error('Access denied: Only admins and editors can search submissions');
    }

    return await this.submissionRepository.search(searchTerm);
  }

  /**
   * Get submissions pending review (admin/editor only)
   */
  async getSubmissionsPendingReview(userRole: string): Promise<Submission[]> {
    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new Error('Access denied: Only admins and editors can view pending reviews');
    }

    return await this.submissionRepository.findPendingReview();
  }

  /**
   * Validate submission data
   */
  validateSubmissionData(data: CreateSubmissionRequest): string[] {
    const errors: string[] = [];

    // Title validation
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.trim().length > 200) {
      errors.push('Title must be 200 characters or less');
    }

    // Abstract validation
    if (!data.abstract || data.abstract.trim().length === 0) {
      errors.push('Abstract is required');
    } else {
      const wordCount = data.abstract.trim().split(/\s+/).length;
      if (wordCount > 500) {
        errors.push('Abstract must be 500 words or less');
      }
    }

    // Keywords validation
    if (!data.keywords || data.keywords.length < 3) {
      errors.push('At least 3 keywords are required');
    } else if (data.keywords.length > 10) {
      errors.push('Maximum 10 keywords allowed');
    }

    // Co-authors validation (optional but if provided, should be valid)
    if (data.co_authors) {
      data.co_authors.forEach((coAuthor, index) => {
        if (coAuthor.trim().length === 0) {
          errors.push(`Co-author ${index + 1} cannot be empty`);
        }
      });
    }

    return errors;
  }
}