import { PrismaAdapter } from '@auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { redirect } from 'next/navigation';
import nodemailer from 'nodemailer';

import { prisma } from '@/lib/prisma';
import { trackEvent } from '@/lib/analytics';

const smtpTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.EMAIL_SERVER_PORT ?? 465),
  secure: Number(process.env.EMAIL_SERVER_PORT ?? 465) === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER ?? '',
    pass: process.env.EMAIL_SERVER_PASSWORD ?? '',
  },
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/signin?check=email',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const from = process.env.EMAIL_FROM ?? 'no-reply@example.com';
        try {
          await smtpTransporter.sendMail({
            from,
            to: email,
            subject: 'Sign in to Client Reporting',
            text: `Sign in: ${url}\n\nIf you didn't request this, you can ignore it.`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
                <h1 style="font-size: 20px; margin-bottom: 16px;">Sign in to Client Reporting</h1>
                <p style="color: #555; line-height: 1.5;">Click the button below to sign in. This link expires in 24 hours.</p>
                <a href="${url}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">Sign in</a>
                <p style="color: #999; font-size: 12px; margin-top: 32px;">If you didn't request this email, you can safely ignore it.</p>
              </div>
            `,
          });
        } catch (error) {
          console.error('[auth] SMTP send failed', {
            to: email,
            from,
            host: process.env.EMAIL_SERVER_HOST,
            error: error instanceof Error ? error.message : String(error),
          });
          throw new Error(
            `SMTP send failed: ${error instanceof Error ? error.message : 'unknown error'}`,
          );
        }
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      await trackEvent('signup', {
        userId: user.id ?? null,
        email: user.email ?? null,
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in `user` is set; fetch fresh DB user so token has id + tier.
      const email = user?.email ?? token.email;
      if (email && (!token.id || user)) {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, subscriptionTier: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.subscriptionTier = dbUser.subscriptionTier;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.subscriptionTier = token.subscriptionTier;
      }
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/signin');
  }
  return user;
}
