# Whop Subscription Integration — STEP 7

## Overview

AuthorStack integrates with Whop for subscription management. This document covers the webhook handler, subscription updates, and signature verification (mock mode).

## Architecture

### Components

**1. Whop Service** (`lib/payments/whop-service.ts`)
- Subscription data management
- Profile tier updates
- Whop customer linking
- Event processing

**2. Webhook Handler** (`lib/payments/whop-webhook.ts`)
- Signature verification (mock mode)
- Webhook header extraction
- Event logging

**3. Webhook Route** (`app/api/webhooks/whop/route.ts`)
- Receives Whop webhook events
- Validates signatures
- Processes subscription events
- Logs all events for audit trail

## Subscription Flow

```
1. User signs up for plan on Whop
   ↓
2. Whop sends webhook to /api/webhooks/whop
   ↓
3. Signature verified (or mocked)
   ↓
4. Customer linked to profile
   ↓
5. Subscription stored in whop_subscriptions table
   ↓
6. Profile subscription_tier updated (free/pro/enterprise)
   ↓
7. Event logged to platform_webhook_events table
```

## API Endpoint

### POST `/api/webhooks/whop`

**Purpose:** Receive and process Whop subscription events

**Headers:**
- `x-whop-signature` - HMAC-SHA256 signature (optional in mock mode)
- `x-whop-timestamp` - ISO timestamp of webhook

**Request Body:**
```json
{
  "id": "webhook_123",
  "event": "membership.created",
  "data": {
    "id": "membership_456",
    "customer_id": "customer_789",
    "membership_id": "membership_456",
    "plan": {
      "name": "Pro Plan"
    },
    "status": "active",
    "current_period_end": "2025-02-18T10:30:00Z"
  },
  "timestamp": "2025-01-18T10:30:00Z"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Subscription updated: pro",
  "profileId": "user_uuid"
}
```

**Response (Ignored Event):**
```json
{
  "status": "acknowledged",
  "message": "Event payment.received acknowledged but not processed"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Failed to process subscription event",
  "error": "PROFILE_NOT_FOUND"
}
```

## Supported Events

The webhook handler processes these Whop events:

- `membership.created` - New subscription created
- `membership.updated` - Subscription updated
- `membership.cancelled` - Subscription cancelled
- `membership.paused` - Subscription paused
- `membership.resumed` - Subscription resumed
- `charge.succeeded` - Payment successful
- `charge.failed` - Payment failed

Other events are acknowledged but not processed.

## Subscription Tiers

Tiers are automatically mapped from Whop plan names:

| Status | Plan Name | Tier |
|--------|-----------|------|
| active | Pro Plan | pro |
| active | Enterprise Plan | enterprise |
| active | Any other | pro |
| cancelled | Any | free |
| inactive | Any | free |
| past_due | Any | free |

## Signature Verification

### Mock Mode (Current)

When `WHOP_WEBHOOK_SECRET` is not set, signature verification is **skipped** and all webhooks are accepted.

```typescript
if (!env.WHOP_WEBHOOK_SECRET) {
  return {
    valid: true,
    reason: "Mock mode: signature verification disabled",
  };
}
```

### Production Mode

When `WHOP_WEBHOOK_SECRET` is set:

1. Extract signature and timestamp from headers
2. Verify timestamp is within 5 minutes
3. Create signed content: `{timestamp}.{payload}`
4. Compute HMAC-SHA256 with secret
5. Compare with provided signature using timing-safe comparison

```typescript
const signedContent = `${timestamp}.${payload}`;
const expectedSignature = crypto
  .createHmac("sha256", WHOP_WEBHOOK_SECRET)
  .update(signedContent)
  .digest("hex");

const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSignature)
);
```

## Database Schema

### `whop_subscriptions`
```sql
id UUID PRIMARY KEY
profile_id UUID (references profiles)
whop_membership_id TEXT UNIQUE
plan_name TEXT
status TEXT (active, inactive, cancelled, past_due)
current_period_end TIMESTAMPTZ
raw_payload JSONB
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### `platform_webhook_events`
```sql
id UUID PRIMARY KEY
profile_id UUID (nullable)
provider TEXT (e.g., "whop")
event_type TEXT (e.g., "membership.created")
delivery_status TEXT (received, processed, failed)
signature TEXT
payload JSONB
received_at TIMESTAMPTZ
processed_at TIMESTAMPTZ
error_message TEXT
```

### `profiles` (updated)
```sql
subscription_tier TEXT (free, pro, enterprise)
whop_customer_id TEXT
```

## Data Flow

### Event Processing

```typescript
// 1. Receive webhook
const event = await request.json();

// 2. Verify signature
const verification = await verifyWhopWebhookSignature(
  payload,
  signature,
  timestamp
);

// 3. Log event
await logWebhookEvent(
  "whop",
  event.event,
  profileId,
  signature,
  event,
  "received"
);

// 4. Process subscription event
const result = await processWhopSubscriptionEvent(event);

// 5. Update profile tier
await updateProfileSubscriptionTier(profileId, tier);

