import { UserRole } from '@/types/auth';

/**
 * Get the appropriate dashboard route based on user role
 */
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'editor':
      return '/admin'; // Editors can access admin dashboard
    case 'reviewer':
      return '/reviewer/dashboard';
    case 'author':
      return '/author';
    default:
      return '/'; // Default to homepage
  }
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'editor':
      return 'Editor';
    case 'reviewer':
      return 'Reviewer';
    case 'author':
      return 'Author';
    default:
      return 'User';
  }
}

/**
 * Check if a role has access to admin features
 */
export function hasAdminAccess(role: UserRole): boolean {
  return role === 'admin' || role === 'editor';
}

/**
 * Check if a role can review submissions
 */
export function canReview(role: UserRole): boolean {
  return role === 'reviewer' || role === 'editor' || role === 'admin';
}

/**
 * Check if a role can submit articles
 */
export function canSubmit(role: UserRole): boolean {
  return role === 'author' || role === 'admin';
}
