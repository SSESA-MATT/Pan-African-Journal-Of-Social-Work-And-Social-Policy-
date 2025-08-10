# Database Setup Guide

This document explains how to set up and manage the PostgreSQL database for the Africa Journal platform.

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js and npm installed
- Environment variables configured (see `.env.example`)

## Database Schema

The database consists of the following main tables:

### Core Tables

1. **users** - User accounts (authors, reviewers, editors, admins)
2. **volumes** - Journal volumes (yearly collections)
3. **issues** - Journal issues (within volumes)
4. **submissions** - Manuscript submissions from authors
5. **reviews** - Peer reviews of submissions
6. **articles** - Published articles (from accepted submissions)

### Relationships

- Users can create multiple submissions (1:many)
- Users can write multiple reviews (1:many)
- Submissions can have multiple reviews (1:many)
- Volumes contain multiple issues (1:many)
- Issues contain multiple articles (1:many)
- Submissions become articles when published (1:1)

## Setup Instructions

### 1. Database Creation

First, create a PostgreSQL database:

```sql
CREATE DATABASE africa_journal;
CREATE USER africa_journal_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE africa_journal TO africa_journal_user;
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update the database configuration:

```bash
cp .env.example .env
```

Update the database settings in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=africa_journal
DB_USER=africa_journal_user
DB_PASSWORD=your_password
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Initialize Database

Run the complete database setup (migrations + seed data):

```bash
npm run db:setup
```

This will:
- Create all database tables with proper indexes
- Set up foreign key relationships
- Insert sample data for testing

## Available Scripts

### Database Management

- `npm run db:migrate` - Run database migrations only
- `npm run db:seed` - Insert seed data only
- `npm run db:reset` - Clear all data and re-seed
- `npm run db:init` - Run migrations and seed (without the setup script)
- `npm run db:setup` - Complete database initialization with detailed output

### Development

- `npm run dev` - Start development server with auto-reload
- `npm test` - Run all tests
- `npm run build` - Build for production

## Sample Data

The seed script creates the following test accounts:

### Admin Account
- **Email:** admin@africajournal.org
- **Password:** admin123
- **Role:** admin

### Editor Account
- **Email:** editor@africajournal.org
- **Password:** editor123
- **Role:** editor

### Author Accounts
- **Email:** author1@university.ac.ke
- **Password:** author123
- **Role:** author

- **Email:** author2@university.ac.tz
- **Password:** author123
- **Role:** author

### Reviewer Accounts
- **Email:** reviewer1@university.ac.ug
- **Password:** reviewer123
- **Role:** reviewer

- **Email:** reviewer2@university.ac.rw
- **Password:** reviewer123
- **Role:** reviewer

## Database Structure

### Key Features

1. **UUID Primary Keys** - All tables use UUID for better security and scalability
2. **JSONB Fields** - Keywords, co-authors, and authors stored as JSONB for flexibility
3. **Enum Constraints** - User roles, submission status, and review recommendations are constrained
4. **Automatic Timestamps** - Created/updated timestamps with automatic triggers
5. **Proper Indexing** - Optimized indexes for common queries
6. **Foreign Key Constraints** - Data integrity enforced at database level

### Data Types

- **User Roles:** `author`, `reviewer`, `editor`, `admin`
- **Submission Status:** `submitted`, `under_review`, `revisions_required`, `accepted`, `rejected`
- **Review Recommendations:** `accept`, `minor_revisions`, `major_revisions`, `reject`

## Repository Pattern

The application uses a repository pattern for data access:

- **BaseRepository** - Common CRUD operations
- **UserRepository** - User-specific queries
- **SubmissionRepository** - Submission management
- **ReviewRepository** - Review operations
- **ArticleRepository** - Published article queries
- **VolumeRepository** - Volume and issue management

## Migration System

The migration system tracks database schema changes:

- Migrations are stored in `src/database/migrations/`
- Each migration has a unique ID and timestamp
- Migrations are executed in order and tracked in the `migrations` table
- Failed migrations are rolled back automatically

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running
   - Check connection parameters in `.env`
   - Verify database and user exist

2. **Permission Denied**
   - Ensure database user has proper privileges
   - Check password in `.env` file

3. **Migration Failures**
   - Check PostgreSQL logs for detailed errors
   - Ensure database is empty before first migration
   - Verify UUID extension is available

### Reset Database

If you need to completely reset the database:

```bash
# Drop and recreate database
psql -c "DROP DATABASE IF EXISTS africa_journal;"
psql -c "CREATE DATABASE africa_journal;"

# Re-run setup
npm run db:setup
```

## Production Considerations

1. **Environment Variables** - Use secure, unique passwords
2. **Connection Pooling** - Configured for 20 max connections
3. **Backup Strategy** - Implement regular database backups
4. **Monitoring** - Set up database performance monitoring
5. **SSL** - Enable SSL connections in production
6. **Migrations** - Test migrations on staging before production

## Support

For database-related issues:

1. Check the application logs
2. Review PostgreSQL logs
3. Verify environment configuration
4. Test database connectivity
5. Check migration status