# AuthorStack Ingestion Pipeline Architecture

## Overview

The ingestion pipeline is a production-ready, scalable system for processing sales data from multiple platforms (Amazon KDP, Gumroad, Smashwords, Draft2Digital). It uses a queue-based architecture with retry logic, cron scheduling, and comprehensive logging.

## Architecture Components

### 1. Queue System (`lib/ingestion/queue.ts`)

Manages job lifecycle using Redis and Supabase:

- **`enqueueJob()`** - Creates a new ingestion job and adds it to Redis queue
- **`dequeueJob()`** - Retrieves next job from queue for processing
- **`markJobProcessing()`** - Updates job status to "processing"
- **`markJobCompleted()`** - Marks job as complete with sales event count
- **`markJobFailed()`** - Handles job failure with automatic retry logic
- **`recordAttempt()`** - Logs each attempt for audit trail
- **`getPendingJobs()`** - Fetches pending/retrying jobs from DB
- **`getJobStatus()`** - Retrieves job status by ID

**Retry Logic:**
- Maximum 3 attempts per job
- Failed jobs automatically re-queued if attempts < MAX_RETRIES
- Each attempt logged in `ingestion_attempts` table

### 2. Platform Handlers (`lib/ingestion/handlers.ts`)

Platform-specific ingestion logic (currently placeholders):

- **`handleAmazonKdpIngestion()`** - Parses KDP CSV uploads
- **`handleGumroadIngestion()`** - Fetches Gumroad sales via API
- **`handleSmashwordsIngestion()`** - Placeholder for Smashwords
- **`handleDraft2DigitalIngestion()`** - Placeholder for Draft2Digital
- **`getHandlerForPlatform()`** - Router to select correct handler

Each handler returns `IngestionResult` with:
```typescript
{
  success: boolean;
  jobId: string;
  message: string;
  salesEventsCreated?: number;
  error?: string;
}
```

### 3. Worker (`lib/ingestion/worker.ts`)

Processes jobs with error handling and logging:

- **`processIngestionJob(jobId)`** - Main job processor
  - Fetches job from DB
  - Tracks attempt number
  - Calls appropriate handler
  - Updates job status
  - Logs attempt result

- **`processQueuedJobs(maxJobs)`** - Batch processor
  - Dequeues up to N jobs
  - Processes each sequentially
  - Returns count of processed jobs

- **`logCronExecution()`** - Logs cron runs to `cron_logs` table

### 4. API Routes

#### `/api/ingestion/cron` (POST)
**Cron-triggered job processor**
- Validates authorization (Upstash QStash or Vercel Cron secret)
- Processes up to 10 queued jobs
- Logs execution to `cron_logs` table
- Returns job count processed

**Schedule:** Every 5 minutes (configured in `vercel.json`)

**Example Response:**
```json
{
  "status": "success",
  "message": "Processed 3 ingestion jobs",
  "jobsProcessed": 3
}
```

#### `/api/ingestion/manual` (POST)
**Manual job queuing endpoint**
- Requires authentication
- Accepts `{ platform, payload }`
- Returns job ID and status
- Returns 202 Accepted

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/ingestion/manual \
  -H "Content-Type: application/json" \
  -d '{"platform": "amazon_kdp", "payload": {"storagePath": "uploads/kdp-report.csv"}}'
```

**Example Response:**
```json
{
  "status": "queued",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Manual ingestion job queued for amazon_kdp"
}
```

#### `/api/ingestion/platform/[platform]` (POST)
**Platform-specific ingestion endpoint**
- Requires authentication
- Validates platform name
- Queues job with provided payload
- Returns 202 Accepted

**Valid Platforms:** `amazon_kdp`, `gumroad`, `smashwords`, `draft2digital`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/ingestion/platform/gumroad \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "gumroad_token_xyz"}'
```

#### `/api/ingestion/status/[jobId]` (GET)
**Check job status**
- Requires authentication
- Returns job details
- Only accessible by job owner

