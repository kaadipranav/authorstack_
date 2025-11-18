import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { redis } from "@/lib/cache/redis";
import { IngestionJob, IngestionJobStatus } from "./types";

const QUEUE_KEY = "ingestion:queue";
const PROCESSING_KEY = "ingestion:processing";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export async function enqueueJob(
  profileId: string,
  platform: string,
  payload: Record<string, unknown>
): Promise<string> {
  const supabase = await createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("ingestion_jobs")
    .insert({
      profile_id: profileId,
      platform,
      status: "pending",
      payload,
      scheduled_for: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to enqueue job: ${error.message}`);
  }

  if (redis) {
    await redis.lpush(QUEUE_KEY, data.id);
  }

  return data.id;
}

export async function dequeueJob(): Promise<IngestionJob | null> {
  if (!redis) {
    return null;
  }

  const jobId = await redis.rpop(QUEUE_KEY);
  if (!jobId) {
    return null;
  }

  const supabase = await createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("ingestion_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !data) {
    return null;
  }

  await redis.sadd(PROCESSING_KEY, jobId);
  return data as IngestionJob;
}

export async function markJobProcessing(jobId: string): Promise<void> {
  const supabase = await createSupabaseServiceClient();
  await supabase
    .from("ingestion_jobs")
    .update({ status: "processing" })
    .eq("id", jobId);
}

export async function markJobCompleted(jobId: string, salesEventsCreated: number = 0): Promise<void> {
  const supabase = await createSupabaseServiceClient();
  await supabase
    .from("ingestion_jobs")
    .update({
      status: "completed",
      executed_at: new Date().toISOString(),
      payload: { salesEventsCreated },
    })
    .eq("id", jobId);

  if (redis) {
    await redis.srem(PROCESSING_KEY, jobId);
  }
}

export async function markJobFailed(jobId: string, errorMessage: string, attemptNumber: number): Promise<boolean> {
  const supabase = await createSupabaseServiceClient();

  if (attemptNumber < MAX_RETRIES) {
    await supabase
      .from("ingestion_jobs")
      .update({ status: "retrying", error_message: errorMessage })
      .eq("id", jobId);

    if (redis) {
      await redis.lpush(QUEUE_KEY, jobId);
      await redis.srem(PROCESSING_KEY, jobId);
    }
    return true;
  }

  await supabase
    .from("ingestion_jobs")
    .update({
      status: "failed",
      error_message: errorMessage,
      executed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (redis) {
    await redis.srem(PROCESSING_KEY, jobId);
  }
  return false;
}

export async function recordAttempt(
  jobId: string,
  attemptNumber: number,
  status: IngestionJobStatus,
  errorMessage?: string
): Promise<void> {
  const supabase = await createSupabaseServiceClient();
  await supabase.from("ingestion_attempts").insert({
    job_id: jobId,
    attempt_number: attemptNumber,
    status,
    error_message: errorMessage || null,
    finished_at: new Date().toISOString(),
  });
}

export async function getPendingJobs(limit: number = 10): Promise<IngestionJob[]> {
  const supabase = await createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("ingestion_jobs")
    .select("*")
    .in("status", ["pending", "retrying"])
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch pending jobs:", error);
    return [];
  }

  return (data || []) as IngestionJob[];
}

export async function getJobStatus(jobId: string): Promise<IngestionJob | null> {
  const supabase = await createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("ingestion_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    return null;
  }

  return data as IngestionJob;
}
