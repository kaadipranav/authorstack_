import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const payload = await request.json().catch(() => ({}));

  return NextResponse.json({
    provider,
    message: "Webhook received. Validate signature + enqueue ingestion in Step 8.",
    payload,
  });
}

