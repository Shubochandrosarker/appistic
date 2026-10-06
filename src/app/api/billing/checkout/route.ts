import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { PRICING } from "@/lib/plan";

export const dynamic = "force-dynamic";

/**
 * Server-side Paddle checkout: creates a transaction via API (works from any
 * domain — no Paddle domain approval needed) and returns the hosted checkout URL.
 * custom_data.userId lets the webhook grant Pro to the right account.
 */
export async function POST(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (user.plan === "pro") return NextResponse.json({ error: "Already on Pro." }, { status: 400 });

  const key = process.env.PADDLE_API_KEY;
  const body = await req.json().catch(() => ({}));
  const interval = body?.interval === "yearly" ? "yearly" : "monthly";
  const priceId = interval === "yearly" ? PRICING.proYearlyPriceId : PRICING.proMonthlyPriceId;
  if (!key || !priceId || priceId === "PENDING") {
    return NextResponse.json({ error: "Checkout is being set up — try again shortly." }, { status: 503 });
  }

  const payload: Record<string, unknown> = {
    items: [{ price_id: priceId, quantity: 1 }],
    customer: { email: user.email },
    custom_data: { userId: uid },
  };
  // Host the Paddle checkout on our own branded pay page (pay.wpistic.com auto-resumes _ptxn).
  payload.checkout = { url: "https://pay.wpistic.com" };

  let res = await fetch("https://api.paddle.com/transactions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let j = await res.json().catch(() => null);
  // retry without checkout.settings if unsupported
  if (!res.ok && j?.error) {
    delete payload.checkout;
    res = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    j = await res.json().catch(() => null);
  }
  const url = j?.data?.checkout?.url || j?.data?.url;
  if (res.ok && url) return NextResponse.json({ url });
  return NextResponse.json({ error: "Could not start checkout. Try again." }, { status: 502 });
}
