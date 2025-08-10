# Africa Journal Platform - Security Documentation

## Overview

This document outlines the security measures implemented in the Africa Journal Platform. These measures were designed to protect user data, prevent common web vulnerabilities, and ensure compliance with best security practices.

## Security Features Implemented

### 1. Rate Limiting

Rate limiting has been implemented to prevent abuse of the API endpoints. This protects against brute force attacks, denial-of-service attempts, and other forms of API abuse.

#### Rate Limiting Implementation

- Located in `src/middleware/rateLimit.ts`
- Tiered rate limiting structure:
  - General API endpoints: 100 requests per 15 minutes
  - Authentication endpoints: 10-20 requests per 15 minutes
  - Sensitive operations: 5 requests per hour
- Supports Redis for distributed environments
- Falls back to in-memory storage if Redis is not available

### 2. Audit Logging

A comprehensive audit logging system tracks all user activities for security monitoring and compliance.

#### Audit Logging Implementation

- Located in `src/utils/auditLogger.ts`
- Records:
  - User ID
  - Action performed
  - IP address
  - Timestamp
  - Request details
  - Success/failure status
- Logs are stored in both database and files
- Database schema includes the `audit_logs` table
- Query interface for security investigations

### 3. Input Validation and Sanitization

All user inputs are validated and sanitized to prevent injection attacks and ensure data integrity.

#### Validation Implementation

- Zod schemas for type-safe validation
- Located in `src/utils/validation.ts`
- Sanitization to remove potentially dangerous HTML and script content
- Strict validation for all forms and API endpoints

### 4. Security Headers

Security headers are set to protect against various web vulnerabilities.

#### Security Headers Implementation

- Located in `src/middleware/security.ts`
- Implements:
  - Content Security Policy (CSP)
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
  - Strict Transport Security (HSTS)
  - Referrer Policy
- Helmet.js integration for comprehensive header management

### 5. CSRF Protection

Cross-Site Request Forgery protection is implemented for all state-changing operations.

#### CSRF Implementation

- Located in `src/middleware/security.ts`
- Double-submit cookie pattern
- Automatic token generation and validation
- Token rotation for enhanced security

### 6. Secure Authentication

Secure authentication practices are implemented to protect user credentials and sessions.

#### Authentication Implementation

- Located in `src/services/AuthService.ts` and related files
- Features:
  - Password hashing with bcrypt
  - JWT with short expiration and refresh tokens
  - Secure, HTTP-only cookies
  - Account lockout after failed attempts
  - Password strength requirements

## Configuration

### Environment Variables

Important security-related environment variables:

```plaintext
# Rate Limiting
RATE_LIMIT_WINDOW=15  # Window in minutes
RATE_LIMIT_MAX=100    # Max requests per window
REDIS_URL=redis://localhost:6379  # Optional, for distributed rate limiting

# Security
NODE_ENV=production  # Always use 'production' in production environments
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRATION=15m  # Short-lived JWTs
REFRESH_TOKEN_EXPIRATION=7d
COOKIE_SECRET=your-secure-cookie-secret

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

## Security Best Practices

### In Production

1. **Always use HTTPS**
   - Never deploy without TLS/SSL
   - Consider using HSTS preload list

2. **Environment Variables**
   - Use a secure method to manage environment variables
   - Never commit secrets to version control

3. **Regular Updates**
   - Keep all dependencies updated
   - Run `npm audit` regularly to check for vulnerabilities

4. **Database Security**
   - Use least privilege database users
   - Enable database encryption

5. **Monitoring**
   - Set up alerts for suspicious activities
   - Review audit logs regularly

### For Developers

1. **Code Reviews**
   - Always have security-focused code reviews
   - Use static code analysis tools

2. **Security Testing**
   - Perform regular security testing
   - Consider OWASP ZAP or similar tools

3. **Authentication**
   - Never disable security features in production
   - Always validate tokens on the server

## Incident Response

In case of a security incident:

1. Isolate the affected systems
2. Assess the damage and identify the vulnerability
3. Fix the vulnerability
4. Restore secure operations
5. Document the incident and update security measures

## Security Migrations

Database migrations related to security features are available in:

- `src/database/migrations/`

To apply security migrations:

```bash
npm run security:migrate
```

## Testing Security Features

See the detailed testing instructions in `src/docs/SECURITY_SETUP.md`.
