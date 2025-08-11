# Africa Journal of Social Work and Social Policy Platform

A comprehensive scholarly publishing platform designed to host and manage the Africa Journal of Social Work and Social Policy, promoting Indigenous African knowledge systems and decolonial social work methodologies.

## Project Structure

```plaintext
africa-journal-platform/
├── frontend/          # Next.js React application
├── backend/           # Express.js API server          
└── README.md
```

## Features

- **Public Access**: Browse and download published articles
- **Author Portal**: Submit manuscripts and track review progress
- **Reviewer System**: Peer review management
- **Editorial Dashboard**: Complete publication workflow management
- **Content Management**: News, announcements, and calls for papers

## Technology Stack

### Frontend

- **Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS with African-inspired color palette
- **UI Components**: Custom components with accessibility focus

### Backend

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **File Storage**: Cloud storage (S3/Cloudinary)
- **Email Notifications**: Nodemailer with Handlebars templates
- **Security**: Comprehensive security implementation (see Security section)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Set up environment variables:

   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. Set up the database:

   ```bash
   # Create PostgreSQL database
   # Run migrations (to be implemented)
   ```

5. Start development servers:

   ```bash
   npm run dev
   ```

This will start:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5000>

## Color Scheme

The platform uses an African-inspired color palette:

- **Primary Red**: #ef4444 - Representing strength and vitality
- **Secondary Green**: #22c55e - Symbolizing growth and prosperity  
- **Neutral Black**: #171717 - For text and emphasis
- **Clean White**: #ffffff - For backgrounds and contrast

## Email Notification System

The platform includes a comprehensive email notification system to keep users informed throughout the publication workflow:

- **Welcome Emails** - Sent when users register for an account
- **Submission Status Updates** - Notifications about changes to submission status
- **Review Assignments** - Alerts for reviewers about new assignments
- **Review Reminders** - Reminders about upcoming review deadlines
- **Publication Notifications** - Alerts when articles are published

To test the email system:

```bash
cd backend
npm run email:test
```

See `backend/src/docs/EMAIL_NOTIFICATION.md` for detailed documentation.

## Security Features

The platform implements a comprehensive security architecture to protect user data and ensure secure operations:

- **Rate Limiting** - Protection against brute force and DoS attacks
- **Audit Logging** - Tracking of all security-relevant events
- **Input Validation** - Strict validation and sanitization of all user inputs
- **Security Headers** - Comprehensive protection against common web vulnerabilities
- **CSRF Protection** - Prevention of cross-site request forgery attacks
- **XSS Protection** - Sanitization to prevent cross-site scripting
- **Authentication Security** - Secure JWT implementation with HttpOnly cookies
- **Authorization** - Role-based access control for all resources

See the following documentation for details:

- `backend/SECURITY.md` - Comprehensive security documentation
- `backend/src/docs/SECURITY_SETUP.md` - Setup and testing instructions
- `backend/src/docs/SECURITY_ARCHITECTURE.md` - Architecture overview

## Development

The project follows a structured development approach with:

- Requirements-driven development
- Comprehensive design documentation
- Task-based implementation plan
- Test-driven development practices
- Security-focused code reviews

## Contributing

This project is developed following the specifications in `.kiro/specs/africa-journal-platform/`.

## License

[License information to be added]

## Contact

For questions about this platform, please contact the East Africa Social Work Regional Resource Centre (EASWRRC).
