import nodemailer from 'nodemailer';
import config from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (config.emailUser && config.emailPassword) {
      this.transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        secure: config.emailPort === 465,
        auth: {
          user: config.emailUser,
          pass: config.emailPassword,
        },
      });
    }
  }

  private async send(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️  Email not configured. Would have sent:', options.subject, 'to', options.to);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `"Pan-African Journal" <${config.emailFrom}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      console.log(`📧 Email sent: "${options.subject}" to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  }

  async sendWelcome(email: string, firstName: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Welcome to Pan-African Journal of Social Work and Social Policy',
      html: `
        <h2>Welcome, ${firstName}!</h2>
        <p>Thank you for registering with the Pan-African Journal of Social Work and Social Policy.</p>
        <p>You can now submit manuscripts, track their progress, and access published articles.</p>
        <p><a href="${config.frontendUrl}/login">Login to your account</a></p>
      `,
    });
  }

  async sendSubmissionConfirmation(email: string, firstName: string, manuscriptTitle: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Manuscript Received: ${manuscriptTitle}`,
      html: `
        <h2>Manuscript Submission Confirmed</h2>
        <p>Dear ${firstName},</p>
        <p>We have received your manuscript: <strong>${manuscriptTitle}</strong></p>
        <p>Our editorial team will review your submission and assign reviewers. You will be notified of any updates.</p>
        <p><a href="${config.frontendUrl}/author">Track your submission</a></p>
      `,
    });
  }

  async sendStatusUpdate(email: string, firstName: string, manuscriptTitle: string, status: string, comments?: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Manuscript Update: ${manuscriptTitle}`,
      html: `
        <h2>Manuscript Status Update</h2>
        <p>Dear ${firstName},</p>
        <p>Your manuscript <strong>${manuscriptTitle}</strong> status has been updated to: <strong>${status.replace(/_/g, ' ').toUpperCase()}</strong></p>
        ${comments ? `<p><strong>Editorial Comments:</strong></p><p>${comments}</p>` : ''}
        <p><a href="${config.frontendUrl}/author">View details</a></p>
      `,
    });
  }

  async sendReviewAssignment(email: string, reviewerName: string, manuscriptTitle: string, dueDate: Date): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Review Assignment: ${manuscriptTitle}`,
      html: `
        <h2>New Review Assignment</h2>
        <p>Dear ${reviewerName},</p>
        <p>You have been assigned to review the manuscript: <strong>${manuscriptTitle}</strong></p>
        <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><a href="${config.frontendUrl}/reviewer">Go to your reviewer dashboard</a></p>
      `,
    });
  }

  async sendReviewCompleted(email: string, authorName: string, manuscriptTitle: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Review Completed: ${manuscriptTitle}`,
      html: `
        <h2>Review Completed</h2>
        <p>Dear ${authorName},</p>
        <p>A review has been completed for your manuscript: <strong>${manuscriptTitle}</strong></p>
        <p>The editor will make a decision based on the reviews received.</p>
        <p><a href="${config.frontendUrl}/author">View status</a></p>
      `,
    });
  }

  async sendArticlePublished(email: string, authorName: string, articleTitle: string, articleSlug: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Published: ${articleTitle}`,
      html: `
        <h2>Congratulations! Your Article is Published</h2>
        <p>Dear ${authorName},</p>
        <p>Your article <strong>${articleTitle}</strong> has been published in the Pan-African Journal of Social Work and Social Policy.</p>
        <p><a href="${config.frontendUrl}/articles/${articleSlug}">View published article</a></p>
      `,
    });
  }
}

export default new EmailService();
