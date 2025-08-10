'use client';

import React, { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { User } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: User['role'][];
  fallback?: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallback,
  redirectTo = '/login',
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // In a real app, you'd use Next.js router to redirect
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access this page.
            </p>
            <a
              href={redirectTo}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
              <br />
              Required roles: {allowedRoles.join(', ')}
              <br />
              Your role: {user.role}
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

// Higher-order component for role-based protection
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: User['role'][]
) => {
  const AuthenticatedComponent: React.FC<P> = (props) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
};

// Specific role-based HOCs
export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, ['admin']);

export const withEditorAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, ['editor', 'admin']);

export const withReviewerAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, ['reviewer', 'editor', 'admin']);

export const withAuthorAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, ['author', 'reviewer', 'editor', 'admin']);