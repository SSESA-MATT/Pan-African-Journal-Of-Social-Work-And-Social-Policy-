# Email Notification System Documentation

## Overview

The Africa Journal platform implements a comprehensive email notification system to keep users informed about important events and actions in the publishing workflow. This includes notifications for registration, submission status changes, review assignments, review completions, and article publications.

## Features

- **Welcome Emails**: Sent when users register for an account
- **Submission Status Updates**: Notifies authors when their submission status changes
- **Review Assignments**: Alerts reviewers when they are assigned to review a submission
- **Review Reminders**: Sends reminders to reviewers about upcoming due dates
- **Review Completed Notifications**: Informs authors when a review of their submission is completed
- **Publication Notifications**: Notifies authors when their article is published
- **Newsletters**: Sends periodic updates to subscribers
- **Password Reset Emails**: Assists users in resetting their passwords

## Technology Stack

The email notification system uses the following technologies:

- **Nodemailer**: For sending emails
- **Handlebars**: For email template rendering
- **Cloudinary/S3**: For storing email attachments when needed

## Email Templates

All email templates are stored in the `src/services/templates` directory as Handlebars (`.hbs`) files:

- `welcome.hbs`: Welcome email for new users
- `submission-status.hbs`: Notification of submission status changes
- `review-assignment.hbs`: Assignment of review to a reviewer
- `review-reminder.hbs`: Reminder for pending reviews
- `review-completed.hbs`: Notification that a review has been completed
- `article-published.hbs`: Notification of article publication
- `newsletter.hbs`: Periodic newsletter
- `password-reset.hbs`: Password reset instructions

## Configuration

Email settings are configured through environment variables:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-api-key
EMAIL_FROM=noreply@africajournal.org
```

## Email Service API

### Core Functions

- `sendEmail(to, subject, templateName, templateData, attachments?)`: Base function for sending emails
- `verifyEmailConnection()`: Verifies SMTP connection during startup

### Notification Functions

- `sendWelcomeEmail(to, name, role)`: Sends welcome email to newly registered users
- `sendSubmissionStatusEmail(to, name, submissionTitle, newStatus, comments?)`: Notifies authors of submission status changes
- `sendReviewAssignmentEmail(to, reviewerName, submissionTitle, dueDate)`: Notifies reviewers of new assignments
- `sendReviewReminderEmail(to, reviewerName, submissionTitle, dueDate)`: Reminds reviewers of upcoming due dates
- `sendReviewCompletedEmail(to, authorName, submissionTitle)`: Notifies authors when a review is completed
- `sendArticlePublishedEmail(to, authorName, articleTitle, volumeInfo, articleUrl)`: Notifies authors when their article is published
- `sendNewsletterEmail(to, subject, content, featured)`: Sends newsletters to subscribers
- `sendPasswordResetEmail(to, name, resetToken, resetUrl)`: Sends password reset instructions

## Implementation

The email service is implemented in the `src/services/EmailService.ts` file and is used throughout the application to send notifications at appropriate times:

1. **Registration**: Called from `AuthController.register()`
2. **Review Assignment**: Called from `ReviewController.assignReviewer()`
3. **Review Completion**: Called from `ReviewController.createReview()`
4. **Submission Status Changes**: Called from `SubmissionController.updateStatus()`
5. **Article Publication**: Called from `ArticleController.publishArticle()`

## Error Handling

The email service includes comprehensive error handling to ensure that the application continues to function even if email delivery fails:

- All email sending functions are wrapped in try/catch blocks
- Errors are logged but do not interrupt the main application flow
- Failed email deliveries are logged for potential retry or manual follow-up

## Testing

Testing the email service can be done through:

1. Unit tests mocking the nodemailer transport
2. Manual testing using test email accounts
3. Integration tests that verify email templates render correctly

## Local Development

For local development:

1. Use a test SMTP server like Mailhog or Mailtrap
2. Configure environment variables with test SMTP settings
3. Send test emails to verify templates and functionality

## Production Considerations

In production:

1. Use a reliable email service provider (SendGrid, AWS SES, etc.)
2. Monitor email delivery rates and bounces
3. Implement retry logic for failed email deliveries
4. Consider email throttling to avoid rate limits
5. Regularly review email templates for clarity and branding consistency
