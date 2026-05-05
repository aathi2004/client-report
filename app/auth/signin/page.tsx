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
