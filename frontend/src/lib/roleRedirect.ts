import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export function getRoleBasedRedirect(role: string): string {
  switch (role?.toLowerCase()) {
    case 'admin':
      return '/admin';
    case 'editor':
      return '/admin'; // Editors use admin dashboard
    case 'reviewer':
      return '/reviewer/dashboard';
    case 'author':
      return '/author';
    default:
      return '/'; // Fallback to homepage
  }
}

export function redirectToRoleDashboard(user: User, router: AppRouterInstance): void {
  const redirectPath = getRoleBasedRedirect(user.role);
  console.log(`Redirecting user ${user.email} with role ${user.role} to ${redirectPath}`);
  router.push(redirectPath);
}
