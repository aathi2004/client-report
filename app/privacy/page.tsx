import Link from 'next/link';

import { MarketingHeader } from '@/components/layout/MarketingHeader';

export const metadata = {
  title: 'Privacy Policy · Client Reporting Engine',
  description: 'How Client Reporting Engine collects, uses, and protects data.',
};

const SUPPORT_EMAIL = 'aathithya594@gmail.com';

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: May 6, 2026</p>

        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This is a starting template. Have a lawyer review it before relying on it for production
          use.
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-zinc-700">
          <Section id="intro" title="1. Introduction">
            <p>
              Client Reporting Engine (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides automated
              client reporting tools for marketing agencies. This Privacy Policy explains what
              information we collect, how we use it, and the choices you have.
            </p>
            <p>
              By using our service, you agree to the practices described here. If you do not
              agree, please do not use the service.
            </p>
          </Section>

          <Section id="information-we-collect" title="2. Information we collect">
            <p>We collect the following categories of information:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                <strong className="font-medium text-zinc-900">Account information</strong> — your
                name, email, and authentication tokens. We use passwordless magic-link sign-in.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Workspace data</strong> — agency
                branding, clients you create, and data sources you connect (Google Ads, Meta Ads,
                GA4, Instagram Insights). For each connected source we store OAuth credentials
                you authorize.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Reports and metrics</strong> —
                generated PDF reports, the metrics fetched from your connected sources, and
                delivery records (recipients, send timestamps).
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Payment information</strong> —
                handled directly by Stripe. We never see or store full card numbers; we only
                store Stripe customer and subscription identifiers.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Usage and device data</strong> —
                pages visited, IP address, browser, and device type, collected via Vercel
                Analytics and standard server logs.
              </li>
            </ul>
          </Section>

          <Section id="how-we-use" title="3. How we use information">
            <ul className="list-disc space-y-2 pl-6">
              <li>To operate the service: pull metrics, generate reports, and deliver them.</li>
              <li>To authenticate sign-in and keep your account secure.</li>
              <li>To process subscriptions, invoices, and refunds.</li>
              <li>To improve the product (e.g. understanding which features are used).</li>
              <li>To respond to support requests and send essential service emails.</li>
            </ul>
            <p className="mt-3">
              We do not sell your data, and we do not use your client data to train AI models.
            </p>
          </Section>

          <Section id="cookies" title="4. Cookies and tracking">
            <p>We use a small number of cookies and similar technologies:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                <strong className="font-medium text-zinc-900">Authentication cookies</strong> —
                set by NextAuth to keep you signed in. These are essential and cannot be
                disabled.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Analytics</strong> — we use Vercel
                Analytics to measure page views and key product events (sign-ups, report
                generations, plan upgrades). It is privacy-friendly and does not use third-party
                cookies.
              </li>
            </ul>
            <p className="mt-3">
              You can clear cookies any time via your browser settings. Clearing the
              authentication cookie will sign you out.
            </p>
          </Section>

          <Section id="third-parties" title="5. Third-party sub-processors">
            <p>
              We rely on a small set of trusted vendors. Each acts as a processor under their
              standard data-protection terms.
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                <strong className="font-medium text-zinc-900">Stripe</strong> — payment
                processing for paid plans. Subject to Stripe&apos;s Privacy Policy.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Supabase</strong> — Postgres
                database hosting. Stores your account, workspace, and report metadata.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Resend</strong> — transactional
                email for sign-in magic links and report delivery.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Vercel</strong> — application
                hosting and analytics.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Connected platforms</strong> —
                Google Ads, Meta, Google Analytics 4, and Instagram only when you authorize them.
                We pull only what your report requires.
              </li>
            </ul>
          </Section>

          <Section id="data-retention" title="6. Data retention">
            <p>
              We keep your data while your account is active. If you delete a client, we cascade
              the deletion to its data sources and reports. If you delete your account, we
              remove your workspace data within 30 days, except where we are required to retain
              specific records (for example, billing records for tax purposes).
            </p>
          </Section>

          <Section id="your-rights" title="7. Your rights">
            <p>You can:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>Access, correct, or export your data at any time.</li>
              <li>Disconnect any data source from the data sources page.</li>
              <li>
                Delete your account by emailing{' '}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </li>
              <li>
                Object to certain processing or request restriction, where applicable under your
                local privacy law (GDPR, UK GDPR, CCPA).
              </li>
            </ul>
          </Section>

          <Section id="security" title="8. Security">
            <p>
              We use HTTPS in transit, encrypted credentials at rest, and standard security
              headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy). No system is
              perfectly secure — we will notify you without undue delay if we detect a breach
              affecting your data.
            </p>
          </Section>

          <Section id="international" title="9. International transfers">
            <p>
              Our infrastructure is operated by U.S.-based providers (Vercel, Supabase, Stripe,
              Resend). If you access the service from outside the U.S., your data may be
              transferred to and processed in the U.S. under standard contractual safeguards.
            </p>
          </Section>

          <Section id="children" title="10. Children">
            <p>
              The service is not intended for children under 16. We do not knowingly collect
              data from children. If you believe a child has provided us data, contact us and we
              will delete it.
            </p>
          </Section>

          <Section id="changes" title="11. Changes to this policy">
            <p>
              We may update this policy from time to time. Material changes will be announced by
              email or in-app notice at least 14 days before they take effect. The &ldquo;Last
              updated&rdquo; date above shows the current version.
            </p>
          </Section>

          <Section id="contact" title="12. Contact">
            <p>
              Questions about privacy or data handling? Email{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>

        <p className="mt-12 text-sm text-zinc-500">
          See also our{' '}
          <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-700">
            Terms of Service
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-2">
      <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
      {children}
    </section>
  );
}
