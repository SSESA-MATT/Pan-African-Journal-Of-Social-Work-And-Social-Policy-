import { SubmissionService } from '../SubmissionService';
import { CreateSubmissionRequest } from '../../models/types';

describe('SubmissionService', () => {
  let submissionService: SubmissionService;

  beforeEach(() => {
    submissionService = new SubmissionService();
  });

  describe('validateSubmissionData', () => {
    it('should return no errors for valid submission data', () => {
      const validData: CreateSubmissionRequest = {
        title: 'Valid Title',
        abstract: 'This is a valid abstract with enough words to meet the minimum requirements for testing purposes.',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        co_authors: ['Dr. Jane Smith', 'Prof. John Doe']
      };

      const errors = submissionService.validateSubmissionData(validData);
      expect(errors).toHaveLength(0);
    });

    it('should return error for missing title', () => {
      const invalidData: CreateSubmissionRequest = {
        title: '',
        abstract: 'Valid abstract with enough words.',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        co_authors: []
      };

      const errors = submissionService.validateSubmissionData(invalidData);
      expect(errors).toContain('Title is required');
    });

    it('should return error for title too long', () => {
      const longTitle = 'a'.repeat(201);
      const invalidData: CreateSubmissionRequest = {
        title: longTitle,
        abstract: 'Valid abstract with enough words.',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        co_authors: []
      };

      const errors = submissionService.validateSubmissionData(invalidData);
      expect(errors).toContain('Title must be 200 characters or less');
    });

    it('should return error for missing abstract', () => {
      const invalidData: CreateSubmissionRequest = {
        title: 'Valid Title',
        abstract: '',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        co_authors: []
      };

      const errors = submissionService.validateSubmissionData(invalidData);
      expect(errors).toContain('Abstract is required');
    });

    it('should return error for abstract too long', () => {
      const longAbstract = 'word '.repeat(501); // 501 words
      const invalidData: CreateSubmissionRequest = {
        title: 'Valid Title',
        abstract: longAbstract,
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        co_authors: []
      };

      const errors = submissionService.validateSubmissionData(invalidData);
      expect(errors).toContain('Abstract must be 500 words or less');
    });

    it('should return error for insufficient keywords', () => {
      const invalidData: CreateSubmissionRequest = {
        title: 'Valid Title',
        abstract: 'Valid abstract with enough words.',
        keywords: ['keyword1', 'keyword2'], // Only 2 keywords
        co_authors: []
      };

      const errors = submissionService.validateSubmissionData(invalidData);
      expect(errors).toContain('At least 3 keywords are required');
    });

    it('should return error for too many keywords', () => {
      const invalidData: CreateSubmissionRequest = {
        title: 'Valid Title',
        abstract: 'Valid abstract with enough words.',
        keywords: Array.from({ length: 11 }, (_, i) => `keyword${i + 1}`), // 11 keywords
        co_authors: []
      };

      const errors = submissionService.validateSubmissionData(invalidData);
      expect(errors).toContain('Maximum 10 keywords allowed');
    });

    it('should return error for empty co-author names', () => {
      const invalidData: CreateSubmissionRequest = {
        title: 'Valid Title',
        abstract: 'Valid abstract with enough words.',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        co_authors: ['Dr. Jane Smith', '', 'Prof. John Doe'] // Empty co-author
      };

      const errors = submissionService.validateSubmissionData(invalidData);
      expect(errors).toContain('Co-author 2 cannot be empty');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidData: CreateSubmissionRequest = {
        title: '',
        abstract: '',
        keywords: ['keyword1'], // Only 1 keyword
        co_authors: []
      };

      const errors = submissionService.validateSubmissionData(invalidData);
      expect(errors).toContain('Title is required');
      expect(errors).toContain('Abstract is required');
      expect(errors).toContain('At least 3 keywords are required');
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});