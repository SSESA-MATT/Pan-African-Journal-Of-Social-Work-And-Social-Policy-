import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import * as emailConfig from '../../config/email';

// Import the email service functions
import EmailService, { 
  sendEmail, 
  sendWelcomeEmail, 
  sendSubmissionStatusEmail,
  sendReviewAssignmentEmail,
  verifyEmailConnection
} from '../EmailService';

// Mock nodemailer
const mockSendMail = jest.fn().mockImplementation(() => {
  return Promise.resolve({ messageId: 'mock-message-id' });
});

const mockVerify = jest.fn().mockImplementation(() => {
  return Promise.resolve(true);
});

const mockTransport = {
  sendMail: mockSendMail,
  verify: mockVerify
};

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue(mockTransport)
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue('Hello {{name}}!')
}));

// Mock handlebars helpers
jest.mock('../helpers/handlebarsHelpers', () => ({
  registerHandlebarsHelpers: jest.fn()
}));

// Mock email config
jest.mock('../../config/email', () => ({
  emailConfig: {
    host: 'test.smtp.server',
    port: 587,
    secure: false,
    auth: {
      user: 'test-user',
      pass: 'test-pass'
    },
    from: 'test@example.com'
  },
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    SUBMISSION_STATUS: 'submission-status',
    REVIEW_ASSIGNMENT: 'review-assignment',
    REVIEW_REMINDER: 'review-reminder',
    REVIEW_COMPLETED: 'review-completed',
    ARTICLE_PUBLISHED: 'article-published',
    NEWSLETTER: 'newsletter',
    PASSWORD_RESET: 'password-reset'
  },
  EMAIL_SUBJECTS: {
    WELCOME: 'Welcome to the Test Journal',
    SUBMISSION_STATUS: 'Update on Your Submission',
    REVIEW_ASSIGNMENT: 'New Review Assignment',
    REVIEW_REMINDER: 'Review Due Soon',
    REVIEW_COMPLETED: 'Review Completed',
    ARTICLE_PUBLISHED: 'Article Published',
    PASSWORD_RESET: 'Password Reset'
  },
  TEMPLATE_PATH: '/mock/path/to/templates'
}));

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const templateName = 'test-template';
      const templateData = { name: 'Test User' };

      const result = await sendEmail(to, subject, templateName, templateData);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalled();
      
      const mockTransport = nodemailer.createTransport();
      expect(mockTransport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@example.com',
          to: 'test@example.com',
          subject: 'Test Subject'
        })
      );
      
      expect(result).toEqual({ messageId: 'mock-message-id' });
    });

    it('should handle multiple recipients', async () => {
      const to = ['test1@example.com', 'test2@example.com'];
      const subject = 'Test Subject';
      const templateName = 'test-template';
      const templateData = { name: 'Test User' };

      const result = await sendEmail(to, subject, templateName, templateData);

      const mockTransport = nodemailer.createTransport();
      expect(mockTransport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test1@example.com,test2@example.com',
          subject: 'Test Subject'
        })
      );
      expect(result).toEqual({ messageId: 'mock-message-id' });
    });

    it('should throw an error if template does not exist', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
      
      const to = 'test@example.com';
      const subject = 'Test Subject';
      const templateName = 'non-existent-template';
      const templateData = { name: 'Test User' };

      await expect(sendEmail(to, subject, templateName, templateData))
        .rejects
        .toThrow('Email template "non-existent-template" not found');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send a welcome email', async () => {
      await sendWelcomeEmail('test@example.com', 'Test User', 'Author');

      const mockTransport = nodemailer.createTransport();
      expect(mockTransport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: emailConfig.EMAIL_SUBJECTS.WELCOME
        })
      );
    });
  });

  describe('sendSubmissionStatusEmail', () => {
    it('should send a submission status update email', async () => {
      await sendSubmissionStatusEmail(
        'test@example.com',
        'Test User',
        'Test Submission',
        'Under Review'
      );

      const mockTransport = nodemailer.createTransport();
      expect(mockTransport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: emailConfig.EMAIL_SUBJECTS.SUBMISSION_STATUS
        })
      );
    });
  });

  describe('sendReviewAssignmentEmail', () => {
    it('should send a review assignment email', async () => {
      const dueDate = new Date('2023-12-31');
      await sendReviewAssignmentEmail(
        'reviewer@example.com',
        'Test Reviewer',
        'Test Submission',
        dueDate
      );

      const mockTransport = nodemailer.createTransport();
      expect(mockTransport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'reviewer@example.com',
          subject: emailConfig.EMAIL_SUBJECTS.REVIEW_ASSIGNMENT
        })
      );
    });
  });

  describe('verifyEmailConnection', () => {
    it('should verify email connection successfully', async () => {
      const result = await verifyEmailConnection();
      expect(result).toBe(true);

      const mockTransport = nodemailer.createTransport();
      expect(mockTransport.verify).toHaveBeenCalled();
    });

    it('should return false when connection verification fails', async () => {
      const mockTransport = nodemailer.createTransport();
      
      // Override the mock implementation for this test only
      jest.spyOn(mockTransport, 'verify').mockImplementationOnce(() => {
        return Promise.reject(new Error('Connection failed'));
      });
      
      const result = await verifyEmailConnection();
      expect(result).toBe(false);
    });
  });
});
