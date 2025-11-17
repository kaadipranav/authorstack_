import { NextResponse } from "next/server";

type Params = {
  params: {
    platform: string;
  };
};

export async function POST(_request: Request, { params }: Params) {
  const { platform } = params;
  return NextResponse.json({
    platform,
    status: "accepted",
    message: `Received ingestion payload for ${platform}.`,
  });
}

