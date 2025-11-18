import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { enqueueJob } from "@/lib/ingestion/queue";

const VALID_PLATFORMS = ["amazon_kdp", "gumroad", "smashwords", "draft2digital"];

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { platform, payload } = body as {
      platform?: string;
      payload?: Record<string, unknown>;
    };

    if (!platform) {
      return NextResponse.json(
        { error: "Missing platform parameter" },
        { status: 400 }
      );
    }

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(", ")}` },
        { status: 400 }
      );
    }

    const jobId = await enqueueJob(user.id, platform, payload || {});

    console.log(`[API] Manual ingestion job queued: ${jobId} for ${platform}`);

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
    console.error("[API] Manual ingestion error:", errorMessage);
    
    if (errorMessage.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to queue ingestion job",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

