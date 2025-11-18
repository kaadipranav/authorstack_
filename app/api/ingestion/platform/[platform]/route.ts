import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { enqueueJob } from "@/lib/ingestion/queue";

const VALID_PLATFORMS = ["amazon_kdp", "gumroad", "smashwords", "draft2digital"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  try {

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: `Unknown platform: ${platform}` },
        { status: 400 }
      );
    }

    const user = await requireAuth();
    const body = await request.json();

    const jobId = await enqueueJob(user.id, platform, body || {});

    return NextResponse.json(
      {
        status: "queued",
        platform,
        jobId,
        message: `Ingestion job queued for ${platform}`,
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

