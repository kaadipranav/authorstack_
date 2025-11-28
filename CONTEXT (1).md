# AuthorStack — PRODUCTION CONTEXT (GitHub Student Developer Pack Edition)

> **Mission:** Build a production-ready indie-author SaaS platform that maximizes EVERY free resource from the GitHub Student Developer Pack, with a strategic post-graduation transition plan that minimizes ongoing costs.

---

## 🎓 Student Pack Strategy

### Core Philosophy
1. **Use every atom of free database/storage** across multiple providers during student period
2. **Build with migration in mind** - architecture supports moving data between providers
3. **Document costs religiously** - know exactly what expires when
4. **Graduate gracefully** - transition plan that costs <$50/month post-expiration

### Pack Expiration Timeline
- **Most services:** Expire with Student Pack (renew annually)
- **Heroku:** 24 months ($13/month credit)
- **DigitalOcean:** 12 months ($200 credit)
- **MongoDB Atlas:** $50 one-time + free tier continues
- **Appwrite:** Free Pro "throughout student career"
- **Azure:** While student status active

---

## 🏗️ Tech Stack (Maximizing Pack Benefits)

### **1. Frontend & Application Server**
```
Framework: Next.js 14 (App Router)
Language: TypeScript (strict mode)
Styling: Tailwind CSS + shadcn/ui
AI Coding: GitHub Copilot (FREE via Pack)
IDE: Visual Studio Code (FREE via Pack)
```

**Pack Benefits:**
- ✅ GitHub Copilot Pro (FREE)
- ✅ GitHub Codespaces (60 hours/month FREE)
- ✅ VS Code extensions (GitLens, etc.)

**Post-Graduation:** All free forever (open source tools)

---

### **2. Hosting & Deployment**

#### Primary Hosting: **DigitalOcean** ($200 credit / 1 year)
```yaml
App Platform: 
  - NextJS app deployment
  - Automatic scaling
  - $12/month Basic tier = ~16 months of hosting
  
Droplets (if needed):
  - $6/month basic droplet
  - Run cron jobs, background workers
  - Redis for job queues
```

#### Backup/Staging: **Heroku** ($13/month credit / 24 months)
```yaml
Use case: Staging environment & background workers
Credit: $312 total over 2 years
Eco Dyno: $5/month = 62 months of coverage (beyond graduation!)
```

#### CDN & Assets: **Vercel** (Free tier) + **DigitalOcean Spaces**
```yaml
Static Assets: Vercel Edge Network (FREE)
User Uploads: DigitalOcean Spaces ($5/250GB) - use credit
```

**Pack Benefits:**
- ✅ DigitalOcean: $200 credit = 16+ months of hosting
- ✅ Heroku: $312 over 24 months
- ✅ Microsoft Azure: $100 credit (backup option)

**Post-Graduation Cost:** 
- Fly.io: $0-15/month (generous free tier)
- Railway: $5/month developer plan
- **Total: $10-20/month**

---

### **3. Databases (MAXIMIZE EVERYTHING!)**

#### Primary Application DB: **MongoDB Atlas**
```yaml
Purpose: Core application data
Schema:
  - users, books, launches, checklists
  - community (posts, comments, likes)
  - leaderboards, marketplace
  
Pack Benefit: $50 credits + M0 free tier continues
Strategy: 
  - Use M10 tier ($0.08/hr) during high-traffic periods
  - Fall back to M0 (512MB free) after credits expire
```

#### Analytics & Time-Series: **Azure PostgreSQL** (via Student Pack)
```yaml
Purpose: Sales data, analytics aggregation, metrics
Tables:
  - daily_sales_aggregates
  - platform_sync_logs
  - user_activity_events
  - revenue_forecasts
  
Pack Benefit: Free access to Azure Database for PostgreSQL
Strategy: Use during student period, export to PostgreSQL elsewhere after
```

