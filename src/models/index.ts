// Export all data models and repositories
export * from './types';
export { BaseRepository } from './BaseRepository';
export { UserRepository } from './UserRepository';
export { SubmissionRepository } from './SubmissionRepository';
export { ReviewRepository } from './ReviewRepository';
export { ArticleRepository } from './ArticleRepository';
export { VolumeRepository, IssueRepository } from './VolumeRepository';

// Import repository classes
import { UserRepository } from './UserRepository';
import { SubmissionRepository } from './SubmissionRepository';
import { ReviewRepository } from './ReviewRepository';
import { ArticleRepository } from './ArticleRepository';
import { VolumeRepository, IssueRepository } from './VolumeRepository';

// Create repository instances for easy import
export const userRepository = new UserRepository();
export const submissionRepository = new SubmissionRepository();
export const reviewRepository = new ReviewRepository();
export const articleRepository = new ArticleRepository();
export const volumeRepository = new VolumeRepository();
export const issueRepository = new IssueRepository();

// Repository factory for dependency injection
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  
  private constructor() {}
  
  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }
  
  getUserRepository(): UserRepository {
    return new UserRepository();
  }
  
  getSubmissionRepository(): SubmissionRepository {
    return new SubmissionRepository();
  }
  
  getReviewRepository(): ReviewRepository {
    return new ReviewRepository();
  }
  
  getArticleRepository(): ArticleRepository {
    return new ArticleRepository();
  }
  
  getVolumeRepository(): VolumeRepository {
    return new VolumeRepository();
  }
  
  getIssueRepository(): IssueRepository {
    return new IssueRepository();
  }
}