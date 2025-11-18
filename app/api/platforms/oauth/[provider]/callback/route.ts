import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  return NextResponse.json({
    provider,
    code,
    state,
    message:
      "OAuth callback received. Implement token exchange + connection persistence in Step 8.",
  });
}

