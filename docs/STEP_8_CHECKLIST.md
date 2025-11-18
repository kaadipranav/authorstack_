# STEP 8 — Real Integrations Checklist

## Pre-Implementation

### Environment Variables Needed

**Whop**
- [ ] `WHOP_API_KEY` - API key from Whop dashboard
- [ ] `WHOP_WEBHOOK_SECRET` - Webhook secret for signature verification

**Gumroad**
- [ ] `GUMROAD_CLIENT_ID` - OAuth client ID
- [ ] `GUMROAD_CLIENT_SECRET` - OAuth client secret
- [ ] `GUMROAD_REDIRECT_URI` - Callback URL (e.g., `https://your-domain/api/platforms/oauth/gumroad/callback`)

**Upstash**
- [ ] `UPSTASH_REDIS_REST_URL` - Redis REST endpoint
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Redis auth token

**Resend**
- [ ] `RESEND_API_KEY` - Email API key
- [ ] `FROM_EMAIL` - Sender email address

### Verification

- [ ] All env vars added to `.env.local` (local dev)
- [ ] All env vars added to Vercel dashboard (production)
- [ ] Credentials are valid and active
- [ ] API rate limits understood
- [ ] Webhook URLs configured in each service

## Implementation Tasks

### Phase 1: Whop Real Integration

**File:** `lib/payments/whop.ts`

- [ ] Implement `fetchWhopCustomer(customerId)` - Get customer details
- [ ] Implement `fetchWhopMemberships(customerId)` - List customer memberships
- [ ] Implement `fetchWhopMembershipDetails(membershipId)` - Get membership details
- [ ] Implement `validateWhopWebhookSignature()` - Real HMAC verification
- [ ] Add error handling for API failures
- [ ] Add retry logic for rate limits
- [ ] Add logging for debugging

**File:** `lib/payments/whop-service.ts`

- [ ] Implement `syncWhopSubscriptions(profileId)` - Fetch and store subscriptions
- [ ] Implement `handleWhopWebhookWithRealSignature()` - Verify real signatures
- [ ] Add tests for API calls

**Tests:**
- [ ] Test customer fetch
- [ ] Test membership list
- [ ] Test signature verification
- [ ] Test error handling

### Phase 2: Resend Real Integration

**File:** `lib/email/resend.ts`

- [ ] Implement `sendSignupConfirmation(email, confirmationUrl)`
- [ ] Implement `sendPasswordReset(email, resetUrl)`
- [ ] Implement `sendSubscriptionUpdated(email, tier, planName)`
- [ ] Implement `sendIngestionCompleted(email, jobId, eventCount)`
- [ ] Implement `sendIngestionFailed(email, jobId, errorMessage)`
- [ ] Add error handling and retries
- [ ] Add logging for email delivery
- [ ] Add unsubscribe links

**Email Templates:**
- [ ] Signup confirmation template
- [ ] Password reset template
- [ ] Subscription updated template
- [ ] Ingestion completed template
- [ ] Ingestion failed template

**Tests:**
- [ ] Test email sending
- [ ] Test template rendering
- [ ] Test error handling
- [ ] Verify emails in Resend dashboard

### Phase 3: Upstash Real Integration

**File:** `lib/cache/redis.ts`

- [ ] Implement `enqueueJob(jobId)` - Add to queue
- [ ] Implement `dequeueJob()` - Remove from queue
- [ ] Implement `cacheApiResponse(key, data, ttl)` - Cache API responses
- [ ] Implement `getCachedResponse(key)` - Retrieve cached data
- [ ] Implement `incrementRateLimit(userId)` - Rate limiting counter
- [ ] Implement `scheduleJob(jobId, delayMs)` - Delayed execution
- [ ] Add error handling for Redis failures
- [ ] Add logging for cache hits/misses

**Tests:**
- [ ] Test queue operations
- [ ] Test caching
- [ ] Test rate limiting
- [ ] Test job scheduling

### Phase 4: Gumroad Real Integration

**File:** `lib/platforms/gumroad.ts` (new)

- [ ] Implement `exchangeGumroadCode(code)` - OAuth token exchange
- [ ] Implement `refreshGumroadToken(refreshToken)` - Token refresh
- [ ] Implement `fetchGumroadProducts(accessToken)` - List products
- [ ] Implement `fetchGumroadSales(accessToken, productId)` - List sales
- [ ] Implement `fetchGumroadSalesWithPagination()` - Handle pagination
- [ ] Add rate limiting (120 req/min)
- [ ] Add error handling for API failures
- [ ] Add logging for debugging

**File:** `app/api/platforms/oauth/gumroad/callback/route.ts`

- [ ] Implement real OAuth callback handling
- [ ] Exchange code for token
- [ ] Store token in platform_connections
- [ ] Link to profile
- [ ] Trigger initial sync

**File:** `lib/ingestion/handlers.ts`