#### Authentication & Realtime: **Appwrite** (Pro FREE while student)
```yaml
Purpose: Auth, realtime subscriptions, file storage
Features:
  - User authentication (email, OAuth)
  - Real-time updates for community feed
  - User preferences & settings
  - Avatar uploads
  
Pack Benefit: Pro plan ($15/month value) FREE entire student career
Strategy: This is GOLD - use heavily, migrate auth to Supabase after if needed
```

#### Redis/Cache: **DigitalOcean Managed Redis** OR **Upstash**
```yaml
Purpose: Rate limiting, job queues, session cache
Current: Upstash (generous free tier)
Alternative: DigitalOcean Redis ($15/month) - use from $200 credit

Strategy: Stay on Upstash free tier (10k commands/day), switch to self-hosted Redis on Fly.io after graduation
```

#### Backup/Staging DB: **Heroku Postgres**
```yaml
Purpose: Staging environment, database backups
Pack Benefit: Use Heroku credit for Hobby Basic ($9/month)
Strategy: Covers 34+ months of staging database
```

**Pack Benefits:**
- ✅ MongoDB Atlas: $50 credits
- ✅ Azure: Free PostgreSQL database
- ✅ Appwrite: Free Pro plan ($15/month value)
- ✅ Heroku: Postgres add-on from credits
- ✅ DigitalOcean: Managed databases from $200 credit

**Data Distribution Strategy:**
```
Users/Auth → Appwrite (FREE Pro while student)
Books/Core App → MongoDB Atlas (M0 free tier)
Sales/Analytics → Azure PostgreSQL (FREE while student)
Cache/Jobs → Upstash Redis (FREE tier continues)
Staging → Heroku Postgres (from credits)
```

**Post-Graduation Migration:**
- Consolidate to **Supabase** ($25/month Pro)
  - PostgreSQL (replaces Azure)
  - Auth (replaces Appwrite)
  - Storage (replaces DigitalOcean Spaces)
  - Realtime (replaces Appwrite)
- Keep **MongoDB** on free M0 tier (512MB)
- **Upstash** remains free
- **Total: $25-30/month**

---

### **4. Background Jobs & Cron**

#### Job Queue: **Custom Redis Queue** (on DigitalOcean/Heroku)
```typescript
// Use BullMQ or custom solution
Queue: Redis-backed job queue
Processors: Separate worker process on DigitalOcean Droplet

Jobs:
  - Platform data ingestion (daily)
  - Leaderboard calculations (daily)
  - Analytics aggregation (daily)
  - Email sends (on-demand)
```

#### Cron Orchestration: **Master Cron Endpoint**
```typescript
// Single endpoint that triggers all jobs
// Bypass Vercel 2-cron limit
POST /api/cron/master
  Authorization: Bearer {CRON_SECRET}
  
Triggered by: GitHub Actions (free unlimited)
OR: cron-job.org (free)
OR: DigitalOcean Droplet native cron
```

**Pack Benefits:**
- ✅ GitHub Actions: Unlimited for public repos, 2000 min/month private
- ✅ DigitalOcean: Run cron on $6 droplet (from $200 credit)

**Post-Graduation:** 
- GitHub Actions remains free
- Self-hosted cron on app server
- **Cost: $0**

---

### **5. Authentication & Payments**

#### Auth Provider: **Appwrite** (PRIMARY) + **Backup JWT**
```yaml
Primary: Appwrite (FREE Pro via Pack)
  - Email/password
  - OAuth (Google, GitHub)
  - Session management
  - MFA support
  
Fallback: Custom JWT (for post-graduation migration)
```

#### Payments: **Stripe** (via Pack offer)
```yaml
Pack Benefit: Waived transaction fees on first $1000 revenue
Features:
  - Subscription billing
  - One-time credit purchases
  - Webhook handling
  
Post-Graduation: 2.9% + $0.30 per transaction (standard)
```

**Pack Benefits:**
- ✅ Appwrite: Free Pro authentication
- ✅ Stripe: $1000 fee-free processing
- ✅ 1Password: Free for students (store API keys)

