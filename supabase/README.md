# Journal Enhancement Phase 1 - Database Migrations

This directory contains the database migrations and utilities for the Journal Enhancement Phase 1 project.

## Migration Files

### 1. Schema Migration (`20241027000001_journal_enhancements_schema.sql`)
Creates the enhanced database schema including:
- **DOI Management**: `dois` table for DOI registration and tracking
- **Article Metrics**: `article_metrics` and `article_metric_events` for analytics
- **Editorial Calendar**: `editorial_events` for workflow management
- **Search Analytics**: `search_analytics` for query performance tracking
- **Normalized Data**: `article_keywords` and `article_authors` for enhanced search
- **Citation Tracking**: `citation_exports` for download analytics
- **Recommendations**: `related_articles` for article relationships

### 2. Search Functions (`20241027000002_search_functions.sql`)
Implements advanced search functionality:
- **Author Suggestions**: Autocomplete for author names
- **Keyword Suggestions**: Autocomplete for keywords
- **Faceted Search**: Dynamic filtering with counts
- **Advanced Search**: Multi-field search with ranking
- **Analytics Tracking**: Search query performance monitoring
- **Metrics Functions**: Article view/download tracking

## Utility Files

### Seed Data (`seed.sql`)
Provides sample data for testing:
- Sample articles with comprehensive metadata
- DOI registrations
- Article metrics and events
- Editorial calendar events
- Search analytics history
- Citation export records
- Related article relationships

### Backup & Restore (`backup_restore_procedures.sql`)
Database maintenance utilities:
- **Backup Creation**: `create_journal_backup()`
- **Integrity Validation**: `validate_database_integrity()`
- **Cleanup Operations**: `cleanup_orphaned_records()`
- **Analytics Reset**: `reset_search_analytics()`
- **Metadata Regeneration**: `regenerate_article_metadata()`
- **Statistics**: `get_database_statistics()`

## Running Migrations

### Using Supabase CLI
```bash
# Apply migrations
supabase db push

# Reset database (development only)
supabase db reset

# Apply seed data
supabase db seed
```

### Manual Application
```sql
-- 1. Apply schema migration
\i supabase/migrations/20241027000001_journal_enhancements_schema.sql

-- 2. Apply search functions
\i supabase/migrations/20241027000002_search_functions.sql

-- 3. Load seed data (optional)
\i supabase/seed.sql

-- 4. Load backup procedures
\i supabase/backup_restore_procedures.sql
```

## Validation

After running migrations, validate the setup:

```sql
-- Check database statistics
SELECT get_database_statistics();

-- Validate integrity
SELECT validate_database_integrity();

-- Test search functionality
SELECT * FROM search_articles_advanced('social work', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5, 0);

-- Test faceted search
SELECT get_search_facets('community', NULL, NULL, NULL, NULL);
```

## Key Features

### Enhanced Search
- Full-text search with PostgreSQL's tsvector
- Multi-field filtering (author, keywords, date, type, language)
- Faceted navigation with dynamic counts
- Search result ranking by relevance
- Autocomplete suggestions for authors and keywords

### Analytics & Metrics
- Real-time article view/download tracking
- Geographic distribution of readers
- Search query analytics and performance monitoring
- Citation export tracking
- Editorial workflow analytics

### DOI Management
- Automatic DOI generation following academic standards
- CrossRef integration support
- DOI registration status tracking
- Metadata management for external systems

### Editorial Workflow
- Calendar-based event management
- Deadline tracking and notifications
- Submission and review workflow integration
- Priority-based task management

## Performance Considerations

### Indexes Created
- GIN indexes for full-text search on title and abstract
- Composite indexes for common filter combinations
- JSONB indexes for authors and keywords arrays
- Date-based indexes for temporal queries

### Optimization Features
- Efficient facet counting with filtered queries
- Cached search suggestions
- Incremental metrics updates
- Background analytics processing

## Data Validation

The migration includes several data validation features:
- Check constraints for enum values
- Foreign key relationships with cascade deletes
- JSONB validation for array fields
- Automatic metadata population triggers

## Rollback Procedures

To rollback migrations (development only):

```sql
-- Drop enhancement tables
DROP TABLE IF EXISTS related_articles CASCADE;
DROP TABLE IF EXISTS citation_exports CASCADE;
DROP TABLE IF EXISTS article_authors CASCADE;
DROP TABLE IF EXISTS article_keywords CASCADE;
DROP TABLE IF EXISTS search_analytics CASCADE;
DROP TABLE IF EXISTS editorial_events CASCADE;
DROP TABLE IF EXISTS article_metric_events CASCADE;
DROP TABLE IF EXISTS article_metrics CASCADE;
DROP TABLE IF EXISTS dois CASCADE;

-- Remove added columns from articles
ALTER TABLE articles DROP COLUMN IF EXISTS article_type;
ALTER TABLE articles DROP COLUMN IF EXISTS language_code;
ALTER TABLE articles DROP COLUMN IF EXISTS pdf_url;
ALTER TABLE articles DROP COLUMN IF EXISTS issue_id;
ALTER TABLE articles DROP COLUMN IF EXISTS volume_id;
ALTER TABLE articles DROP COLUMN IF EXISTS created_at;
ALTER TABLE articles DROP COLUMN IF EXISTS updated_at;

-- Drop functions
DROP FUNCTION IF EXISTS search_articles_advanced CASCADE;
DROP FUNCTION IF EXISTS get_search_facets CASCADE;
DROP FUNCTION IF EXISTS get_author_suggestions CASCADE;
DROP FUNCTION IF EXISTS get_keyword_suggestions CASCADE;
DROP FUNCTION IF EXISTS jsonb_to_text_array CASCADE;
DROP FUNCTION IF EXISTS generate_doi CASCADE;
DROP FUNCTION IF EXISTS populate_article_metadata CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

## Support

For issues with migrations or database setup:
1. Check the validation functions output
2. Review the PostgreSQL logs for errors
3. Ensure all required extensions are installed
4. Verify table relationships and constraints
5. Run integrity validation after any manual changes