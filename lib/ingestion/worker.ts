import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  dequeueJob,
  markJobProcessing,
  markJobCompleted,
  markJobFailed,
  recordAttempt,
} from "./queue";
import { getHandlerForPlatform } from "./handlers";
import { IngestionJob } from "./types";

export async function processIngestionJob(jobId: string): Promise<void> {
  const supabase = await createSupabaseServiceClient();

  const { data: job, error: fetchError } = await supabase
    .from("ingestion_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (fetchError || !job) {
    console.error(`Failed to fetch job ${jobId}:`, fetchError);
    return;
  }

  const typedJob = job as IngestionJob;

  const { data: attempts } = await supabase
    .from("ingestion_attempts")
    .select("attempt_number")
    .eq("job_id", jobId)
    .order("attempt_number", { ascending: false })
    .limit(1);

  const attemptNumber = (attempts?.[0]?.attempt_number || 0) + 1;

  try {
    await markJobProcessing(jobId);
    await recordAttempt(jobId, attemptNumber, "processing");

    const handler = await getHandlerForPlatform(typedJob.platform as any);
    const result = await handler(typedJob);

    if (result.success) {
      await markJobCompleted(jobId, result.salesEventsCreated || 0);
      await recordAttempt(jobId, attemptNumber, "completed");
      console.log(`✓ Job ${jobId} completed successfully`);
    } else {
      const willRetry = await markJobFailed(jobId, result.error || result.message, attemptNumber);
      await recordAttempt(jobId, attemptNumber, willRetry ? "retrying" : "failed", result.error);
      console.warn(`✗ Job ${jobId} failed: ${result.error}${willRetry ? " (will retry)" : ""}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const willRetry = await markJobFailed(jobId, errorMessage, attemptNumber);
    await recordAttempt(jobId, attemptNumber, willRetry ? "retrying" : "failed", errorMessage);
    console.error(`✗ Job ${jobId} error:`, errorMessage, `${willRetry ? "(will retry)" : ""}`);
  }
}

export async function processQueuedJobs(maxJobs: number = 5): Promise<number> {
  let processed = 0;

  for (let i = 0; i < maxJobs; i++) {
    const job = await dequeueJob();
    if (!job) {
      break;
    }

    await processIngestionJob(job.id);
    processed++;
  }

  return processed;
}

export async function logCronExecution(
  jobName: string,
  status: "started" | "completed" | "failed",
  payload: Record<string, unknown> = {},
  errorMessage?: string
): Promise<void> {
  const supabase = await createSupabaseServiceClient();

  await supabase.from("cron_logs").insert({
    job_name: jobName,
    status,
    payload,
    error_message: errorMessage || null,
    finished_at: status !== "started" ? new Date().toISOString() : null,
  });
}
