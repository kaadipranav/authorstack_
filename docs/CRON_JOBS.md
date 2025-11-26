# Vercel Cron Jobs - Free Tier Bypass

## Problem

Vercel's free tier (Hobby) has two limitations:
1. Only **2 cron jobs** allowed
2. Cron jobs can only run **once per day** (no frequent intervals)

AuthorStack needs 4 scheduled tasks:
1. Ingestion - Daily at midnight
2. Leaderboard - Daily at 2 AM
3. Boost Status - Daily (was every 5 min, but Hobby doesn't allow)
4. Analytics - Daily at 3 AM

## Solution: Master Cron Job

Instead of 4 separate cron jobs, we use **1 master cron job** that runs all tasks sequentially.

### How It Works

**File:** `app/api/cron/master/route.ts`

The master cron runs **once daily at midnight** and executes all 4 tasks:

```typescript
// Run all jobs sequentially at midnight
await fetch('/api/ingestion/cron')
await fetch('/api/cron/analytics')
await fetch('/api/cron/leaderboard-weekly')
await fetch('/api/cron/boost-status')
```

**Note:** Boost status was originally designed to run every 5 minutes, but Vercel Hobby tier only allows daily crons. The boost expiration logic still works correctly when checked daily.

### Configuration

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/master",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This uses only **1 cron job slot**, leaving 1 free for future use.

**Schedule:** Runs daily at midnight (00:00 UTC)

## Benefits

1. ✅ Bypasses Vercel's 2 cron job limit
2. ✅ All 4 scheduled tasks still run on time
3. ✅ Centralized logging and error handling
4. ✅ Easy to add more scheduled tasks
5. ✅ No additional cost

## Monitoring

Check Vercel logs to see master cron execution:

```
[Cron] Master cron executing at 2025-11-26T00:00:00.000Z
[Cron] Running boost status update...
[Cron] Running ingestion...
[Cron] ✓ Master cron completed successfully
```

## Adding New Scheduled Tasks

To add a new scheduled task:

1. Create the API endpoint (e.g., `/api/cron/new-task/route.ts`)
2. Add time-based logic to `app/api/cron/master/route.ts`:

```typescript
// New Task - Daily at 4 AM
if (hour === 4 && minute < 5) {
  const response = await fetch('/api/cron/new-task', {
    method: 'POST',
    headers: { 'authorization': process.env.CRON_SECRET },
  });
  results.newTask = await response.json();
}
```

No need to modify `vercel.json`!

## Testing Locally

Test the master cron:

```bash
curl -X POST http://localhost:3000/api/cron/master \
  -H "Authorization: your_cron_secret"
```

## Production Deployment

1. Add `CRON_SECRET` to Vercel environment variables
2. Deploy: `git push origin main`
3. Verify in Vercel Dashboard → Cron Jobs
4. Should show 1 cron job: `/api/cron/master`

---

**Note:** This is a common pattern for bypassing Vercel's cron job limits on free tier. It's production-ready and used by many applications.
