# AuthorStack

AI-powered publishing dashboard for indie authors. Track sales across 9+ platforms, get ML predictions, chat with your AI assistant, and launch smarter with automated insights.

## Features

**Phase 1-2: Core Platform** ✅
- Multi-platform sales dashboard (Amazon KDP, Gumroad, Payhip, Lulu, etc.)
- Real-time analytics & revenue tracking
- Launch checklist management
- Book catalog with cover uploads
- Competitor tracking

**Phase 3: AI Layer** ✅
- AI chat assistant (context-aware publishing consultant)
- Revenue forecasting & churn detection (ML models)
- Smart recommendations (pricing, marketing, strategy)
- Automated insights & performance alerts
- Powered by OpenRouter (GPT-4 & Claude access)

**Phase 4: Viral Growth** 📋 (Coming Soon)
- Public leaderboard (top 100 books)
- Shareable ranking badges
- Author profile pages

## Tech Stack
- Next.js 16 (App Router, React 19, TypeScript)
- Tailwind CSS v4 + shadcn/ui components
- Supabase (auth, Postgres, storage)
- Upstash Redis + QStash (caching & job queue)
- OpenRouter (AI/ML via GPT-4 & Claude)
- Whop (subscription billing)
- Resend (transactional email)

## Project layout
```
app/            # Routes, API handlers, layouts, loading/error states
components/     # UI primitives, navigation, providers, layout helpers
features/       # Future slices (leaderboard, mascot, community, distribution)
lib/            # Framework-agnostic utilities (env, supabase, cache, payments)
supabase/       # CLI config, SQL migrations, seed data
types/          # Shared TypeScript contracts
utils/          # Generic helpers
docs/           # Architecture notes + runbooks
```

## Environment
1. Copy `.env.example` to `.env.local`.
2. Fill Supabase, Whop, Upstash, and Resend credentials.
3. Feature flags live in `NEXT_PUBLIC_FEATURES` (JSON string).

## Local development
```bash
pnpm install
pnpm supabase:start     # launches local Postgres/auth/storage
pnpm db:reset           # applies migrations + seed data
pnpm dev
```

## Quality gates
```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Observability & ops
- `/api/healthz` verifies Supabase, Redis, Whop, and Resend configuration.
- Docs live at `/docs` with links to the in-repo architecture/runbook files.
- Scripts for Supabase management are available under the `package.json` scripts section.