---

### **6. Email & Notifications**

#### Email Provider: **Resend** (NOT in pack - but affordable)
```yaml
Cost: FREE for 100 emails/day, then $20/month for 50k
Templates:
  - Welcome email
  - Password reset
  - Subscription updates
  - Weekly digest
  - Platform sync notifications
  
Alternative: Use Azure Communication Services (FREE via Pack)
```

**Strategy:** Start with Resend ($0 for MVP), switch to Azure if volume justifies it

---

### **7. AI & ML Services**

#### AI Provider: **OpenRouter** (NOT in pack) + **Azure OpenAI**
```yaml
Primary: OpenRouter with DeepSeek V3
  - Cost: ~$0.14 per 1M tokens (cheapest)
  - Features: Chat, forecasting, insights
  
Backup: Azure OpenAI Service (FREE credits)
  - $100 Azure credit can buy significant AI usage
  - GPT-4 fallback option
```

**Pack Benefits:**
- ✅ Microsoft Azure: $100 credit for AI services
- ✅ DataCamp: AI/ML learning resources

**Post-Graduation:** OpenRouter remains cheap ($10-20/month at scale)

---

### **8. Monitoring & Analytics**

#### Error Tracking: **Sentry** (via Pack)
```yaml
Pack Benefit: 50K errors, 100K transactions, 500 replays, 1GB attachments
Renewal: Can renew annually while student
```

#### Application Monitoring: **New Relic** (via Pack)
```yaml
Pack Benefit: FREE while student ($300/month value!)
Features:
  - APM (Application Performance Monitoring)
  - Infrastructure monitoring
  - Log management
  - Alerts
```

#### Uptime Monitoring: **Datadog** (via Pack)
```yaml
Pack Benefit: Pro Account for 2 YEARS (10 servers)
Features:
  - Infrastructure metrics
  - APM
  - Log aggregation
  - Dashboards
```

#### User Analytics: **SimpleAnalytics** (via Pack)
```yaml
Pack Benefit: 1 year free (100k pageviews/month)
Privacy-friendly alternative to Google Analytics
```

**Pack Benefits:**
- ✅ Sentry: 1 year free (renewable)
- ✅ New Relic: FREE while student ($300/month!)
- ✅ Datadog: 2 years free (Pro account)
- ✅ SimpleAnalytics: 1 year free

**Post-Graduation:**
- Use Sentry free tier (5K errors/month)
- Self-hosted analytics (Plausible, Umami)
- **Cost: $0-10/month**

---

### **9. Developer Tools**

#### Version Control: **GitHub**
```yaml
Pack Benefit: GitHub Pro FREE while student
Features:
  - Private repos
  - GitHub Actions (2000 min/month)
  - GitHub Pages
  - GitHub Copilot
```

#### CI/CD: **GitHub Actions** + **Travis CI**
```yaml
Primary: GitHub Actions (FREE 2000 min/month)
Backup: Travis CI (FREE private builds via Pack)
```

#### Testing: **BrowserStack** (via Pack)
```yaml
Pack Benefit: Free Automate Mobile Plan for 1 year
Use for: Cross-browser testing, mobile testing
```

#### Secret Management: **Doppler** (via Pack) + **1Password**
```yaml
Doppler: FREE Team subscription (for env vars)
1Password: FREE for 1 year (for team credentials)
```

**Pack Benefits:**
- ✅ GitHub Pro + Copilot + Codespaces
- ✅ Travis CI: Private builds
- ✅ BrowserStack: 1 year free
- ✅ Doppler: Team plan FREE
- ✅ 1Password: 1 year free
- ✅ GitKraken: 6 months free + 80% student discount

**Post-Graduation:** GitHub free tier + open source tools = $0/month

---

### **10. Testing & Local Development**

#### Development Environment: **GitHub Codespaces** (via Pack)
```yaml
Pack Benefit: FREE Pro access (60 core-hours/month)
Use case: Code from anywhere, consistent environment
```

