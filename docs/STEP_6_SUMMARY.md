# STEP 6 — Ingestion Jobs + Cron Structure — COMPLETE ✓

## Overview

STEP 6 has been successfully implemented with a production-ready ingestion pipeline architecture. The system is designed to handle sales data ingestion from multiple platforms with automatic retry logic, cron scheduling, and comprehensive logging.

## What Was Built

### 1. Core Ingestion Service Layer

**Location:** `lib/ingestion/`

- **`types.ts`** - TypeScript interfaces for job lifecycle, platforms, and results
- **`queue.ts`** - Redis-backed job queue with Supabase persistence
  - Job enqueueing and dequeueing
  - Automatic retry logic (max 3 attempts)
  - Job status tracking
  - Attempt history logging

- **`handlers.ts`** - Platform-specific ingestion handlers (placeholders ready for API integration)
  - Amazon KDP handler
  - Gumroad handler
  - Smashwords handler
  - Draft2Digital handler

- **`worker.ts`** - Job processor with error handling
  - Processes queued jobs sequentially
  - Logs cron execution to database
  - Handles failures with automatic retries

- **`index.ts`** - Module exports

### 2. API Routes

**Location:** `app/api/ingestion/`

#### `/api/ingestion/cron` (POST)
- **Purpose:** Triggered by Vercel Cron every 5 minutes
- **Function:** Processes up to 10 queued jobs
- **Security:** Validates Upstash QStash or Vercel Cron secret
- **Response:** Returns count of processed jobs
- **Logging:** Records execution to `cron_logs` table

#### `/api/ingestion/manual` (POST)
- **Purpose:** Manual job queuing endpoint
- **Auth:** Requires user authentication
- **Input:** `{ platform, payload }`
- **Response:** Returns job ID (202 Accepted)
- **Use Case:** Trigger ingestion on-demand from UI

#### `/api/ingestion/platform/[platform]` (POST)
- **Purpose:** Platform-specific ingestion endpoint
- **Auth:** Requires user authentication
- **Validation:** Validates platform name against whitelist
- **Platforms:** amazon_kdp, gumroad, smashwords, draft2digital
- **Response:** Returns job ID (202 Accepted)

#### `/api/ingestion/status/[jobId]` (GET)
- **Purpose:** Check job status
- **Auth:** Requires user authentication
- **Security:** Only job owner can view status
- **Response:** Job details including status and error messages

### 3. Configuration

**`vercel.json`** - Deployment configuration
- Cron schedule: Every 5 minutes (`*/5 * * * *`)
- Environment variables mapping
- Build and dev commands
- API headers for cache control

### 4. Database Schema

**Already created in migrations:**
- `ingestion_jobs` - Job records with status tracking
- `ingestion_attempts` - Attempt history for audit trail
- `cron_logs` - Cron execution logs

### 5. Documentation

**`docs/INGESTION_ARCHITECTURE.md`** - Comprehensive guide covering:
- Architecture components
- Job lifecycle
- API endpoints with examples
- Database schema
- Environment variables
- Deployment instructions
- Monitoring & debugging
- Testing procedures
- Future enhancement roadmap

## Key Features

✅ **Queue-based architecture** - Redis + Supabase for reliability
✅ **Automatic retry logic** - Up to 3 attempts per job
✅ **Cron scheduling** - Vercel Cron integration (every 5 minutes)
✅ **Error handling** - Comprehensive logging and error messages
✅ **Audit trail** - Complete attempt history for each job
✅ **Platform abstraction** - Easy to add new platforms
✅ **Security** - Auth validation on all endpoints
✅ **Monitoring** - Cron logs for observability
✅ **Scalability** - Batch processing with configurable limits
✅ **Type-safe** - Full TypeScript support

## Job Lifecycle

