# AuthorStack Deployment Guide

## Overview

AuthorStack is designed for **zero-code deployment**. After initial setup, anyone can deploy by only setting environment variables in Vercel and Supabase.

## Prerequisites

1. GitHub account with repository access
2. Vercel account (free tier works)
3. Supabase account (free tier works)
4. Upstash account (Redis + QStash)
5. Whop account (for payments)
6. Resend account (for email)
7. Sentry account (optional, for error tracking)
8. PostHog account (optional, for analytics)

## Step 1: Prepare Credentials

Gather all required credentials from each service:

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

**Whop:**
- `WHOP_API_KEY`
- `WHOP_WEBHOOK_SECRET`

**Resend:**
- `RESEND_API_KEY`
- `FROM_EMAIL`

**Upstash:**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `UPSTASH_QSTASH_URL`
- `UPSTASH_QSTASH_TOKEN`
- `UPSTASH_QSTASH_CURRENT_SIGNING_KEY`

**Sentry (optional):**
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`

**PostHog (optional):**
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

**Gumroad:**
- `GUMROAD_API_KEY`

**Security:**
- Generate `JWT_SECRET` (min 32 chars)
- Generate `CRON_SECRET` (min 32 chars)
- Set `NEXTAUTH_SECRET` (min 32 chars)

## Step 2: Create Vercel Projects

1. Go to [vercel.com](https://vercel.com)
2. Create two projects:
   - `authorstack-staging` (for staging branch)
   - `authorstack-prod` (for main branch)
3. Connect GitHub repository to both projects
4. **Do NOT set environment variables yet**

## Step 3: Set Environment Variables in Vercel

For each Vercel project (staging & prod):

1. Go to Project Settings → Environment Variables
2. Add all variables from the credentials list above
3. Set appropriate environment for each:
   - Staging: `NEXT_PUBLIC_VERCEL_ENV=preview`
   - Production: `NEXT_PUBLIC_VERCEL_ENV=production`

**Important:** Use the same values for both staging and production, except:
- `NEXTAUTH_URL` (staging vs prod domain)
- `NEXT_PUBLIC_APP_URL` (staging vs prod domain)

## Step 4: Configure GitHub Actions

1. Go to GitHub repository Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VERCEL_TOKEN` (from Vercel Account Settings)
   - `VERCEL_ORG_ID` (from Vercel Account Settings)
   - `VERCEL_PROJECT_ID_STAGING` (from staging project)
   - `VERCEL_PROJECT_ID_PROD` (from prod project)
   - All other env vars as secrets if needed

## Step 5: Configure Webhooks

**Whop Webhooks:**
1. Go to Whop Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/whop`
3. Select events: membership.created, membership.updated, membership.cancelled
4. Use `WHOP_WEBHOOK_SECRET` as signing secret

**Upstash QStash:**
1. Configure cron in `vercel.json` (already done)
2. Vercel will automatically call `/api/ingestion/cron` every 5 minutes

## Step 6: Database Migrations

Migrations run automatically during CI/CD pipeline. To manually run:

```bash
npx supabase db push
```

Or via Supabase CLI:

```bash
supabase db push --db-url $SUPABASE_DB_URL
```

## Step 7: Deploy

### Automatic Deployment (Recommended)

1. Push to `staging` branch → Auto-deploys to staging
2. Push to `main` branch → Auto-deploys to production
3. GitHub Actions runs tests, builds, and deploys

### Manual Deployment

```bash
# Deploy to staging
vercel --scope=your-org

# Deploy to production
vercel --prod --scope=your-org
```

## Step 8: Verify Deployment

1. Visit health check: `https://your-domain.vercel.app/api/healthz`
2. Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-01-18T10:30:00Z",
  "checks": {
    "supabase": { "status": "pass", "latencyMs": 45 },
    "redis": { "status": "pass", "latencyMs": 23 },
    "integrations": { "whop": "configured", "resend": "configured" }
  }
}
```

3. Test signup flow
4. Test platform connections
5. Check Sentry for errors
6. Check PostHog for events

## Troubleshooting

### Build Fails

Check Vercel build logs for:
- Missing environment variables
- TypeScript errors
- Lint errors

### Health Check Fails

- Verify Supabase credentials
- Verify Redis credentials
- Check Vercel logs

### Webhooks Not Firing

- Verify webhook URL is correct
- Check webhook signing secret
- Review webhook logs in Whop/Upstash dashboard

### Cron Jobs Not Running

- Verify `vercel.json` has cron configuration
- Check Vercel Cron Logs
- Verify `CRON_SECRET` is set

## Monitoring

### Sentry
- Errors automatically captured
- Check Sentry dashboard for error trends
- Set up alerts for critical errors

### PostHog
- Analytics events tracked automatically
- Check PostHog dashboard for user behavior
- Create dashboards for key metrics

### Health Check
- Endpoint: `/api/healthz`
- Call every 5 minutes from monitoring service
- Alert if status != "ok"

## Rollback

If deployment fails:

1. Revert commit: `git revert <commit-hash>`
2. Push to main: `git push origin main`
3. Vercel auto-deploys previous version

Or manually:

```bash
vercel rollback
```

## Feature Flags

Control features without code changes via `NEXT_PUBLIC_FEATURES`:

```json
{
  "leaderboard": false,
  "mascot": false,
  "community": false,
  "distribution": false
}
```

Update in Vercel environment variables and redeploy.

## Zero-Code Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] GitHub Actions secrets configured
- [ ] Webhooks configured in Whop
- [ ] Database migrations applied
- [ ] Health check returns "ok"
- [ ] Signup flow works
- [ ] Platform connections work
- [ ] Cron jobs running
- [ ] Sentry capturing errors
- [ ] PostHog tracking events

---

**After this checklist, AuthorStack is production-ready with zero code changes.**
