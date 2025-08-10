import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Email Configuration
export const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'apikey',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  from: process.env.EMAIL_FROM || 'noreply@africajournal.org',
};

// Email Constants
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  SUBMISSION_STATUS: 'submission-status',
  REVIEW_ASSIGNMENT: 'review-assignment',
  REVIEW_REMINDER: 'review-reminder',
  REVIEW_COMPLETED: 'review-completed',
  ARTICLE_PUBLISHED: 'article-published',
  NEWSLETTER: 'newsletter',
  PASSWORD_RESET: 'password-reset',
};

// Email Subject Lines
export const EMAIL_SUBJECTS = {
  WELCOME: 'Welcome to the Africa Journal of Social Work and Social Policy',
  SUBMISSION_STATUS: 'Update on Your Submission',
  REVIEW_ASSIGNMENT: 'New Review Assignment',
  REVIEW_REMINDER: 'Reminder: Review Due Soon',
  REVIEW_COMPLETED: 'Review Completed for Your Submission',
  ARTICLE_PUBLISHED: 'Your Article Has Been Published',
  PASSWORD_RESET: 'Reset Your Password',
};

// Email retry configuration
export const EMAIL_RETRY = {
  attempts: 3,
  delay: 30000, // 30 seconds
};

// Email template path
export const TEMPLATE_PATH = `${__dirname}/../services/templates`;