// 6. Log result
await logWebhookEvent(
  "whop",
  event.event,
  profileId,
  signature,
  event,
  "processed"
);
```

## Environment Variables

```env
# Whop API
WHOP_API_KEY=your_api_key

# Webhook Security (optional for mock mode)
WHOP_WEBHOOK_SECRET=your_webhook_secret
```

## Testing

### 1. Manual Webhook Test

```bash
curl -X POST http://localhost:3000/api/webhooks/whop \
  -H "Content-Type: application/json" \
  -H "x-whop-timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  -d '{
    "id": "webhook_test",
    "event": "membership.created",
    "data": {
      "customer_id": "customer_123",
      "membership_id": "membership_456",
      "plan": { "name": "Pro Plan" },
      "status": "active",
      "current_period_end": "2025-02-18T10:30:00Z"
    }
  }'
```

### 2. Check Webhook Logs

```sql
SELECT * FROM platform_webhook_events
WHERE provider = 'whop'
ORDER BY received_at DESC
LIMIT 10;
```

### 3. Verify Subscription Updated

```sql
SELECT * FROM whop_subscriptions
WHERE whop_membership_id = 'membership_456';

SELECT subscription_tier FROM profiles
WHERE id = 'profile_uuid';
```

## Error Handling

All errors are logged with:
- Error message
- Event type
- Profile ID (if available)
- Full webhook payload
- Timestamp

Failed webhooks can be retried by Whop or manually via the webhook logs.

## Webhook Retry Logic

Whop automatically retries failed webhooks (4xx/5xx responses) with exponential backoff:
- 1st retry: 5 minutes
- 2nd retry: 30 minutes
- 3rd retry: 2 hours
- 4th retry: 5 hours
- 5th retry: 10 hours

To manually retry a webhook:
1. Check `platform_webhook_events` for failed events
2. Extract the payload
3. POST to `/api/webhooks/whop` with the same payload

## Monitoring

### Key Metrics

- Total webhooks received
- Successful vs failed processing
- Subscription tier distribution
- Webhook latency

### Queries

**Failed webhooks:**
```sql
SELECT * FROM platform_webhook_events
WHERE provider = 'whop' AND delivery_status = 'failed'
ORDER BY received_at DESC;
```

**Subscription status:**
```sql
SELECT subscription_tier, COUNT(*) as count
FROM profiles
GROUP BY subscription_tier;
```

**Recent events:**
```sql
SELECT event_type, delivery_status, COUNT(*) as count
FROM platform_webhook_events
WHERE provider = 'whop'
AND received_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type, delivery_status;
```

## Deployment

### Vercel Setup

1. Set environment variables:
   ```
   WHOP_API_KEY=your_api_key
   WHOP_WEBHOOK_SECRET=your_webhook_secret (optional)
   ```

2. Configure webhook in Whop dashboard:
   - **Endpoint:** `https://your-domain.vercel.app/api/webhooks/whop`
   - **Events:** Select subscription/membership events
   - **Secret:** Use same value as `WHOP_WEBHOOK_SECRET`

3. Deploy to Vercel

### Local Testing

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Use ngrok to expose local server:
   ```bash
   ngrok http 3000
   ```

3. Configure Whop webhook to ngrok URL

4. Test with curl or Whop dashboard webhook tester

## Security Considerations

1. **Signature Verification** - Always verify signatures in production
2. **Timestamp Validation** - Reject old webhooks (>5 minutes)
3. **Timing-Safe Comparison** - Use `crypto.timingSafeEqual()` to prevent timing attacks
4. **Rate Limiting** - Consider adding rate limits to webhook endpoint
5. **Audit Trail** - All events logged for compliance

## Future Enhancements

1. **Webhook Retries** - Implement automatic retry queue for failed events
2. **Idempotency** - Add idempotency keys to prevent duplicate processing
3. **Webhook Verification UI** - Dashboard to view/retry webhooks
4. **Subscription Analytics** - Track churn, MRR, LTV
5. **Downgrade Handling** - Special logic for plan downgrades
6. **Proration** - Calculate prorated charges for mid-cycle changes

## Troubleshooting

### Webhook Not Received

- Check Whop dashboard webhook logs
- Verify endpoint URL is correct
- Check firewall/CORS settings
- Verify Vercel deployment is live

### Signature Verification Failed

- Verify `WHOP_WEBHOOK_SECRET` matches Whop dashboard
- Check timestamp is within 5 minutes
- Verify payload hasn't been modified

### Profile Not Found

- Ensure user has `whop_customer_id` set
- Check customer ID matches Whop dashboard
- Verify profile exists in database

### Subscription Tier Not Updated

- Check `whop_subscriptions` table for record
- Verify plan name mapping logic
- Check `profiles.subscription_tier` column

## Support

For issues or questions:
1. Check webhook logs in database
2. Review error messages in Vercel logs
3. Verify environment variables are set
4. Test with curl or Postman

---

**Status:** Production Ready (Mock Mode)
**Last Updated:** November 18, 2025
