# Authentication System Documentation

## Overview

The Africa Journal platform implements a comprehensive JWT-based authentication system with role-based access control (RBAC). The system supports user registration, login, token refresh, and protected routes with different permission levels.

## Features

- **JWT Authentication**: Stateless authentication using JSON Web Tokens
- **Role-Based Access Control**: Support for Author, Reviewer, Editor, and Admin roles
- **Password Security**: Bcrypt hashing with salt rounds
- **Token Refresh**: Automatic token renewal for seamless user experience
- **Input Validation**: Comprehensive validation using Zod schemas
- **Protected Routes**: Middleware for securing API endpoints

## API Endpoints

### Public Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "affiliation": "University of Example",
  "role": "author" // optional, defaults to "author"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "affiliation": "University of Example",
      "role": "author",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token"
  }
}
```

#### POST /api/auth/login
Authenticate user credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as registration response.

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:** Same as login response with new tokens.

### Protected Endpoints

#### GET /api/auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "affiliation": "University of Example",
      "role": "author",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /api/auth/validate
Validate current access token.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### POST /api/auth/logout
Logout user (client-side token removal).

**Headers:**
```
Authorization: Bearer <access_token>
```

## Middleware Usage

### Authentication Middleware

```typescript
import { authenticate } from '../middleware/auth';

// Protect a route
router.get('/protected', authenticate, (req, res) => {
  // req.user contains the decoded JWT payload
  res.json({ user: req.user });
});
```

### Role-Based Authorization

```typescript
import { authorize, adminOnly, editorOrAdmin } from '../middleware/auth';

// Admin only
router.get('/admin-only', authenticate, adminOnly, handler);

// Editor or Admin
router.get('/editor-content', authenticate, editorOrAdmin, handler);

// Custom roles
router.get('/custom', authenticate, authorize('reviewer', 'editor'), handler);
```

### Resource Ownership

```typescript
import { requireOwnership } from '../middleware/auth';

// Users can only access their own resources
router.get('/users/:userId/submissions', 
  authenticate, 
  requireOwnership('userId'), 
  handler
);
```

## Frontend Integration

### AuthProvider Setup

```tsx
import { AuthProvider } from '@/components/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <YourAppComponents />
    </AuthProvider>
  );
}
```

### Using Authentication Hook

```tsx
import { useAuth } from '@/components/AuthProvider';

function LoginComponent() {
  const { login, isLoading, user } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  return (
    // Your login form
  );
}
```

### Protected Routes

```tsx
import { ProtectedRoute, withAdminAuth } from '@/components/ProtectedRoute';

// Component-level protection
function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminContent />
    </ProtectedRoute>
  );
}

// HOC protection
const AdminOnlyComponent = withAdminAuth(MyComponent);
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Security
- Access tokens expire in 24 hours (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens include issuer and audience claims
- Secure JWT secret keys required

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Error Handling

The authentication system provides detailed error responses:

- **400 Bad Request**: Validation errors with field-specific messages
- **401 Unauthorized**: Authentication failures
- **403 Forbidden**: Authorization failures (insufficient permissions)
- **409 Conflict**: User already exists during registration
- **500 Internal Server Error**: Server-side errors

## Testing

Run authentication tests:

```bash
npm test -- --testPathPattern="jwt|password|Auth"
```

The test suite covers:
- JWT token generation and validation
- Password hashing and comparison
- API endpoint validation
- Authentication middleware
- Role-based access control

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** on the client (consider httpOnly cookies for enhanced security)
3. **Implement token refresh** to maintain user sessions
4. **Validate tokens on every request** to protected endpoints
5. **Use role-based access control** to limit user permissions
6. **Log authentication events** for security monitoring
7. **Implement rate limiting** to prevent brute force attacks