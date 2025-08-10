import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { emailConfig, EMAIL_SUBJECTS, EMAIL_TEMPLATES, TEMPLATE_PATH } from '../config/email';
import { registerHandlebarsHelpers } from './helpers/handlebarsHelpers';

// Create a transporter with the email configuration
const transporter = nodemailer.createTransport(emailConfig);

// Register Handlebars helpers
registerHandlebarsHelpers();

// Template directory
const TEMPLATE_DIR = TEMPLATE_PATH;

// Email template rendering function
const renderEmailTemplate = async (templateName: string, data: Record<string, any>) => {
  const templatePath = path.join(TEMPLATE_DIR, `${templateName}.hbs`);
  
  // Ensure template exists
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template "${templateName}" not found`);
  }

  // Read and compile template
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateContent);
  
  // Render with data
  return template(data);
};

/**
 * Send an email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param templateName - Name of the template to use (without .hbs extension)
 * @param templateData - Data to render in the template
 * @param attachments - Optional file attachments
 * @returns Promise that resolves with nodemailer info object
 */
export const sendEmail = async (
  to: string | string[],
  subject: string,
  templateName: string,
  templateData: Record<string, any>,
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>
) => {
  try {
    // Render HTML content from template
    const html = await renderEmailTemplate(templateName, templateData);
    
    // Configure mail options
    const mailOptions = {
      from: emailConfig.from,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      html,
      attachments
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Send a welcome email to newly registered users
 * @param to - User email address
 * @param name - User's full name
 * @param role - User's role
 */
export const sendWelcomeEmail = async (
  to: string,
  name: string,
  role: string
) => {
  const subject = EMAIL_SUBJECTS.WELCOME;
  const templateData = { name, role };
  return sendEmail(to, subject, EMAIL_TEMPLATES.WELCOME, templateData);
};

/**
 * Send a notification when a submission status changes
 * @param to - User email address
 * @param name - User's full name
 * @param submissionTitle - Title of the submission
 * @param newStatus - New status of the submission
 * @param comments - Optional comments from editor/reviewer
 */
export const sendSubmissionStatusEmail = async (
  to: string,
  name: string,
  submissionTitle: string,
  newStatus: string,
  comments?: string
) => {
  const subject = EMAIL_SUBJECTS.SUBMISSION_STATUS;
  const templateData = { name, submissionTitle, newStatus, comments };
  return sendEmail(to, subject, EMAIL_TEMPLATES.SUBMISSION_STATUS, templateData);
};

/**
 * Send a notification to a reviewer when they are assigned to review a submission
 * @param to - Reviewer's email address
 * @param reviewerName - Reviewer's full name
 * @param submissionTitle - Title of the submission
 * @param dueDate - Due date for the review
 */
export const sendReviewAssignmentEmail = async (
  to: string,
  reviewerName: string,
  submissionTitle: string,
  dueDate: Date
) => {
  const subject = EMAIL_SUBJECTS.REVIEW_ASSIGNMENT;
  const templateData = { 
    reviewerName, 
    submissionTitle, 
    dueDate: dueDate.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }) 
  };
  return sendEmail(to, subject, EMAIL_TEMPLATES.REVIEW_ASSIGNMENT, templateData);
};

/**
 * Send a reminder to a reviewer about an upcoming review due date
 * @param to - Reviewer's email address
 * @param reviewerName - Reviewer's full name
 * @param submissionTitle - Title of the submission
 * @param dueDate - Due date for the review
 */
export const sendReviewReminderEmail = async (
  to: string,
  reviewerName: string,
  submissionTitle: string,
  dueDate: Date
) => {
  const subject = EMAIL_SUBJECTS.REVIEW_REMINDER;
  const templateData = { 
    reviewerName, 
    submissionTitle, 
    dueDate: dueDate.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }) 
  };
  return sendEmail(to, subject, EMAIL_TEMPLATES.REVIEW_REMINDER, templateData);
};

/**
 * Send a notification to an author when a review is completed
 * @param to - Author's email address
 * @param authorName - Author's full name
 * @param submissionTitle - Title of the submission
 */
export const sendReviewCompletedEmail = async (
  to: string,
  authorName: string,
  submissionTitle: string
) => {
  const subject = EMAIL_SUBJECTS.REVIEW_COMPLETED;
  const templateData = { authorName, submissionTitle };
  return sendEmail(to, subject, EMAIL_TEMPLATES.REVIEW_COMPLETED, templateData);
};

/**
 * Send a notification when an article is published
 * @param to - Author's email address
 * @param authorName - Author's full name
 * @param articleTitle - Title of the article
 * @param volumeInfo - Volume and issue information
 * @param articleUrl - URL to access the published article
 * @param publicationDate - Date of publication (optional, defaults to current date)
 */
export const sendArticlePublishedEmail = async (
  to: string,
  authorName: string,
  articleTitle: string,
  volumeInfo: string,
  articleUrl: string,
  publicationDate?: Date
) => {
  const subject = EMAIL_SUBJECTS.ARTICLE_PUBLISHED;
  const formattedDate = (publicationDate || new Date()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const templateData = { 
    authorName, 
    articleTitle, 
    volumeInfo, 
    articleUrl,
    publicationDate: formattedDate
  };
  return sendEmail(to, subject, EMAIL_TEMPLATES.ARTICLE_PUBLISHED, templateData);
};

/**
 * Send a newsletter to subscribers
 * @param to - Array of subscriber email addresses
 * @param subject - Newsletter subject
 * @param content - Newsletter main content
 * @param featured - Featured articles information
 */
export const sendNewsletterEmail = async (
  to: string[],
  subject: string,
  content: string,
  featured: Array<{
    title: string;
    description: string;
    url: string;
  }>
) => {
  const templateData = { content, featured };
  return sendEmail(to, subject, EMAIL_TEMPLATES.NEWSLETTER, templateData);
};

/**
 * Send password reset email
 * @param to - User's email address
 * @param name - User's name
 * @param resetToken - Password reset token
 * @param resetUrl - URL with reset token
 */
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetToken: string,
  resetUrl: string
) => {
  const subject = EMAIL_SUBJECTS.PASSWORD_RESET;
  const templateData = { name, resetToken, resetUrl };
  return sendEmail(to, subject, EMAIL_TEMPLATES.PASSWORD_RESET, templateData);
};

// Verify email connection during app startup
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service failed to initialize:', error);
    return false;
  }
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendSubmissionStatusEmail,
  sendReviewAssignmentEmail,
  sendReviewReminderEmail,
  sendReviewCompletedEmail,
  sendArticlePublishedEmail,
  sendNewsletterEmail,
  sendPasswordResetEmail,
  verifyEmailConnection
};
