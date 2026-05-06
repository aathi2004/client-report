import Link from 'next/link';

import { MarketingHeader } from '@/components/layout/MarketingHeader';

export const metadata = {
  title: 'Terms of Service · Client Reporting Engine',
  description: 'The agreement that governs your use of Client Reporting Engine.',
};

const SUPPORT_EMAIL = 'aathithya594@gmail.com';

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: May 6, 2026</p>

        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This is a starting template. Have a lawyer review it before relying on it for production
          use.
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-zinc-700">
          <Section id="agreement" title="1. Agreement">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of
              Client Reporting Engine (the &ldquo;Service&rdquo;) operated by Aathithya S
              (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or using the Service,
              you agree to these Terms. If you do not agree, do not use the Service.
            </p>
          </Section>

          <Section id="eligibility" title="2. Eligibility and account">
            <p>
              You must be at least 16 years old and able to form a binding contract in your
              jurisdiction. You are responsible for keeping your account credentials secure and
              for all activity that occurs under your account.
            </p>
          </Section>

          <Section id="service" title="3. The Service">
            <p>
              Client Reporting Engine provides tools to connect data sources, generate
              white-labeled PDF reports, and deliver them to your clients on a recurring
              schedule. We may add, change, or remove features at any time. We will give
              reasonable notice of material changes that disadvantage paying customers.
            </p>
          </Section>

          <Section id="subscription" title="4. Subscription terms">
            <p>
              The Service is offered on Free, Pro ($49/month), and Business ($99/month) plans.
              Paid plans are billed monthly via Stripe in U.S. dollars and renew automatically
              until canceled.
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                <strong className="font-medium text-zinc-900">Auto-renewal</strong> — your plan
                renews at the end of each billing period unless canceled before the renewal
                date.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Cancellation</strong> — you can
                cancel any time from your account settings via the Stripe customer portal.
                Cancellation takes effect at the end of the current billing period; you keep
                paid features until then.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Plan changes</strong> — upgrades
                take effect immediately and Stripe prorates the difference. Downgrades take
                effect at the next billing cycle.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Taxes</strong> — prices exclude
                applicable taxes, which Stripe may add at checkout.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Failed payments</strong> — if a
                payment fails, Stripe will retry. If retries fail, your subscription may be
                downgraded to Free until the issue is resolved.
              </li>
            </ul>
          </Section>

          <Section id="refunds" title="5. Refund policy">
            <p>
              All paid charges are non-refundable except as required by law. If you believe you
              were charged in error or experienced a serious service issue, email{' '}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                {SUPPORT_EMAIL}
              </a>{' '}
              within 30 days of the charge and we will review the request in good faith.
            </p>
            <p className="mt-3">
              You can cancel any time to avoid future charges. We do not offer prorated refunds
              for the unused portion of a billing period.
            </p>
          </Section>

          <Section id="usage-limits" title="6. Usage limits and acceptable use">
            <p>Each plan includes the following limits:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>
                <strong className="font-medium text-zinc-900">Free</strong> — up to 3 clients
                and 10 reports per month.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Pro</strong> — up to 20 clients
                and unlimited reports, with scheduled reports and custom branding.
              </li>
              <li>
                <strong className="font-medium text-zinc-900">Business</strong> — unlimited
                clients and reports, plus API access and full white-label.
              </li>
            </ul>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-2 list-disc space-y-2 pl-6">
              <li>Reverse engineer, decompile, or attempt to extract the source of the Service.</li>
              <li>
                Use the Service to send spam, phishing emails, or content that violates the
                rights of others or applicable law.
              </li>
              <li>
                Share your account credentials with parties outside your agency or resell access
                without our written permission.
              </li>
              <li>
                Stress-test the platform, attempt to bypass rate limits, or access another
                user&apos;s data.
              </li>
            </ul>
          </Section>

          <Section id="content" title="7. Your data and content">
            <p>
              You retain ownership of the data you upload, the credentials you authorize, and
              the reports you generate (your &ldquo;Content&rdquo;). You grant us a limited
              license to host, transmit, and process your Content solely to operate the Service
              for you.
            </p>
            <p className="mt-3">
              You are responsible for ensuring you have the rights to connect the data sources
              and to send reports to the recipients you configure.
            </p>
          </Section>

          <Section id="ip" title="8. Our intellectual property">
            <p>
              The Service, our brand, and the underlying code remain our property. Nothing in
              these Terms grants you any right to use our trademarks without our written consent.
            </p>
          </Section>

          <Section id="disclaimers" title="9. Disclaimers">
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. We
              disclaim all warranties to the maximum extent permitted by law, including any
              implied warranty of merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
            <p className="mt-3">
              We do not guarantee that the Service will be uninterrupted, error-free, or that
              report data will always be complete or accurate — third-party platforms (Google,
              Meta, etc.) occasionally throttle or change their APIs, which can affect output.
            </p>
          </Section>

          <Section id="liability" title="10. Limitation of liability">
            <p>
              To the maximum extent permitted by law, our total liability for any claim arising
              out of or relating to the Service is limited to the amount you paid us in the 12
              months before the event giving rise to the claim. We are not liable for indirect,
              incidental, consequential, or punitive damages, or for lost profits or revenue.
            </p>
          </Section>

          <Section id="termination" title="11. Termination">
            <p>
              You can stop using the Service and cancel your subscription at any time. We may
              suspend or terminate your access if you breach these Terms, fail to pay, or use
              the Service in a way that creates legal or operational risk for us. On
              termination, we will retain or delete your data as described in our Privacy
              Policy.
            </p>
          </Section>

          <Section id="changes" title="12. Changes to these Terms">
            <p>
              We may update these Terms from time to time. Material changes will be announced by
              email or in-app notice at least 14 days before they take effect. Continued use of
              the Service after the effective date constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section id="governing-law" title="13. Governing law">
            <p>
              These Terms are governed by the laws of India, without regard to conflict-of-laws
              principles. Any dispute will be resolved in the courts of competent jurisdiction
              in India.
            </p>
          </Section>

          <Section id="contact" title="14. Contact">
            <p>
              Questions about these Terms? Email{' '}
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
          <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-700">
            Privacy Policy
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
