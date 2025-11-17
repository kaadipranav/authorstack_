import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "queued",
    message: "Manual ingestion job stubbed; wire to Supabase job queue next.",
  });
}

