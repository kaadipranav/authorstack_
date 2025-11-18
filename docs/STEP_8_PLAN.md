# STEP 8 — Real Integrations Implementation Plan

## Overview

STEP 8 replaces all placeholder code with real integrations for:
1. **Whop** - Subscription management (already has webhook handler)
2. **Gumroad** - Sales data ingestion via OAuth
3. **Upstash** - Redis queue operations
4. **Resend** - Email delivery

## Current State (Steps 1-7)

### ✅ Completed
- Supabase Auth (signup, login, email verification)
- Profile & subscription management
- Book management CRUD
- Platform connections UI
- Sales data ingestion pipeline (placeholder handlers)
- Cron job orchestration (Vercel Cron)
- Whop webhook handler with mock signature verification

### 🔲 Placeholders to Replace

**Ingestion Handlers** (`lib/ingestion/handlers.ts`)
- `handleAmazonKdpIngestion()` - Parses CSV files
- `handleGumroadIngestion()` - Fetches via Gumroad API
- `handleSmashwordsIngestion()` - Placeholder
- `handleDraft2DigitalIngestion()` - Placeholder

**Email Service** (`lib/email/resend.ts`)
- Currently empty/placeholder

**Redis Operations** (`lib/cache/redis.ts`)
- Basic ping only, no queue operations

**Whop Integration** (`lib/payments/whop.ts`)
- Basic API fetch wrapper only

## STEP 8 Implementation Roadmap

### Phase 1: Whop Real Integration

**File:** `lib/payments/whop.ts` + `lib/payments/whop-service.ts`

**Tasks:**
1. Fetch customer subscriptions from Whop API
2. Fetch membership details
3. Validate webhook signatures with real secret
4. Sync subscription status with database

**Endpoints to implement:**
- `GET /api/v3/customers/{customer_id}` - Get customer
- `GET /api/v3/memberships` - List memberships
- `GET /api/v3/memberships/{membership_id}` - Get membership details

### Phase 2: Gumroad Real Integration

**File:** `lib/ingestion/handlers.ts` + new `lib/platforms/gumroad.ts`

**Tasks:**
1. Exchange OAuth code for access token
2. Fetch sales/products from Gumroad API
3. Parse sales data into sales_events
4. Handle pagination and rate limiting

**Endpoints to implement:**
- `GET /api/v2/products` - List products
- `GET /api/v2/sales` - List sales
- `POST /oauth/token` - Exchange code for token

### Phase 3: Upstash Real Integration

**File:** `lib/cache/redis.ts` + `lib/ingestion/queue.ts`

**Tasks:**
1. Implement Redis queue operations
2. Add job scheduling
3. Implement rate limiting
4. Add caching for API responses

**Operations:**
- `LPUSH` / `RPOP` - Queue management
- `SET` / `GET` - Caching
- `INCR` - Rate limiting counters
- `EXPIRE` - TTL management

### Phase 4: Resend Real Integration

**File:** `lib/email/resend.ts`

**Tasks:**
1. Send transactional emails
2. Email templates for:
   - Signup confirmation
   - Password reset
   - Subscription updates
   - Ingestion alerts
3. Error handling and retries

**Email Types:**
- Signup confirmation
- Password reset
- Subscription tier changed
- Ingestion job completed
- Ingestion job failed

## Integration Details

### 1. Whop Integration

**What's Already Done:**
- ✅ Webhook handler with signature verification
- ✅ Subscription storage in database
- ✅ Profile tier updates

**What Needs Implementation:**
- Fetch customer details from Whop API
- Validate real signatures with `WHOP_WEBHOOK_SECRET`
- Sync historical subscriptions on first connection
- Handle subscription downgrades/upgrades

**Required Env Vars:**
```env
WHOP_API_KEY=your_api_key
WHOP_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Gumroad Integration

**What's Already Done:**
- ✅ OAuth flow structure
- ✅ Platform connection storage
- ✅ Ingestion job queue

**What Needs Implementation:**
- OAuth token exchange
- Fetch products from Gumroad
- Fetch sales with pagination
- Parse sales into sales_events
- Handle rate limiting (120 req/min)

**Required Env Vars:**
```env
GUMROAD_CLIENT_ID=your_client_id
GUMROAD_CLIENT_SECRET=your_client_secret
GUMROAD_REDIRECT_URI=https://your-domain/api/platforms/oauth/gumroad/callback
```

**Gumroad API:**
- Base: `https://api.gumroad.com/v2`
- Auth: Bearer token in header
- Rate limit: 120 requests/minute

### 3. Upstash Integration

**What's Already Done:**
- ✅ Basic Redis client initialization
- ✅ Ping test

**What Needs Implementation:**
- Queue operations (LPUSH, RPOP, LLEN)
- Caching for API responses
- Rate limiting counters
- Job scheduling with delays

**Required Env Vars:**
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=your_token
```

**Operations:**
- Queue: Job enqueueing/dequeueing
- Cache: API response caching (5-60 min TTL)
- Rate limit: Per-user request counters
- Scheduling: Delayed job execution

### 4. Resend Integration

**What's Already Done:**
- ✅ Resend client initialization
- ✅ Email sending wrapper

**What Needs Implementation:**
- Email templates
- Transactional email sending
- Error handling and retries
- Email type routing

**Required Env Vars:**
```env
RESEND_API_KEY=your_api_key
FROM_EMAIL=noreply@authorstack.com
```

**Email Templates:**
1. Signup confirmation
2. Password reset
3. Subscription updated
4. Ingestion completed
5. Ingestion failed

## Implementation Order

1. **Whop** - Already has webhook, just add API calls
2. **Resend** - Simple, no dependencies
3. **Upstash** - Needed for queue operations
4. **Gumroad** - Most complex, depends on OAuth

## Testing Strategy

### Unit Tests
- Mock API responses
- Test error handling
- Test data transformation

### Integration Tests
- Real API calls with test credentials
- Verify data storage
- Check email delivery

### E2E Tests
- Full flow: signup → connect platform → sync sales → receive email

## Deployment

### Prerequisites
- All env vars set in Vercel
- API credentials from each service
- Webhook URLs configured

### Verification
```bash
# Test Whop
curl https://your-domain/api/healthz

# Test Gumroad OAuth
curl https://your-domain/api/platforms/oauth/gumroad/start

# Test Resend
# Check email logs in Resend dashboard

# Test Upstash
# Check Redis operations in Upstash dashboard
```

## Rollback Plan

If integration fails:
1. Revert to placeholder mode
2. Set feature flags to disable integration
3. Check logs in Vercel/Sentry
4. Fix and redeploy

## Success Criteria

- ✅ All real API calls working
- ✅ Data flowing end-to-end
- ✅ Emails sending successfully
- ✅ Queue operations reliable
- ✅ No 404s or errors
- ✅ Logs show successful operations
- ✅ Database populated with real data

## Timeline

- **Whop**: 30 min
- **Resend**: 20 min
- **Upstash**: 30 min
- **Gumroad**: 60 min
- **Testing**: 30 min
- **Total**: ~3 hours

## Next Steps After STEP 8

1. **STEP 9** - Dashboard widgets with real data
2. **STEP 10** - Analytics and reporting
3. **STEP 11** - Performance optimization
4. **STEP 12** - Production hardening

---

**Status:** Ready for implementation
**Estimated Duration:** 3 hours
**Complexity:** Medium-High
