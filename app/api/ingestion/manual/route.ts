import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { enqueueJob } from "@/lib/ingestion/queue";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { platform, payload } = body as {
      platform: string;
      payload?: Record<string, unknown>;
    };

    if (!platform) {
      return NextResponse.json(
        { error: "Missing platform parameter" },
        { status: 400 }
      );
    }

    const jobId = await enqueueJob(user.id, platform, payload || {});

    return NextResponse.json(
      {
        status: "queued",
        jobId,
        message: `Manual ingestion job queued for ${platform}`,
      },
      { status: 202 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to queue ingestion job",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

