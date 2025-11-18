# Environment Variables Template

Copy this to `.env.local` for local development or set in Vercel dashboard for production.

```env
# ============================================
# SUPABASE (Database & Auth)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:password@db.supabase.co:5432/postgres

# ============================================
# WHOP (Payments & Subscriptions)
# ============================================
WHOP_API_KEY=apik_...
WHOP_WEBHOOK_SECRET=ws_...

# ============================================
# RESEND (Email Service)
# ============================================
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@authorstack.com

# ============================================
# UPSTASH REDIS (Caching & Rate Limiting)
# ============================================
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AT_...

# ============================================
# UPSTASH QSTASH (Background Jobs & Cron)
# ============================================
UPSTASH_QSTASH_URL=https://qstash.upstash.io
UPSTASH_QSTASH_TOKEN=...
UPSTASH_QSTASH_CURRENT_SIGNING_KEY=sig_...

# ============================================
# SENTRY (Error Tracking & Monitoring)
# ============================================
SENTRY_DSN=https://...@...ingest.sentry.io/...
SENTRY_AUTH_TOKEN=sntryu_...

# ============================================
# POSTHOG (Product Analytics)
# ============================================
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# ============================================
# GUMROAD (Sales Platform)
# ============================================
GUMROAD_API_KEY=...

# ============================================
# APPLICATION SETTINGS
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VERCEL_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars-long

# ============================================
# SECURITY & DEPLOYMENT
# ============================================
JWT_SECRET=your-jwt-secret-min-32-chars-long
CRON_SECRET=your-cron-secret-min-32-chars-long
NODE_ENV=development

# ============================================
# FEATURE FLAGS
# ============================================
NEXT_PUBLIC_FEATURES={"leaderboard":false,"mascot":false,"community":false,"distribution":false}
```

## Required for Production

All variables above are required for production deployment. Set them in:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Supabase Dashboard → Project Settings → API Keys
3. Upstash Dashboard → API Keys
4. Sentry Dashboard → Project Settings
5. PostHog Dashboard → Project Settings

## Local Development

1. Copy this template to `.env.local`
2. Fill in your development credentials
3. Run `npm run dev`

## Deployment

1. Set all variables in Vercel dashboard
2. Deploy via `git push` to main branch
3. Vercel will auto-deploy with env vars
4. No code changes needed