#### Local Development: **LocalStack** (via Pack)
```yaml
Pack Benefit: FREE Pro license for AWS emulation
Use case: Test AWS services locally (S3, Lambda, DynamoDB)
```

**Pack Benefits:**
- ✅ GitHub Codespaces: 60 hours/month FREE
- ✅ LocalStack: Pro license FREE

---

## 📊 Cost Analysis

### **During Student Period (Per Month)**
| Service | Pack Value | Actual Cost |
|---------|-----------|-------------|
| Hosting (DigitalOcean) | $200/12mo | $0 (credits) |
| Heroku Staging | $13/mo × 24 | $0 (credits) |
| MongoDB Atlas | After $50 credits | $0 (M0 tier) |
| Azure PostgreSQL | FREE | $0 |
| Appwrite Pro | $15/mo | $0 (FREE) |
| Upstash Redis | FREE tier | $0 |
| Resend Email | 100/day FREE | $0 (MVP scale) |
| Sentry | $29/mo | $0 (Pack) |
| New Relic | $300/mo | $0 (Pack) |
| Datadog | $15/mo | $0 (Pack 2yr) |
| OpenRouter AI | Pay-as-you-go | $10-30 |
| Domain (.tech) | $12/yr | $0 (Pack) |
| **TOTAL** | **~$400/mo value** | **$10-30/mo** |

### **Post-Graduation (Optimized Stack)**
| Service | Cost/Month | Notes |
|---------|-----------|-------|
| Fly.io Hosting | $10-15 | App + Redis |
| Supabase Pro | $25 | DB + Auth + Storage |
| MongoDB M0 | $0 | Free tier (512MB) |
| Resend Email | $20 | 50k emails/month |
| OpenRouter AI | $10-30 | Usage-based |
| Sentry Free | $0 | 5K errors/month |
| Domain | $12/yr | Any registrar |
| **TOTAL** | **$65-90/mo** | |

### **Break-Even Analysis**
- Student Pack Value: **~$400/month**
- Savings Over 2 Years: **~$9,600**
- Post-Graduation Cost: **$65-90/month**
- At 50 paying users ($29/mo): **$1,450/month revenue**
- Profit Margin: **94%+ (SaaS gold standard)**

---

## 🗂️ Database Schema Distribution

### **MongoDB Atlas (Primary App Data)**
```javascript
// Collections
users: {
  auth_provider: 'appwrite',
  subscription_tier: String,
  credits: Number
}

books: {
  user_id: ObjectId,
  title: String,
  metadata: Object,
  cover_url: String  // Stored in DigitalOcean Spaces
}

checklists: {
  book_id: ObjectId,
  tasks: Array,
  progress: Number
}

community_posts: {
  author_id: ObjectId,
  content: String,
  likes: Array,
  comments: Array
}

marketplace_boosts: {
  book_id: ObjectId,
  duration: Number,
  active: Boolean
}
```

### **Azure PostgreSQL (Analytics & Time-Series)**
```sql
-- Tables
CREATE TABLE sales_data (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  book_id UUID,
  platform VARCHAR(50),
  date DATE,
  revenue DECIMAL(10,2),
  units INTEGER,
  synced_at TIMESTAMP
);

CREATE TABLE daily_aggregates (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  date DATE,
  total_revenue DECIMAL(10,2),
  total_units INTEGER,
  platform_breakdown JSONB
);

CREATE TABLE sync_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  platform VARCHAR(50),
  status VARCHAR(20),
  error_message TEXT,
  synced_at TIMESTAMP
);

CREATE TABLE ai_insights (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  insight_type VARCHAR(50),
  data JSONB,
  created_at TIMESTAMP
);
```

### **Appwrite (Auth & Realtime)**
```yaml
Databases:
  - Users (auth provider handles)
  - User Preferences
  - Avatars (file storage)
  - Real-time subscriptions for community feed
```

---