- [ ] Replace `handleGumroadIngestion()` with real implementation
- [ ] Fetch products and sales
- [ ] Parse into sales_events
- [ ] Handle pagination
- [ ] Handle errors gracefully

**Tests:**
- [ ] Test OAuth flow
- [ ] Test token exchange
- [ ] Test product fetch
- [ ] Test sales fetch
- [ ] Test pagination
- [ ] Test error handling

### Phase 5: Amazon KDP Real Integration

**File:** `lib/ingestion/handlers.ts`

- [ ] Implement CSV parsing for KDP reports
- [ ] Extract book title, ASIN, sales data
- [ ] Create sales_events from CSV data
- [ ] Handle different KDP report formats
- [ ] Add error handling for malformed CSV

**Tests:**
- [ ] Test CSV parsing
- [ ] Test data extraction
- [ ] Test error handling

## Integration Points

### Ingestion Pipeline

- [ ] Update `processIngestionJob()` to use real handlers
- [ ] Update `handleAmazonKdpIngestion()` to parse CSV
- [ ] Update `handleGumroadIngestion()` to fetch from API
- [ ] Verify jobs complete successfully
- [ ] Check sales_events table populated

### Email Notifications

- [ ] Send email on signup
- [ ] Send email on password reset
- [ ] Send email on subscription update
- [ ] Send email on ingestion completion
- [ ] Send email on ingestion failure

### Caching

- [ ] Cache Gumroad API responses
- [ ] Cache Whop customer data
- [ ] Implement cache invalidation
- [ ] Monitor cache hit rates

### Rate Limiting

- [ ] Implement per-user rate limiting
- [ ] Implement per-API rate limiting
- [ ] Return 429 on rate limit exceeded
- [ ] Add retry-after headers

## Testing

### Local Testing

- [ ] Set all env vars in `.env.local`
- [ ] Start dev server: `npm run dev`
- [ ] Test each integration manually
- [ ] Check logs for errors
- [ ] Verify database updates

### Integration Testing

- [ ] Test full signup flow
- [ ] Test OAuth connection
- [ ] Test ingestion pipeline
- [ ] Test email delivery
- [ ] Test error scenarios

### Production Testing

- [ ] Deploy to staging environment
- [ ] Set env vars in Vercel staging
- [ ] Run full test suite
- [ ] Monitor logs for errors
- [ ] Verify data accuracy

## Verification Queries

### Whop
```sql
SELECT * FROM whop_subscriptions WHERE profile_id = 'user_id';
SELECT * FROM profiles WHERE id = 'user_id' AND subscription_tier != 'free';
```

### Gumroad
```sql
SELECT * FROM platform_connections WHERE provider = 'gumroad' AND profile_id = 'user_id';
SELECT * FROM sales_events WHERE profile_id = 'user_id' AND platform = 'gumroad';
```

### Resend
- Check Resend dashboard for email delivery
- Verify email content and formatting
- Check bounce/complaint rates

### Upstash
- Check Redis operations in Upstash dashboard
- Verify queue operations
- Check cache hit rates
- Monitor rate limiting

## Rollback Plan

If any integration fails:

1. **Identify Issue**
   - [ ] Check Vercel logs
   - [ ] Check Sentry errors
   - [ ] Check database state

2. **Rollback**
   - [ ] Revert to previous commit
   - [ ] Disable integration via feature flag
   - [ ] Restore placeholder code

3. **Fix**
   - [ ] Debug in local environment
   - [ ] Add logging
   - [ ] Test thoroughly
   - [ ] Redeploy

## Success Criteria

- [ ] All API calls working
- [ ] Data flowing end-to-end
- [ ] Emails sending successfully
- [ ] Queue operations reliable
- [ ] No 404s or errors
- [ ] Logs show successful operations
- [ ] Database populated with real data
- [ ] Performance acceptable
- [ ] Error handling robust

## Deployment

### Pre-Deployment

- [ ] All code reviewed
- [ ] All tests passing
- [ ] All env vars set
- [ ] Webhooks configured
- [ ] Rollback plan ready

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor logs
- [ ] Deploy to production
- [ ] Monitor production logs

### Post-Deployment

- [ ] Verify all integrations working
- [ ] Check data accuracy
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Notify team of changes

## Documentation

- [ ] Update README with real integration details
- [ ] Document API credentials needed
- [ ] Document webhook URLs
- [ ] Document rate limits
- [ ] Document error codes
- [ ] Create troubleshooting guide

## Timeline

| Task | Estimated | Actual |
|------|-----------|--------|
| Whop | 30 min | |
| Resend | 20 min | |
| Upstash | 30 min | |
| Gumroad | 60 min | |
| Testing | 30 min | |
| **Total** | **3 hours** | |

---

**Status:** Ready for implementation
**Start Date:** [To be filled]
**Completion Date:** [To be filled]
