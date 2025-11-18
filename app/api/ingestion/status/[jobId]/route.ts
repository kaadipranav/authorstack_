import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getJobStatus } from "@/lib/ingestion/queue";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const user = await requireAuth();
    const { jobId } = await params;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const job = await getJobStatus(jobId);

    if (!job) {
      console.warn(`[API] Job not found: ${jobId}`);
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.profile_id !== user.id) {
      console.warn(`[API] Unauthorized access to job ${jobId} by user ${user.id}`);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    console.log(`[API] Job status retrieved: ${jobId}`);

    return NextResponse.json({
      id: job.id,
      platform: job.platform,
      status: job.status,
      createdAt: job.created_at,
      executedAt: job.executed_at,
      errorMessage: job.error_message,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Job status error:", errorMessage);
    
    if (errorMessage.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch job status",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