## 🔄 Migration Strategy (Pack Expiration)

### **Phase 1: Data Audit (Month 18 of student status)**
```bash
# Document all data locations
- Map all collections/tables
- Calculate storage usage
- Identify migration paths
```

### **Phase 2: Parallel Setup (Month 20)**
```bash
# Set up post-graduation infrastructure
1. Create Supabase Pro account
2. Set up Fly.io app
3. Configure DNS/domains
4. Deploy staging environment
```

### **Phase 3: Gradual Migration (Month 22-24)**
```typescript
// Week 1-2: Migrate MongoDB to Supabase PostgreSQL
- Export collections as JSON
- Create equivalent tables in Supabase
- Write migration scripts
- Test dual-write mode

// Week 3-4: Migrate Azure PostgreSQL to Supabase
- Export analytics tables
- Import to Supabase
- Update connection strings
- Test queries

// Week 5-6: Migrate Appwrite Auth to Supabase Auth
- Export user data
- Set up Supabase Auth
- Migrate OAuth providers
- Update client SDK calls

// Week 7-8: Switch hosting
- Deploy to Fly.io
- Run parallel for 1 week
- Switch DNS
- Decomission DigitalOcean
```

### **Phase 4: Validation (Month 24+)**
```bash
# Verify everything works
- Run full test suite
- Monitor error rates
- Check performance metrics
- Validate data integrity
```

---

## 🚀 Deployment Architecture

### **Student Period Architecture**
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/Mobile)               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel CDN (Static Assets)                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         DigitalOcean App Platform (Next.js App)          │
│  - API Routes                                            │
│  - Server Components                                     │
│  - Background Job Triggers                               │
└──┬────────────┬─────────────┬─────────────┬─────────────┘
   │            │             │             │
   ▼            ▼             ▼             ▼
┌──────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
│MongoDB│  │Azure    │  │Appwrite  │  │Upstash   │
│Atlas  │  │PostgreSQL│  │(Auth/RT) │  │Redis     │
│(M0)   │  │(FREE)   │  │(FREE Pro)│  │(FREE)    │
└───────┘  └─────────┘  └──────────┘  └──────────┘
   │            │             │             │
   └────────────┴─────────────┴─────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│       Heroku Worker Dyno (Background Jobs)               │
│  - Data ingestion                                        │
│  - Leaderboard calculations                              │
│  - Email queue processing                                │
└─────────────────────────────────────────────────────────┘
```

### **Post-Graduation Architecture (Simplified)**
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/Mobile)               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel CDN (Static Assets)                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         Fly.io (Next.js + Background Workers)            │
│  - API Routes                                            │
│  - Cron Jobs (native)                                    │
│  - Redis (same machine)                                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase Pro (All-in-One)                   │
│  - PostgreSQL Database                                   │
│  - Authentication                                        │
│  - File Storage                                          │
│  - Realtime Subscriptions                                │
│  - Edge Functions                                        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         MongoDB Atlas M0 (Legacy Data/Backups)           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Environment Variables (Complete List)

### **Student Period**
```bash
# Core App
NEXT_PUBLIC_APP_URL=https://authorstack-app.ondigitalocean.app
CRON_SECRET=random-32-char-string
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/authorstack
MONGODB_DB_NAME=authorstack

# Azure PostgreSQL
AZURE_POSTGRES_URL=postgresql://user:pass@server.postgres.database.azure.com/analytics
AZURE_POSTGRES_POOL_SIZE=10

# Appwrite (Auth + Storage)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# DigitalOcean Spaces (S3-compatible)
DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=authorstack-assets
DO_SPACES_KEY=your-key
DO_SPACES_SECRET=your-secret
NEXT_PUBLIC_CDN_URL=https://authorstack-assets.nyc3.cdn.digitaloceanspaces.com

# AI
OPENROUTER_API_KEY=sk-or-v1-xxx
AZURE_OPENAI_KEY=your-azure-key (backup)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com

