'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';

import { useToast } from '@/components/ui/Toast';

function messageForAuthError(code: string): string {
  switch (code) {
    case 'Verification':
      return 'Sign-in link expired. Request a new one.';
    case 'OAuthAccountNotLinked':
      return 'This email is already linked to another sign-in method.';
    case 'AccessDenied':
      return 'Access denied. Contact support if you think this is a mistake.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

function SignInForm() {
  const params = useSearchParams();
  const toast = useToast();
  const callbackUrl = params.get('callbackUrl') ?? '/dashboard';
  const checkEmail = params.get('check') === 'email';
  const error = params.get('error');

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await signIn('email', { email, callbackUrl });
    } catch {
      toast.error('Connection issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
        <h2 className="text-lg font-semibold text-zinc-900">Check your inbox</h2>
        <p className="mt-2 text-sm text-zinc-600">
          We sent a sign-in link to your email. The link expires in 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <form onSubmit={handleEmail} className="space-y-3">
        <label htmlFor="email" className="block text-sm font-medium text-zinc-900">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
        <p className="text-xs text-zinc-500">
          Don&apos;t have an account? Your free trial starts when you sign in.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
        >
          {submitting ? 'Sending link…' : 'Send magic link'}
        </button>
      </form>

      {error ? (
        <div
          role="alert"
          className={`mt-4 rounded-md p-3 text-sm ${
            error === 'Verification'
              ? 'bg-amber-50 text-amber-900'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {messageForAuthError(error)}
        </div>
      ) : null}
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
            <span className="text-lg font-bold">CR</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">
            Welcome to Client Reporting Engine
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Automate your agency&apos;s client reporting
          </p>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-white" />}>
          <SignInForm />
        </Suspense>

        <ul className="mt-6 space-y-2 text-xs text-zinc-600">
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            No credit card required for free tier
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            3 clients included
          </li>
          <li className="flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            Upgrade anytime
          </li>
        </ul>

        <p className="mt-6 text-center text-xs text-zinc-500">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
