import { NextResponse } from "next/server";
import { handlePaddleWebhook } from "@/lib/paddle-hook";

export const dynamic = "force-dynamic";

/** Secret path segment: Paddle destination points here. Unknown tokens 404. */
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const expected = process.env.PADDLE_HOOK_TOKEN || "";
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return handlePaddleWebhook(req);
}