# Payments
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@authorstack.tech

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
NEW_RELIC_LICENSE_KEY=xxx
DATADOG_API_KEY=xxx

# Feature Flags (DevCycle)
DEVCYCLE_SERVER_SDK_KEY=dvc_server_xxx
NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY=dvc_client_xxx

# External APIs (Platform Integrations)
GUMROAD_CLIENT_ID=xxx
GUMROAD_CLIENT_SECRET=xxx
KDP_SCRAPER_PROXY=xxx  # For Amazon scraping
```

### **Post-Graduation (Simplified)**
```bash
# Core App
NEXT_PUBLIC_APP_URL=https://authorstack.app
CRON_SECRET=random-32-char-string

# Supabase (replaces MongoDB + Azure + Appwrite)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
DATABASE_URL=postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres

# MongoDB Atlas (legacy/backup only)
MONGODB_URI=mongodb+srv://xxx (M0 free tier)

# Redis (Fly.io self-hosted)
REDIS_URL=redis://localhost:6379

# Rest remains same (Stripe, Email, OpenRouter, etc.)
```

---

## 📋 AI Agent Instructions (FOR CURSOR/WINDSURF/COPILOT)

### **You are building AuthorStack with these constraints:**

#### 1. **Database Operations**
```typescript
// ALWAYS use the correct database for each operation

// MongoDB (books, users, community)
import { mongoClient } from '@/lib/mongodb'
const db = mongoClient.db('authorstack')
const books = await db.collection('books').find({ user_id }).toArray()

// Azure PostgreSQL (analytics, sales)
import { azurePool } from '@/lib/azure-postgres'
const sales = await azurePool.query('SELECT * FROM sales_data WHERE user_id = $1', [userId])

// Appwrite (auth, realtime)
import { appwriteClient } from '@/lib/appwrite'
const session = await appwriteClient.account.getSession('current')

// Redis (cache, jobs)
import { redis } from '@/lib/redis'
await redis.set('key', 'value', 'EX', 3600)
```

#### 2. **File Uploads**
```typescript
// ALL files go to DigitalOcean Spaces (S3-compatible)
import { S3Client } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: 'nyc3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!
  }
})

// Upload book covers here
// Return CDN URL: https://authorstack-assets.nyc3.cdn.digitaloceanspaces.com/covers/{filename}
```

#### 3. **Background Jobs**
```typescript
// Add jobs to Redis queue, process on Heroku worker
import { Queue } from 'bullmq'

const ingestionQueue = new Queue('ingestion', {
  connection: { 
    url: process.env.UPSTASH_REDIS_REST_URL 
  }
})

await ingestionQueue.add('sync-kdp', { 
  userId, 
  platform: 'amazon-kdp' 
})
```

#### 4. **Error Tracking**
```typescript
// Always wrap risky operations in Sentry
import * as Sentry from '@sentry/nextjs'

try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    user: { id: userId },
    tags: { operation: 'data-sync' }
  })
  throw error
}
```

#### 5. **Feature Flags**
```typescript
// Check feature flags before implementing new features
import { useDevCycleClient } from '@devcycle/devcycle-react-sdk'

const devcycleClient = useDevCycleClient()
const leaderboardEnabled = devcycleClient.variableValue('leaderboard', false)

if (leaderboardEnabled) {
  // Show leaderboard
}
```

#### 6. **API Rate Limiting**
```typescript
// Use Redis for rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m')
})

const { success } = await ratelimit.limit(`api:${userId}`)
if (!success) {
  return new Response('Rate limit exceeded', { status: 429 })
}
```

#### 7. **Authentication**
```typescript
// Use Appwrite for auth during student period
import { appwriteClient } from '@/lib/appwrite'

// Server-side
const user = await appwriteClient.account.get()

// Client-side
import { useUser } from '@/hooks/useUser'
const { user, loading } = useUser()

