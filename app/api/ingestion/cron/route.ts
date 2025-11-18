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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await logCronExecution("ingestion:process-queue", "started");

    const processed = await processQueuedJobs(10);

    await logCronExecution("ingestion:process-queue", "completed", {
      jobsProcessed: processed,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      status: "success",
      message: `Processed ${processed} ingestion jobs`,
      jobsProcessed: processed,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
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

