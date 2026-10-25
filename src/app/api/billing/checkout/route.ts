import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { PRICING } from "@/lib/plan";
import { isSameOriginRequest } from "@/lib/request-security";
import { getEntitlements } from "@/lib/entitlements";
import { paddleCheckoutAttempts } from "@/lib/schema";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

/**
 * Server-side Paddle checkout: creates a transaction via API (works from any
 * domain — no Paddle domain approval needed) and returns the hosted checkout URL.
 * A server-created checkout attempt binds the eventual subscription to the
 * authenticated account. Webhooks never grant access from user-supplied IDs.
 */
export async function POST(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const entitlements = await getEntitlements(uid);
  if (entitlements.plan === "pro") return NextResponse.json({ error: "Already on Pro." }, { status: 400 });

  const key = process.env.PADDLE_API_KEY;
  const environment = process.env.PADDLE_ENVIRONMENT?.trim().toLowerCase();
  const productId = process.env.PADDLE_PRO_PRODUCT_ID?.trim();
  const body = await req.json().catch(() => ({}));
  const interval = body?.interval === "yearly" ? "yearly" : "monthly";
  const priceId = interval === "yearly" ? PRICING.proYearlyPriceId : PRICING.proMonthlyPriceId;
  if (!key || !priceId || priceId === "PENDING" || !productId || !["live", "sandbox"].includes(environment || "")) {
    return NextResponse.json({ error: "Checkout is being set up — try again shortly." }, { status: 503 });
  }
  const paddleEnvironment = environment as "live" | "sandbox";

  const checkoutAttemptId = crypto.randomUUID();
  const apiBase = paddleEnvironment === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com";

  const payload: Record<string, unknown> = {
    items: [{ price_id: priceId, quantity: 1 }],
    customer: { email: user.email },
    custom_data: { appisticCheckoutAttemptId: checkoutAttemptId, appisticEnvironment: paddleEnvironment },
  };
  // Host the Paddle checkout on our own branded pay page (pay.wpistic.com auto-resumes _ptxn).
  payload.checkout = { url: "https://pay.wpistic.com" };

  let res = await fetch(`${apiBase}/transactions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let j = await res.json().catch(() => null);
  // retry without checkout.settings if unsupported
  if (!res.ok && j?.error) {
    delete payload.checkout;
    res = await fetch(`${apiBase}/transactions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    j = await res.json().catch(() => null);
  }
  const url = j?.data?.checkout?.url || j?.data?.url;
  const transactionId = String(j?.data?.id || "");
  if (res.ok && url && transactionId) {
    try {
      await db.insert(paddleCheckoutAttempts).values({
        id: checkoutAttemptId,
        userId: uid,
        transactionId,
        priceId,
        environment: paddleEnvironment,
      });
    } catch {
      return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 502 });
    }
    return NextResponse.json({ url });
  }
  return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 502 });
}
