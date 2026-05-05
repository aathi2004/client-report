# Client Reporting Engine

Automated client reporting for marketing agencies. Pull data from ad platforms and analytics, generate white-labeled PDF reports, schedule recurring delivery.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Postgres** via Prisma ORM (hosted on Supabase)
- **NextAuth** with email magic link + Google OAuth
- **Stripe** subscriptions (Free / Pro $49 / Business $99)
- **Supabase Storage** for client logos and PDF reports
- **Resend** for transactional + scheduled email
- **Google Ads API** integration via OAuth
- **`@react-pdf/renderer`** for PDF generation
- Tailwind v4

## Local development

```bash
npm install
cp .env.production.example .env  # then fill in development values (test-mode keys)
npx prisma db push                 # sync schema to your database
npm run dev
```

The app runs at `http://localhost:3000`.

For Stripe webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET
```

## Deployment to Vercel

### Pre-deployment checklist

Before clicking **Deploy** make sure you have:

- [ ] **Production database** — a Supabase project (or any Postgres) with the schema applied (`prisma db push` or `prisma migrate deploy`).
- [ ] **Domain ready** — either a custom domain or you'll use the `*.vercel.app` URL Vercel assigns.
- [ ] **Stripe Live mode enabled** — toggle off Test Mode in the Stripe Dashboard, recreate the Pro and Business prices, copy the `pk_live_...` / `sk_live_...` keys.
- [ ] **Resend domain verified** — add your sending domain at https://resend.com/domains and complete DNS records. Without this, only your Resend account email can receive sends.
- [ ] **Supabase Storage buckets** created and public:
  - `client-logos` (allowed types: `image/jpeg, image/png, image/webp`, size: 20 MB)
  - `reports` (allowed type: `application/pdf`, size: 20 MB)
- [ ] **Google OAuth credentials** updated to allow your production callback URLs:
  - Sign-in: `https://your-domain.com/api/auth/callback/google`
  - Google Ads: `https://your-domain.com/api/sources/google-ads/callback`
- [ ] **Production secrets generated** (do this in a terminal, not in chat):
  - `NEXTAUTH_SECRET` → `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - `DATA_SOURCE_ENCRYPTION_KEY` → `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - `CRON_SECRET` → `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`

### Deployment steps

1. **Push to a Git repo** (GitHub / GitLab / Bitbucket).
2. **Vercel → New Project → Import** the repo.
3. **Framework preset** auto-detects as Next.js. Leave the build command, output, and install command at defaults.
4. **Environment variables** — open `.env.production.example` and add every variable to **Settings → Environment Variables** (or use `vercel env add`). Apply to the **Production** environment (and **Preview** if you want previews to function fully). See the full list in the next section.
5. **Deploy**. The first build runs `npm install` (which triggers the `postinstall` → `prisma generate`) and then `next build`.
6. **Add a custom domain** under **Settings → Domains** if you have one. Once DNS propagates, update `NEXTAUTH_URL` to the canonical domain and redeploy.

### Required environment variables

The full list with comments lives in [`.env.production.example`](./.env.production.example). Grouped:

