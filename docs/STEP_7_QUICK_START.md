# STEP 7 — Whop Integration — Quick Start Guide

## What Was Built

A production-ready Whop webhook handler that:
- ✅ Receives subscription events from Whop
- ✅ Verifies signatures (mock mode for dev, HMAC-SHA256 for prod)
- ✅ Updates user subscription tiers automatically
- ✅ Logs all events for audit trail
- ✅ Handles errors gracefully

## Files Created

```
lib/payments/
  ├── whop-service.ts       # Subscription management
  └── whop-webhook.ts       # Signature verification

app/api/webhooks/
  └── whop/
      └── route.ts          # Webhook handler

docs/
  ├── WHOP_INTEGRATION.md   # Full documentation
  ├── STEP_7_SUMMARY.md     # Detailed summary
  └── STEP_7_QUICK_START.md # This file
```

## Quick Setup

### 1. Local Development (Mock Mode)

No secrets needed! Just start the server:

```bash
npm run dev
```

Test with curl:
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

Expected response:
```json
{
  "status": "success",
  "message": "Subscription updated: pro",
  "profileId": "user_uuid"
}
```

### 2. Production Deployment

Set environment variables in Vercel:

```env
WHOP_API_KEY=your_api_key
WHOP_WEBHOOK_SECRET=your_webhook_secret
```

Configure webhook in Whop dashboard:
- **Endpoint:** `https://your-domain.vercel.app/api/webhooks/whop`
- **Events:** Select membership/subscription events
- **Secret:** Use same value as `WHOP_WEBHOOK_SECRET`

Deploy:
```bash
git push origin main
```

## How It Works

### Subscription Flow

```
User purchases plan on Whop
        ↓
Whop sends webhook to /api/webhooks/whop
        ↓
Signature verified (mock or HMAC-SHA256)
        ↓
Profile linked to Whop customer
        ↓
Subscription stored in database
        ↓
Profile tier updated (free/pro/enterprise)
        ↓
Event logged for audit trail
```

### Tier Mapping

| Plan Name | Status | Result |
|-----------|--------|--------|
| Pro Plan | active | pro |
| Enterprise Plan | active | enterprise |
| Any | cancelled | free |
| Any | inactive | free |

## Webhook Events Processed

- `membership.created` - New subscription
- `membership.updated` - Subscription changed
- `membership.cancelled` - Subscription cancelled
- `membership.paused` - Subscription paused
- `membership.resumed` - Subscription resumed
- `charge.succeeded` - Payment successful
- `charge.failed` - Payment failed

## Testing

### Check Webhook Logs

```sql
SELECT * FROM platform_webhook_events
WHERE provider = 'whop'
ORDER BY received_at DESC LIMIT 5;
```

### Check Subscription

```sql
SELECT * FROM whop_subscriptions
WHERE whop_membership_id = 'membership_456';
```

### Check Profile Tier

```sql
SELECT id, subscription_tier, whop_customer_id
FROM profiles
WHERE whop_customer_id = 'customer_123';
```

## Error Handling

All errors are logged with:
- Error message
- Event type
- Profile ID
- Full webhook payload
- Timestamp

Failed webhooks can be retried by Whop or manually from logs.

## Security

### Mock Mode (Development)
- No secrets required
- All webhooks accepted
- Perfect for testing

### Production Mode
- HMAC-SHA256 signature verification
- Timestamp validation (5-minute window)
- Timing-safe comparison prevents timing attacks

## Common Issues

**"Profile not found"**
- Ensure user has `whop_customer_id` set
- Check customer ID matches Whop dashboard

**"Signature verification failed"**
- Verify `WHOP_WEBHOOK_SECRET` matches Whop dashboard
- Check timestamp is within 5 minutes

**"Subscription tier not updated"**
- Check `whop_subscriptions` table for record
- Verify plan name mapping logic
- Check `profiles.subscription_tier` column

## Next Steps

1. ✅ Test webhook locally with curl
2. ✅ Verify logs in database
3. ✅ Deploy to Vercel
4. ✅ Configure webhook in Whop dashboard
5. ✅ Test with real Whop events
6. ✅ Monitor logs for errors

## Documentation

- **Full Guide:** `docs/WHOP_INTEGRATION.md`
- **Detailed Summary:** `docs/STEP_7_SUMMARY.md`
- **This Guide:** `docs/STEP_7_QUICK_START.md`

## Status

✅ **COMPLETE** - Production-ready Whop integration with mock mode for development.

---

**Completed:** November 18, 2025
**Mode:** Mock Mode (Development) / Production Mode (with secret)
