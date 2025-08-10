# Requirements Document

## Introduction

The Africa Journal of Social Work and Social Policy platform is a comprehensive scholarly publishing system designed to host and manage a peer-reviewed academic journal. The platform will serve the East Africa Social Work Regional Resource Centre (EASWRRC) by providing a digital space for African scholars to publish research, promote Indigenous African knowledge systems, and facilitate decolonial social work methodologies. The system will support the complete scholarly publishing workflow from manuscript submission through peer review to publication and dissemination.

## Requirements

### Requirement 1: Public Content Access and Discovery

**User Story:** As a researcher or academic, I want to browse and access published articles, so that I can discover relevant scholarship and download research materials.

#### Acceptance Criteria

1. WHEN a user visits the homepage THEN the system SHALL display the journal introduction, latest issue highlights, and quick navigation links
2. WHEN a user navigates to the About section THEN the system SHALL display the journal mission, editorial board information, and partner institutions
3. WHEN a user views current and past issues THEN the system SHALL provide filtering by volume/issue and display articles with title, author(s), abstract, and download links
4. WHEN a user clicks on an article THEN the system SHALL display the full abstract, complete metadata, and provide PDF download functionality
5. WHEN a user accesses any public page THEN the system SHALL be fully responsive and accessible on mobile devices

### Requirement 2: Author Manuscript Management

**User Story:** As an academic author, I want to submit manuscripts and track their progress through the review process, so that I can publish my research and respond to editorial feedback.

#### Acceptance Criteria

1. WHEN an author registers for an account THEN the system SHALL create a secure profile using JWT authentication
2. WHEN an author submits a manuscript THEN the system SHALL accept PDF uploads up to 10MB with required metadata forms
3. WHEN an author views their dashboard THEN the system SHALL display submission status (Under Review, Revisions Required, Accepted, Rejected)
4. WHEN revisions are requested THEN the system SHALL allow authors to upload revised versions and view editor messages
5. WHEN any submission activity occurs THEN the system SHALL timestamp all actions for audit trails

### Requirement 3: Peer Review Management

**User Story:** As a peer reviewer, I want to access assigned manuscripts and submit my reviews, so that I can contribute to the scholarly evaluation process.

#### Acceptance Criteria

1. WHEN a reviewer registers THEN the system SHALL create a reviewer account with appropriate permissions
2. WHEN a reviewer logs in THEN the system SHALL display all assigned manuscript submissions
3. WHEN a reviewer accesses a manuscript THEN the system SHALL provide secure download functionality for review materials
4. WHEN a reviewer completes their evaluation THEN the system SHALL accept comments and recommendation decisions
5. WHEN a review is submitted THEN the system SHALL timestamp the submission and notify relevant parties

### Requirement 4: Editorial and Administrative Control

**User Story:** As an editor or administrator, I want to manage the entire publication workflow, so that I can oversee submissions, coordinate reviews, and publish completed issues.

#### Acceptance Criteria

1. WHEN an admin accesses the dashboard THEN the system SHALL provide comprehensive user management for authors, reviewers, and editors
2. WHEN managing submissions THEN the system SHALL display manuscript details, current status, and review assignments
3. WHEN assigning reviewers THEN the system SHALL allow editors to select and notify appropriate reviewers
4. WHEN making editorial decisions THEN the system SHALL enable status changes (Accept, Revise, Reject) with notification capabilities
5. WHEN publishing articles THEN the system SHALL allow assignment to specific issues/volumes and make content publicly available

### Requirement 5: Content Management and Communication

**User Story:** As an editor, I want to manage journal announcements and calls for papers, so that I can communicate with the academic community and attract quality submissions.

#### Acceptance Criteria

1. WHEN creating news content THEN the system SHALL provide blog-style posting capabilities for activities, conferences, and announcements
2. WHEN managing calls for papers THEN the system SHALL display guidelines, topics, deadlines, and submission links
3. WHEN users need contact information THEN the system SHALL provide contact forms and email information
4. WHEN content is published THEN the system SHALL ensure all public-facing content is accessible and mobile-responsive
5. WHEN managing content THEN the system SHALL maintain version control and publication timestamps

### Requirement 6: Security and Data Management

**User Story:** As a system administrator, I want to ensure secure access and reliable data storage, so that user information and scholarly content are protected and accessible.

#### Acceptance Criteria

1. WHEN users authenticate THEN the system SHALL use JWT tokens for secure session management
2. WHEN files are uploaded THEN the system SHALL store PDFs securely using cloud storage (Cloudinary or AWS S3)
3. WHEN data is stored THEN the system SHALL use PostgreSQL or MongoDB for reliable data persistence
4. WHEN users access the system THEN the system SHALL enforce role-based permissions (Public, Author, Reviewer, Admin)
5. WHEN any system activity occurs THEN the system SHALL maintain comprehensive audit logs with timestamps

### Requirement 7: System Performance and Scalability

**User Story:** As any user of the platform, I want fast, reliable access to the journal system, so that I can efficiently complete my academic work without technical barriers.

#### Acceptance Criteria

1. WHEN the system is deployed THEN the frontend SHALL be hosted on Vercel for optimal performance
2. WHEN backend services are accessed THEN the API SHALL be deployed on Render, Heroku, or Railway for reliability
3. WHEN database operations occur THEN the system SHALL use hosted database services (MongoDB Atlas or equivalent)
4. WHEN users upload files THEN the system SHALL enforce a 10MB size limit for PDF submissions
5. WHEN the platform scales THEN the system SHALL maintain responsive performance across all user roles and functions