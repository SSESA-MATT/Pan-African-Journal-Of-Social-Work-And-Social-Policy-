# Security Setup Guide

## Introduction

This guide explains how to set up and test the security features implemented in Task 14 of the Africa Journal Platform project.

## Installation Steps

1. **Install required dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Update the environment variables**:

   Copy any missing variables from below to your `.env` file:

   ```plaintext
   # Rate Limiting with Redis (optional)
   REDIS_URL=redis://localhost:6379

   # Security Settings
   NODE_ENV=development  # Change to 'production' in production
   ```

3. **Run the security migrations**:

   ```bash
   npm run security:migrate
   ```

This will create the necessary database tables for audit logging.

## Testing Security Features

### 1. Rate Limiting

Test rate limiting by making multiple requests in quick succession:

```bash
# Use a bash script to test rate limiting
for i in {1..150}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com", "password":"Test1234!"}' 
  echo "" 
  sleep 0.1
done
```

You should see "Too Many Requests" responses after the limit is reached.

### 2. Input Validation

Test input validation by submitting invalid data:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email", "password":"short", "first_name":"A", "last_name":"B", "affiliation":"C"}'
```

You should receive validation error messages in the response.

### 3. XSS Protection

Test XSS protection by submitting script tags in data:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"Test1234!", "first_name":"<script>alert(1)</script>", "last_name":"Test", "affiliation":"Test"}'
```

The script tags should be escaped or removed in any responses.

### 4. Audit Logging

To verify audit logging is working:

1. Perform various actions in the application
2. Check the database logs:

   ```sql
   SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;
   ```

3. Check the file logs (if database logging fails):

   ```bash
   cat logs/access.log
   cat logs/info.log
   cat logs/error.log
   ```

### 5. Security Headers

Verify security headers are being set:

```bash
curl -I http://localhost:5000/health
```

You should see various security headers in the response.

## Troubleshooting

### Redis Connection Issues

If you encounter Redis connection issues and don't need Redis for development:

1. Redis is optional for rate limiting
2. Without Redis, rate limiting will use in-memory storage
3. Set `REDIS_URL=''` in your `.env` file to disable Redis connection attempts

### CSRF Token Errors

If you get CSRF token errors when testing with a frontend:

1. Ensure cookies are being properly sent (check CORS settings)
2. For testing, you can temporarily disable CSRF by commenting out the CSRF middleware in `server.ts`
3. Make sure your frontend includes the CSRF token from cookies in your requests

### Rate Limit Too Restrictive

If rate limits are too restrictive for development:

1. Edit `src/middleware/rateLimit.ts` to increase the limits
2. Remember to revert before production

## Security Checklist

Before deploying to production:

- [ ] Set NODE_ENV to 'production'
- [ ] Ensure all CSRF protections are enabled
- [ ] Set up secure, HttpOnly cookies
- [ ] Configure proper CORS settings for your domains
- [ ] Set up Redis for distributed rate limiting
- [ ] Review and tighten CSP headers
- [ ] Ensure audit logging is working correctly
- [ ] Set up log rotation for file-based logs
