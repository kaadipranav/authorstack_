import { NextResponse } from "next/server";

import { getProviderConfig } from "@/lib/platforms/oauth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const config = getProviderConfig(provider);
  if (!config) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 404 });
  }

  const state = crypto.randomUUID();

  return NextResponse.json({
    provider: config.provider,
    authorizeUrl: `${config.authorizeUrl}?state=${state}&redirect_uri=${encodeURIComponent(
      config.callbackPath
    )}`,
    state,
    note: "This is a placeholder OAuth initiation endpoint. Replace with real client credentials in Step 8.",
  });
}

