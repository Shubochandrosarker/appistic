import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

/**
 * Paddle Billing webhook handler.
 * Two security layers (either suffices):
 *  1. Path secret segment: /api/webhooks/paddle/[token] (PADDLE_HOOK_TOKEN)
 *  2. Paddle signature verification when PADDLE_WEBHOOK_SECRET is set
 */
export async function handlePaddleWebhook(req: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET || "";
  const raw = await req.text();
  if (secret) {
    const sig = req.headers.get("paddle-signature") || "";
    const parts = Object.fromEntries(sig.split(";").map((kv) => kv.split("=") as [string, string]));
    const ts = parts["ts"];
    const h1 = parts["h1"];
    if (!ts || !h1) return NextResponse.json({ error: "bad signature" }, { status: 401 });
    if (Math.abs(Date.now() / 1000 - Number(ts)) > 60) return NextResponse.json({ error: "stale" }, { status: 401 });
    const expect = crypto.createHmac("sha256", secret).update(`${ts}:${raw}`).digest("hex");
    if (expect.length !== h1.length || !crypto.timingSafeEqual(Buffer.from(expect), Buffer.from(h1))) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }
  const evt = JSON.parse(raw || "{}");
  const type = String(evt.event_type || "");
  const data = evt.data || {};
  const custom = data.custom_data || {};
  const userId = String(custom.userId || "");

  const active = ["active", "trialing"].includes(String(data.status || ""));
  const isSub = type.startsWith("subscription.");

  if ((isSub && active && userId) || (type === "transaction.completed" && userId)) {
    await db
      .update(users)
      .set({ plan: "pro", proSince: new Date(), paddleCustomerId: String(data.customer_id || "") })
      .where(eq(users.id, userId));
  }
  if (isSub && !active && userId) {
    await db.update(users).set({ plan: "free" }).where(eq(users.id, userId));
  }
  return NextResponse.json({ ok: true });
}