// Migration path: Abstract auth into service layer
// /lib/auth/index.ts exports unified interface
// Can swap providers without changing components
```

#### 8. **Migration Readiness**
```typescript
// ALWAYS abstract database calls into service layer
// BAD
const books = await db.collection('books').find().toArray()

// GOOD
import { bookService } from '@/services/books'
const books = await bookService.findByUser(userId)

// Service layer handles which DB to use
// Easy to switch from MongoDB to PostgreSQL later
```

#### 9. **Cost Monitoring**
```typescript
// Log expensive operations
import { logger } from '@/lib/logger'

logger.info('ai-request', {
  userId,
  model: 'deepseek-v3',
  tokens: response.usage.total_tokens,
  cost: estimatedCost  // Track AI costs
})

// Weekly cost report sent via email
```

#### 10. **Pack Expiration Warnings**
```typescript
// Add warnings when pack resources are expiring
if (isStudentPackExpiring(user.graduationDate)) {
  showBanner('Your Student Pack expires soon. Migrate to Supabase?')
}
```

---

## 🧪 Testing Strategy

### **During Development**
```bash
# Unit Tests (Vitest)
npm run test

# E2E Tests (Playwright)
npm run test:e2e

# Type Checking
npm run type-check

# Linting
npm run lint

# Test environments
- Local: Uses LocalStack for AWS emulation (FREE via Pack)
- CI: GitHub Actions (2000 min/month FREE)
- Staging: Heroku review apps (from credit)
```

### **Cross-Browser Testing**
```bash
# Use BrowserStack (FREE 1 year via Pack)
- Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Android
- Automation: Playwright + BrowserStack
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Workflow**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to DigitalOcean
        uses: digitalocean/app_action@v1
        with:
          app_name: authorstack
          token: ${{ secrets.DO_ACCESS_TOKEN }}

      - name: Run migrations
        run: |
          # MongoDB migrations
          npm run migrate:mongo
          
          # Azure PostgreSQL migrations
          npm run migrate:azure

      - name: Notify Sentry
        run: |
          curl -sL https://sentry.io/api/0/organizations/.../releases/ \
            -H "Authorization: Bearer $SENTRY_TOKEN" \
            -d version=$GITHUB_SHA

      - name: Health Check
        run: |
          sleep 30
          curl -f https://authorstack-app.ondigitalocean.app/api/healthz || exit 1
```

---

## 📖 Documentation Requirements

### **For AI Agents (Cursor/Windsurf)**
Create these files in `/docs`:

1. **ARCHITECTURE.md** - System design diagram
2. **DATABASE_SCHEMA.md** - All tables/collections
3. **API_ROUTES.md** - Complete API documentation
4. **MIGRATION_GUIDE.md** - Step-by-step pack expiration plan
5. **COST_TRACKING.md** - Monthly cost breakdown
6. **PACK_BENEFITS.md** - All active pack offers + expiration dates

### **For Humans**
1. **README.md** - Getting started guide
2. **CONTRIBUTING.md** - Code style, PR process
3. **DEPLOYMENT.md** - How to deploy to production
4. **TROUBLESHOOTING.md** - Common issues + fixes

---

## 🎯 Success Metrics

### **Technical**
- ✅ Zero downtime during pack-to-paid migration
- ✅ <200ms API response times (p95)
- ✅ >99.9% uptime
- ✅ <5 critical errors/day (Sentry)
- ✅ All tests passing

### **Business**
- ✅ 100+ beta users before graduation
- ✅ $1,000+ MRR before graduation
- ✅ <$50/month hosting cost post-graduation
- ✅ 95%+ profit margin maintained

### **Cost Savings**
- ✅ Save $9,600+ over 2 years (vs paying full price)
- ✅ Graduate with <$100/month costs
- ✅ Maintain profitability from day 1

---

## 🚨 Emergency Procedures

### **Pack Expires Unexpectedly**
```bash
# Immediate actions (can complete in 24 hours)

1. Switch hosting: Deploy to Fly.io
   - fly deploy (takes 5 minutes)