**Example Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "platform": "amazon_kdp",
  "status": "completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "executedAt": "2024-01-15T10:35:00Z",
  "errorMessage": null
}
```

## Database Schema

### `ingestion_jobs`
```sql
id UUID PRIMARY KEY
profile_id UUID (references profiles)
platform TEXT (amazon_kdp, gumroad, smashwords, draft2digital)
status TEXT (pending, processing, completed, failed, retrying)
payload JSONB (platform-specific data)
scheduled_for TIMESTAMPTZ
executed_at TIMESTAMPTZ
error_message TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### `ingestion_attempts`
```sql
id UUID PRIMARY KEY
job_id UUID (references ingestion_jobs)
attempt_number INTEGER
status TEXT (pending, processing, completed, failed, retrying)
started_at TIMESTAMPTZ
finished_at TIMESTAMPTZ
error_message TEXT
```

### `cron_logs`
```sql
id UUID PRIMARY KEY
job_name TEXT (e.g., "ingestion:process-queue")
status TEXT (started, completed, failed)
payload JSONB
started_at TIMESTAMPTZ
finished_at TIMESTAMPTZ
error_message TEXT
```

## Job Lifecycle

```
1. Job Created (via manual endpoint or platform upload)
   ↓
2. Added to Redis Queue
   ↓
3. Cron triggers every 5 minutes
   ↓
4. Worker dequeues job
   ↓
5. Job marked as "processing"
   ↓
6. Platform handler processes job
   ↓
7a. Success → Mark "completed", log attempt
   ↓
7b. Failure → Check attempt count
    ├─ Attempt < 3 → Mark "retrying", re-queue
    └─ Attempt ≥ 3 → Mark "failed", log error
```

## Environment Variables

Required for ingestion to work:

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

## Deployment

### Vercel Cron Setup

The `vercel.json` file configures automatic cron scheduling:

```json
{
  "crons": [
    {
      "path": "/api/ingestion/cron",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Schedule:** Every 5 minutes (adjust as needed)

### Environment Variables in Vercel

Set in Vercel Dashboard → Project Settings → Environment Variables:

1. `CRON_SECRET` - Random secret for cron validation
2. `UPSTASH_REDIS_REST_URL` - Redis connection
3. `UPSTASH_REDIS_REST_TOKEN` - Redis auth
4. `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key

## Monitoring & Debugging

### Check Job Status
```bash
curl http://localhost:3000/api/ingestion/status/[jobId]
```

### View Cron Logs
```sql
SELECT * FROM cron_logs 
ORDER BY started_at DESC 
LIMIT 20;
```

### View Job Attempts
```sql
SELECT * FROM ingestion_attempts 
WHERE job_id = '[jobId]'
ORDER BY attempt_number;
```

### View Failed Jobs
```sql
SELECT * FROM ingestion_jobs 
WHERE status = 'failed' 
ORDER BY updated_at DESC;
```

## Future Enhancements

### Phase 2: Real API Integration
- Implement actual Gumroad API calls
- Parse KDP CSV files
- Fetch Smashwords data
- Fetch Draft2Digital data

### Phase 3: Advanced Features
- Webhook support for real-time updates
- Incremental sync (only fetch new sales)
- Data deduplication
- Sales event aggregation
- Performance metrics tracking

### Phase 4: Optimization
- Parallel job processing
- Dead-letter queue for permanent failures
- Job prioritization
- Rate limiting per platform
- Webhook delivery retries

## Testing

### Manual Test Flow

1. **Create a job via manual endpoint:**
```bash
curl -X POST http://localhost:3000/api/ingestion/manual \
  -H "Content-Type: application/json" \
  -d '{"platform": "amazon_kdp", "payload": {}}'
```

2. **Check job status:**
```bash
curl http://localhost:3000/api/ingestion/status/[jobId]
```

3. **Trigger cron manually (dev only):**
```bash
curl -X POST http://localhost:3000/api/ingestion/cron \
  -H "x-vercel-cron-secret: dev-secret"
```

4. **Verify in database:**
```sql
SELECT * FROM ingestion_jobs WHERE id = '[jobId]';
SELECT * FROM ingestion_attempts WHERE job_id = '[jobId]';
SELECT * FROM cron_logs ORDER BY started_at DESC LIMIT 5;
```

## Error Handling

All errors are logged with:
- Error message
- Job ID
- Attempt number
- Timestamp
- Stack trace (in logs)

Failed jobs are automatically retried up to 3 times before being marked as permanently failed.

---

**Last Updated:** 2024-01-15
**Status:** Production Ready (Placeholders for API Integration)
