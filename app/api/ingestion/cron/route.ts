import { NextResponse } from "next/server";
import { processQueuedJobs, logCronExecution } from "@/lib/ingestion/worker";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const cronSecret = request.headers.get("authorization");
  const vercelCronSecret = request.headers.get("x-vercel-cron-secret");

  const isAuthorized =
    (cronSecret && cronSecret === env.UPSTASH_QSTASH_TOKEN) ||
    (vercelCronSecret && vercelCronSecret === process.env.CRON_SECRET);

  if (!isAuthorized) {
    console.warn("[Cron] Unauthorized cron request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting ingestion queue processing");
    await logCronExecution("ingestion:process-queue", "started");

    const processed = await processQueuedJobs(10);

    await logCronExecution("ingestion:process-queue", "completed", {
      jobsProcessed: processed,
      timestamp: new Date().toISOString(),
    });

    console.log(`[Cron] ✓ Processed ${processed} ingestion jobs`);

    return NextResponse.json({
      status: "success",
      message: `Processed ${processed} ingestion jobs`,
      jobsProcessed: processed,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Cron] Processing error:", errorMessage);
    
    await logCronExecution(
      "ingestion:process-queue",
      "failed",
      { timestamp: new Date().toISOString() },
      errorMessage
    );

    return NextResponse.json(
      {
        status: "error",
        message: "Cron job failed",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