2. Switch database: Activate Supabase
   - Import latest MongoDB backup
   - Update DATABASE_URL
   - Redeploy

3. Switch auth: Migrate to Supabase Auth
   - Export users from Appwrite
   - Import to Supabase
   - Update auth SDK calls

4. Switch monitoring: Use Sentry free tier
   - Update SENTRY_DSN
   - Lose New Relic/Datadog temporarily

Total Cost: $65/month (vs $400/month pack value)
```

### **Database Corruption**
```bash
# Backups stored in 3 locations
1. MongoDB Atlas automated backups (48 hours)
2. Azure PostgreSQL point-in-time restore (35 days)
3. Weekly dumps to DigitalOcean Spaces

# Restore procedure
npm run restore:latest
```

---

## 🎓 Graduation Checklist

**6 Months Before Graduation:**
- [ ] Audit all pack services in use
- [ ] Calculate post-graduation costs
- [ ] Set up Supabase Pro account
- [ ] Set up Fly.io app
- [ ] Purchase domain (use .tech free from pack!)
- [ ] Document all environment variables
- [ ] Create migration runbook

**3 Months Before:**
- [ ] Export all data (MongoDB, Azure, Appwrite)
- [ ] Set up Supabase schema
- [ ] Test migration scripts
- [ ] Run parallel systems for 1 week
- [ ] Validate data integrity

**1 Month Before:**
- [ ] Switch DNS to Fly.io
- [ ] Migrate users to Supabase Auth
- [ ] Update all environment variables
- [ ] Run full test suite
- [ ] Monitor error rates

**Graduation Day:**
- [ ] Decommission DigitalOcean app
- [ ] Cancel Azure student subscription (if separate)
- [ ] Archive Appwrite data
- [ ] Celebrate! 🎉

**Post-Graduation:**
- [ ] Verify monthly costs <$90
- [ ] Set up billing alerts
- [ ] Continue optimizing
- [ ] Build in public
- [ ] Help other students!

---

## 💡 Pro Tips for AI Agents

1. **Always check which database to use**
   - Books/Community → MongoDB
   - Sales/Analytics → Azure PostgreSQL
   - Auth → Appwrite
   - Cache → Redis

2. **Abstract everything into service layer**
   - Makes migration 10x easier
   - Swap providers without touching components

3. **Log expensive operations**
   - AI token usage
   - Database queries >100ms
   - External API calls

4. **Use feature flags for everything new**
   - DevCycle free via pack
   - Easy rollback if broken
   - Graduate users slowly

5. **Write migration scripts as you build**
   - Don't wait until pack expires
   - Test migrations quarterly
   - Document assumptions

6. **Optimize for post-graduation costs**
   - Design for Supabase from day 1
   - Keep MongoDB usage low
   - Cache aggressively

7. **Monitor pack expiration dates**
   - Add calendar reminders
   - Set up alerts
   - Have backup plan ready

---

**END OF CONTEXT FILE**

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start local dev server
npm run build           # Build for production
npm run test            # Run tests
npm run type-check      # TypeScript validation
npm run lint            # Code linting

# Database
npm run migrate:mongo   # MongoDB migrations
npm run migrate:azure   # Azure PostgreSQL migrations
npm run seed            # Seed data

# Deployment
npm run deploy:staging  # Deploy to Heroku staging
npm run deploy:prod     # Deploy to DigitalOcean prod

# Pack Management
npm run pack:audit      # Check active pack services
npm run pack:costs      # Calculate current costs
npm run pack:migrate    # Start migration process

# Maintenance
npm run backup:all      # Backup all databases
npm run restore:latest  # Restore from backup
npm run health-check    # Verify all services
```

---

**Remember:** The goal isn't just to use free stuff—it's to build a sustainable, profitable business that outlasts your student status. Use the pack to learn, experiment, and grow without financial stress. Then graduate to a lean, efficient stack that keeps your margins high.

**Now go build something amazing! 🚀**
