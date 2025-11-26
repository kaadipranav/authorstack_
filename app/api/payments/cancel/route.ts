import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        console.log("[Payments] Payment cancelled by user");

        // Redirect to promo marketplace with cancel message
        return NextResponse.redirect(
            new URL("/dashboard/promo-marketplace?payment=cancelled", request.url)
        );
    } catch (error) {
        console.error("[Payments] Cancel callback error:", error);
        return NextResponse.redirect(
            new URL("/dashboard/promo-marketplace?error=callback_failed", request.url)
        );
    }
}
