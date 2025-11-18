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

    const job = await getJobStatus(jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.profile_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

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
    return NextResponse.json(
      {
        error: "Failed to fetch job status",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
