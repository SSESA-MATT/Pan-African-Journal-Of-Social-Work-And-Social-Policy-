# 🔧 Supabase Authentication Configuration Fix

## 🚨 **Problem**: Email Confirmation Links Point to Localhost

When users register and receive email confirmation, the links point to `localhost:3000` which can't be reached when deployed.

## ✅ **Solution**: Update Supabase Authentication Settings

### **Step 1: Update Supabase Dashboard Configuration**

1. **Go to Supabase Dashboard**: <https://supabase.com/dashboard>
2. **Select your project**
3. **Navigate to**: Authentication → Settings → General
4. **Update these settings**:

#### **Site URL** (Main application URL)

```text
Production: https://your-vercel-app.vercel.app
Development: http://localhost:3000
```

#### **Redirect URLs** (Add all valid redirect URLs)

```text
https://your-vercel-app.vercel.app/auth/callback
https://your-vercel-app.vercel.app/auth/confirm
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
```

### **Step 2: Create Authentication Callback Pages**

You need to create callback pages to handle the confirmation redirects:

#### **Create `/frontend/src/app/auth/callback/page.tsx`**
```typescript
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/login?error=auth_error');
          return;
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // No session, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        router.push('/login?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Processing Authentication...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    </div>
  );
}
```

#### **Create `/frontend/src/app/auth/confirm/page.tsx`**
```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRun = useRef(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const confirmUser = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            console.error('Confirmation error:', error);
            setStatus('error');
            setMessage('Failed to confirm your account. Please try again or contact support.');
          } else {
            setStatus('success');
            setMessage('Your account has been confirmed successfully!');
            setTimeout(() => router.push('/login?confirmed=true'), 3000);
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link.');
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    };

    confirmUser();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && 'Confirming Your Account...'}
            {status === 'success' && 'Account Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>
        
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-green-600">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="mt-2">Redirecting to login page...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-red-600">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <button
              onClick={() => router.push('/register')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### **Step 3: Update Environment Variables**

Make sure your production environment variables are set correctly in Vercel:

```bash
# Production Environment Variables (in Vercel Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **Step 4: Update Email Templates (Optional)**

In Supabase Dashboard → Authentication → Email Templates, you can customize the email templates to use your domain:

- **Confirm signup**: Update the redirect URL to use your production domain
- **Magic Link**: Update for production use
- **Reset Password**: Update for production use

## 🎯 **Quick Fix for Immediate Testing**

If you want to test this quickly:

1. **Update Site URL** in Supabase to your Vercel URL
2. **Add your Vercel URL** to redirect URLs  
3. **Create the auth callback pages** above
4. **Redeploy** your application

## 🔍 **Verification Steps**

1. Register a new user
2. Check email for confirmation link
3. Click the link - should now redirect to your live site
4. Confirm account successfully
5. Login should work

This should fix the localhost redirect issue! 🚀
