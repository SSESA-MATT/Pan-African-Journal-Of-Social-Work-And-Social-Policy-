// Utility for role-based redirects after authentication
import { User } from '@/types/auth';

export function getRoleBasedRedirect(role: User['role']): string {
  switch (role) {
    case 'admin':
    case 'editor':
      return '/admin';
    case 'reviewer':
      return '/reviewer/dashboard';
    case 'author':
      return '/author';
    default:
      return '/';
  }
}

export function redirectToRoleDashboard(user: User | null, router: any): void {
  if (!user) {
    router.push('/login');
    return;
  }
  
  const dashboardPath = getRoleBasedRedirect(user.role);
  router.push(dashboardPath);
}
