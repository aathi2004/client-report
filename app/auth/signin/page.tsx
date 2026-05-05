'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';

function SignInForm() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/dashboard';
  const checkEmail = params.get('check') === 'email';
  const error = params.get('error');

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    await signIn('email', { email, callbackUrl });
    setSubmitting(false);
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
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl })}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs uppercase tracking-wide text-zinc-500">or</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

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
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {submitting ? 'Sending link…' : 'Send magic link'}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error === 'OAuthAccountNotLinked'
            ? 'This email is already linked to another sign-in method.'
            : 'Something went wrong. Please try again.'}
        </p>
      ) : null}
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <span className="text-lg font-bold">CR</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-600">Sign in to your reporting workspace</p>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-white" />}>
          <SignInForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-zinc-500">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
