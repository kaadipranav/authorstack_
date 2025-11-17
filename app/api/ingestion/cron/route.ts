import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cronSecret = request.headers.get("authorization");
  if (!cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "accepted",
    message: "Cron ingestion stub ready for Upstash QStash / Vercel Cron.",
  });
}

