import { NextResponse } from "next/server";
import { processWhopSubscriptionEvent, getProfileByWhopCustomerId } from "@/lib/payments/whop-service";
import { verifyWhopWebhookSignature, extractWhopWebhookHeaders, logWebhookEvent } from "@/lib/payments/whop-webhook";
import { WhopWebhookEvent } from "@/lib/payments/whop-service";

export async function POST(request: Request) {
  let payload: string = "";
  let parsedPayload: WhopWebhookEvent | null = null;
  let profileId: string | null = null;

  try {
    payload = await request.text();
    parsedPayload = JSON.parse(payload) as WhopWebhookEvent;

    const { signature, timestamp } = extractWhopWebhookHeaders(request);

    console.log(`[Whop] Webhook received: ${parsedPayload.event}`);

    const verificationResult = await verifyWhopWebhookSignature(payload, signature, timestamp);

    if (!verificationResult.valid) {
      console.warn(`[Whop] Signature verification failed: ${verificationResult.reason}`);
      await logWebhookEvent(
        "whop",
        parsedPayload.event,
        null,
        signature,
        parsedPayload as unknown as Record<string, unknown>,
        "failed",
        `Signature verification failed: ${verificationResult.reason}`
      );

      return NextResponse.json(
        {
          error: "Unauthorized",
          reason: verificationResult.reason,
        },
        { status: 401 }
      );
    }

    if (parsedPayload.data?.customer_id) {
      profileId = await getProfileByWhopCustomerId(parsedPayload.data.customer_id);
    }

    await logWebhookEvent(
      "whop",
      parsedPayload.event,
      profileId,
      signature,
      parsedPayload as unknown as Record<string, unknown>,
      "received"
    );

    const eventType = parsedPayload.event.toLowerCase();

    if (
      eventType.includes("membership") ||
      eventType.includes("subscription") ||
      eventType.includes("charge")
    ) {
      const result = await processWhopSubscriptionEvent(parsedPayload);

      if (result.success) {
        await logWebhookEvent(
          "whop",
          parsedPayload.event,
          result.profileId || null,
          signature,
          parsedPayload as unknown as Record<string, unknown>,
          "processed"
        );

        return NextResponse.json(
          {
            status: "success",
            message: result.message,
            profileId: result.profileId,
          },
          { status: 200 }
        );
      } else {
        await logWebhookEvent(
          "whop",
          parsedPayload.event,
          profileId,
          signature,
          parsedPayload as unknown as Record<string, unknown>,
          "failed",
          result.error
        );

        return NextResponse.json(
          {
            status: "error",
            message: result.message,
            error: result.error,
          },
          { status: 400 }
        );
      }
    }

    console.log(`[Whop] Ignoring event type: ${parsedPayload.event}`);
    await logWebhookEvent(
      "whop",
      parsedPayload.event,
      profileId,
      signature,
      parsedPayload as unknown as Record<string, unknown>,
      "processed"
    );

    return NextResponse.json(
      {
        status: "acknowledged",
        message: `Event ${parsedPayload.event} acknowledged but not processed`,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Whop] Webhook processing error:`, errorMessage);

    if (parsedPayload) {
      await logWebhookEvent(
        "whop",
        parsedPayload.event,
        profileId,
        null,
        parsedPayload as unknown as Record<string, unknown>,
        "failed",
        errorMessage
      );
    }

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
