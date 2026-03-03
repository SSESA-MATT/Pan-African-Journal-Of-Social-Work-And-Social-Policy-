'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { tokenStorage } from '@/lib/storage';
import { authApi } from '@/lib/api-client';
import { User } from '@/types/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');
    const error = searchParams.get('error');

    if (error) {
      const messages: Record<string, string> = {
        github_no_email: 'Your GitHub account does not have a public email. Please add a verified email to your GitHub account and try again.',
        account_deactivated: 'Your account has been deactivated. Please contact support.',
        github_oauth_failed: 'GitHub sign-in failed. Please try again.',
      };
      const msg = messages[error] || 'Authentication failed. Please try again.';
      router.replace(`/login?error=${encodeURIComponent(msg)}`);
      return;
    }

    if (token && refreshToken) {
      tokenStorage.setAccessToken(token);
      tokenStorage.setRefreshToken(refreshToken);

      authApi
        .getProfile()
        .then((data: { user: User }) => {
          tokenStorage.setUser(data.user);
          router.replace('/');
        })
        .catch(() => {
          tokenStorage.clearAuth();
          router.replace('/login?error=Authentication+failed.+Please+try+again.');
        });
    } else {
      router.replace('/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <svg
            className="animate-spin h-8 w-8 text-accent-green"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="text-neutral-600">Completing sign in…</p>
      </div>
    </div>
  );
}
