# Security Implementation Documentation

## Overview

The Africa Journal platform has implemented comprehensive security measures to protect user data, prevent common web vulnerabilities, and maintain a robust audit trail of system activities. This document outlines the security features implemented as part of Task 14.

## Key Security Features

### 1. Input Validation

All user inputs are validated using the Zod validation library to ensure data integrity and prevent injection attacks:

- **Request Body Validation**: All API endpoints validate request bodies against predefined schemas
- **Query Parameter Validation**: Search and filter parameters are validated to prevent injection attacks
- **Path Parameter Validation**: URL parameters (like IDs) are validated for correct format and type

### 2. Rate Limiting

Rate limiting has been implemented to prevent abuse and brute force attacks:

- **Global API Rate Limiting**: 100 requests per IP address per 15-minute window
- **Authentication Rate Limiting**: 10 login attempts per 30-minute window
- **Registration Rate Limiting**: 5 registration attempts per hour
- **Submission Rate Limiting**: 10 submissions per hour

Rate limits can be adjusted in `src/middleware/rateLimit.ts` and apply differently based on the environment:

- Rate limiting is bypassed in the test environment
- Redis-backed rate limiting is used in production when configured
- In-memory rate limiting is used as a fallback

### 3. Audit Logging

A comprehensive audit logging system tracks all significant actions in the system:

- **Database Storage**: All audit logs are stored in the `audit_logs` database table
- **File Fallback**: If database logging fails, logs are written to files in the `logs` directory
- **Log Levels**: INFO, WARN, and ERROR levels for different types of events
- **Logged Information**: Each log includes:
  - User ID (if authenticated)
  - IP address
  - User agent
  - Action performed
  - Request path and method
  - Timestamp

### 4. CSRF Protection

Cross-Site Request Forgery protection has been implemented:

- **CSRF Tokens**: Required for all state-changing operations
- **Cookie Configuration**: Secure, HttpOnly, and SameSite cookies in production
- **Token Verification**: Automatic verification of tokens on protected routes

### 5. Security Headers

Comprehensive HTTP security headers are set using Helmet:

- **Content Security Policy (CSP)**: Restricts resource loading to trusted sources
- **X-XSS-Protection**: Enables browser XSS filtering
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information
- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **Permission Policy**: Restricts browser features

### 6. Data Sanitization

Input and output sanitization to prevent XSS attacks:

- **Request Body Sanitization**: All incoming request bodies are sanitized
- **Query Parameter Sanitization**: All query parameters are sanitized
- **Response Sanitization**: All API responses are sanitized before sending

## Implementation Details

### Middleware Stack

The security middleware is applied in the following order:

1. Security Headers (Helmet)
2. CORS Configuration
3. Compression
4. Request Logging
5. Body/Query Parsing
6. Request Sanitization
7. Response Sanitization
8. Audit Logging
9. Rate Limiting
10. Route-specific validation and authentication

### Database Schema

The audit logging system uses the following database schema:

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10) NOT NULL,
  user_id UUID,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50) NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMP NOT NULL,
  path VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Configuration Options

Security settings can be adjusted through environment variables:

```env
# Rate Limiting Configuration
REDIS_URL=redis://localhost:6379        # Optional Redis URL for rate limiting
RATE_LIMIT_WINDOW_MS=900000             # 15 minutes default window
RATE_LIMIT_MAX_REQUESTS=100             # Default max requests per window

# Security Headers
NODE_ENV=production                     # Enables stricter security in production
```

## Best Practices for Developers

1. **Always validate inputs**: Use the provided validation middleware for all new endpoints
2. **Audit important actions**: Use the `auditAction` middleware for significant operations
3. **Sanitize custom responses**: If bypassing the regular response flow, use the `escapeHtml` helper
4. **Apply rate limiting**: Add appropriate rate limiting to new endpoints
5. **Test security features**: Ensure security features are tested when adding new functionality
6. **Review logs regularly**: Check audit logs for suspicious activity

## Security Testing

To verify the security implementations:

1. Run validation tests: `npm test -- --testPathPattern=validation`
2. Test rate limiting: Make rapid requests to see rate limiting in action
3. Check audit logs: Perform actions and verify they are logged in the database
4. Verify CSRF protection: Attempt to submit forms without valid CSRF tokens
5. Test sanitization: Submit content with script tags and verify they are sanitized

## Future Security Enhancements

Potential future security improvements:

1. Implement two-factor authentication
2. Add IP-based suspicious activity detection
3. Enhance password policies and implement password rotation
4. Add automated security vulnerability scanning
5. Implement a Web Application Firewall (WAF)