| Group | Variables |
| --- | --- |
| Database | `DATABASE_URL`, `DIRECT_URL` |
| Auth | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Email | `RESEND_API_KEY`, `EMAIL_FROM` |
| Stripe | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`, `STRIPE_WEBHOOK_SECRET` |
| Storage | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Google Ads | `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID` |
| Encryption | `DATA_SOURCE_ENCRYPTION_KEY` |
| Cron | `CRON_SECRET` |

### Post-deployment checklist

- [ ] **Sign-in works** — request a magic link, click it, land on `/dashboard`. If using Google, complete the consent flow.
- [ ] **Storage uploads work** — upload a client logo at `/clients`. Should appear immediately on the card.
- [ ] **Stripe Checkout works** — go to `/pricing`, click Upgrade, complete checkout with a real test card you don't mind charging (or a Stripe test card like `4242 4242 4242 4242` if you're still in test mode for now).
- [ ] **Stripe webhook is receiving events** — Stripe Dashboard → Webhooks → your endpoint → "Events" tab should show 2xx responses. Confirm `subscriptionTier` updates in the database after a test checkout.
- [ ] **PDF generation works end-to-end** — generate a report at `/reports/new`. The `reports` bucket should contain `<userId>/<reportId>.pdf`.
- [ ] **Email delivery works** — open the report and click "Email to client". Check the recipient inbox and the Resend logs.
- [ ] **Cron is registered** — Vercel Dashboard → Project → Settings → Cron Jobs should list `/api/cron/send-scheduled` running hourly. Manually trigger it from the dashboard to verify.
- [ ] **Google Ads connect succeeds** if you use it — connect for a client, complete OAuth, see the row appear under `/data-sources` with `Last sync: never` (will populate on next report generation).

### Switching Stripe to Live mode

1. Stripe Dashboard → top-right toggle, switch from **Test mode** to **Live mode**.
2. Recreate the Pro and Business products under **Products** (live-mode product IDs are different from test-mode).
3. Copy the new `price_...` IDs into `STRIPE_PRICE_PRO` and `STRIPE_PRICE_BUSINESS`.
4. **Developers → API keys** → copy `pk_live_...` and `sk_live_...` into the env vars (replacing the test keys).
5. **Developers → Webhooks → Add endpoint** for your production domain. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Copy the new signing secret into `STRIPE_WEBHOOK_SECRET`.
7. Redeploy.

### Verifying a domain in Resend

1. Resend → **Domains → Add domain** → enter the domain you want to send from (e.g. `your-domain.com`).
2. Add the printed DNS records (SPF, DKIM, return-path) to your DNS provider.
3. Wait for verification (usually a few minutes).
4. Update `EMAIL_FROM` to a sender on the verified domain (e.g. `reports@your-domain.com`).
5. Redeploy.

Until a domain is verified, Resend silently restricts delivery to the email tied to your Resend account.

### Production cron

`vercel.json` registers an hourly cron at `/api/cron/send-scheduled`. Vercel automatically sets `Authorization: Bearer ${CRON_SECRET}` on every cron request, and our route validates that header. As long as `CRON_SECRET` is set in production env vars, no extra config is needed.

You can manually fire the cron from **Vercel → Project → Cron Jobs → Run now**, or from a terminal:

```bash
curl -X POST https://your-domain.com/api/cron/send-scheduled \
  -H "Authorization: Bearer $CRON_SECRET"
```

Hourly is fine — schedules whose `nextScheduledAt` is in the future are skipped without doing work, so most invocations are no-ops.

> **Vercel plan note**: PDF generation and email send can take 30–60s for clients with many data sources. Vercel Hobby tier limits API routes to 60s; Pro tier allows up to 300s. The `vercel.json` here requests `maxDuration: 60` for report routes and `300` for the cron — these are upper bounds and only honored on Pro+.

## Security reminders

- **Rotate every secret pasted into chat or shared in plain text** before going live. That includes `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `DATA_SOURCE_ENCRYPTION_KEY`, `CRON_SECRET`, and any database password.
- **Never commit `.env`** — only `.env.production.example`. Confirm your `.gitignore` includes `.env*` (Next.js default does).
- **Don't expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.** It must remain a server-only env var; never prefix it with `NEXT_PUBLIC_`.
- **Review Stripe webhook events** for the first few real transactions to confirm tier updates land in the database.
- **Audit the `Authorized redirect URIs`** in Google Cloud Console after going live — remove any localhost entries you no longer need.
- **`DATA_SOURCE_ENCRYPTION_KEY` cannot be rotated trivially** — every encrypted token in `DataSource.credentials` was encrypted with the current key. Rotating means re-issuing every OAuth connection. Pick a key once, keep it safe (or build a re-encryption migration before rotating).
