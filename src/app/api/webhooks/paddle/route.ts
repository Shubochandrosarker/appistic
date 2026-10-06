import { NextResponse } from "next/server";
import { handlePaddleWebhook } from "@/lib/paddle-hook";

export const dynamic = "force-dynamic";

/**
 * Legacy un-tokened path — DISABLED unless PADDLE_WEBHOOK_SECRET is configured.
 * Production webhook uses /api/webhooks/paddle/[token] (path secret).
 */
export async function POST(req: Request) {
  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return handlePaddleWebhook(req);
}