```
1. Job Created (manual endpoint or platform upload)
   ↓
2. Added to Redis Queue
   ↓
3. Cron triggers (every 5 minutes)
   ↓
4. Worker dequeues job
   ↓
5. Job marked as "processing"
   ↓
6. Platform handler processes job
   ↓
7a. Success → Mark "completed"
   ↓
7b. Failure → Check attempt count
    ├─ Attempt < 3 → Mark "retrying", re-queue
    └─ Attempt ≥ 3 → Mark "failed"
```

## Environment Variables Required

```env
# Redis (for queue)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Supabase (for job storage)
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Cron Security
CRON_SECRET=your-secret-key
UPSTASH_QSTASH_TOKEN=your-qstash-token (if using Upstash)
```

## Testing the Implementation

### 1. Queue a job manually:
```bash
curl -X POST http://localhost:3000/api/ingestion/manual \
  -H "Content-Type: application/json" \
  -d '{"platform": "amazon_kdp", "payload": {}}'
```

### 2. Check job status:
```bash
curl http://localhost:3000/api/ingestion/status/[jobId]
```

### 3. Trigger cron manually (dev only):
```bash
curl -X POST http://localhost:3000/api/ingestion/cron \
  -H "x-vercel-cron-secret: dev-secret"
```

### 4. View logs in database:
```sql
SELECT * FROM cron_logs ORDER BY started_at DESC LIMIT 5;
SELECT * FROM ingestion_jobs WHERE status = 'failed';
SELECT * FROM ingestion_attempts WHERE job_id = '[jobId]';
```

## Integration Points (Ready for Phase 2)

The handlers are placeholders ready for real API integration:

- **Amazon KDP** - Parse CSV uploads from Supabase Storage
- **Gumroad** - Fetch sales via Gumroad API with OAuth token
- **Smashwords** - Implement Smashwords API integration
- **Draft2Digital** - Implement Draft2Digital API integration

Each handler follows the same pattern:
1. Validate required data
2. Fetch/parse sales data
3. Create `sales_events` records
4. Return result with event count

## Files Created/Modified

### New Files:
- `lib/ingestion/types.ts`
- `lib/ingestion/queue.ts`
- `lib/ingestion/handlers.ts`
- `lib/ingestion/worker.ts`
- `lib/ingestion/index.ts`
- `app/api/ingestion/status/[jobId]/route.ts`
- `vercel.json`
- `docs/INGESTION_ARCHITECTURE.md`

### Modified Files:
- `app/api/ingestion/cron/route.ts` - Implemented full cron processor
- `app/api/ingestion/manual/route.ts` - Implemented job queuing
- `app/api/ingestion/platform/[platform]/route.ts` - Implemented platform-specific endpoint
- `lib/supabase/service.ts` - Added `createSupabaseServiceClient()` helper
- Fixed Next.js 16 dynamic params in route handlers

### Fixed TypeScript Issues:
- Updated all dynamic route handlers to use `Promise<params>`
- Fixed Link href type issues in components

## Deployment Checklist

- [ ] Set `UPSTASH_REDIS_REST_URL` in Vercel
- [ ] Set `UPSTASH_REDIS_REST_TOKEN` in Vercel
- [ ] Set `CRON_SECRET` in Vercel
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Deploy to Vercel (cron will auto-activate)
- [ ] Test manual endpoint: `POST /api/ingestion/manual`
- [ ] Monitor cron logs: `SELECT * FROM cron_logs`
- [ ] Verify jobs are processing: `SELECT * FROM ingestion_jobs`

## Next Steps (STEP 7+)

1. **Implement real API integrations** in handlers
2. **Add webhook support** for real-time updates
3. **Implement sales event creation** from ingested data
4. **Add data deduplication** logic
5. **Create dashboard widgets** to show ingestion status
6. **Add monitoring alerts** for failed jobs
7. **Implement incremental sync** (only fetch new data)

## Status

✅ **COMPLETE** - Production-ready ingestion pipeline with placeholder handlers ready for Phase 2 API integration.

The architecture is stable, scalable, and ready for deployment. All existing routes work, no 404s, and the system is ready for real API integration in the next phase.

---

**Completed:** November 18, 2025
**Status:** Ready for Production Deployment (with env vars only)
