import { NextResponse } from "next/server";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { paddleWebhookEvents, users } from "@/lib/schema";
import { verifyPaddleSignature } from "@/lib/paddle-signature";

function configuredPriceIds() {
  return new Set([process.env.PADDLE_PRO_MONTHLY_PRICE_ID, process.env.PADDLE_PRO_YEARLY_PRICE_ID].filter(Boolean));
}

function eventPriceId(data: Record<string, unknown>) {
  const items = Array.isArray(data.items) ? data.items : [];
  const first = (items[0] || {}) as Record<string, unknown>;
  const price = (first.price || {}) as Record<string, unknown>;
  return String(price.id || first.price_id || data.price_id || "");
}

export async function handlePaddleWebhook(req: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET?.trim();
  if (!secret) return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  const raw = await req.text();
  if (!verifyPaddleSignature(raw, req.headers.get("paddle-signature"), secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let evt: Record<string, unknown>;
  try {
    evt = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const eventId = String(evt.event_id || evt.notification_id || "");
  const type = String(evt.event_type || "");
  const data = (evt.data || {}) as Record<string, unknown>;
  if (!eventId || !type) return NextResponse.json({ error: "invalid event" }, { status: 400 });

  const occurredAtValue = String(evt.occurred_at || data.updated_at || "");
  const occurredAt = occurredAtValue ? new Date(occurredAtValue) : null;
  const occurredAtValid = occurredAt && !Number.isNaN(occurredAt.getTime()) ? occurredAt : null;
  const userId = String(((data.custom_data || {}) as Record<string, unknown>).userId || "");
  const status = String(data.status || "");
  const isSubscription = type.startsWith("subscription.");
  const isCancellation = isSubscription && ["canceled", "paused"].includes(status);
  const isActive = isSubscription && ["active", "trialing"].includes(status);
  const allowedPrice = configuredPriceIds().has(eventPriceId(data));
  const shouldGrant = allowedPrice && (isActive || type === "transaction.completed");

  const duplicate = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(paddleWebhookEvents)
      .values({ eventId, eventType: type, occurredAt: occurredAtValid })
      .onConflictDoNothing({ target: paddleWebhookEvents.eventId })
      .returning({ id: paddleWebhookEvents.id });
    if (!inserted) return true;

    if (userId && (shouldGrant || isCancellation)) {
      const conditions = [eq(users.id, userId)];
      if (occurredAtValid) conditions.push(or(isNull(users.paddleEventAt), lt(users.paddleEventAt, occurredAtValid))!);
      await tx
        .update(users)
        .set({
          plan: shouldGrant ? "pro" : "free",
          proSince: shouldGrant ? new Date() : undefined,
          paddleCustomerId: String(data.customer_id || "") || undefined,
          paddleSubscriptionId: String(data.id || data.subscription_id || "") || undefined,
          paddleEventAt: occurredAtValid || undefined,
        })
        .where(and(...conditions));
    }
    await tx.update(paddleWebhookEvents).set({ processedAt: new Date() }).where(eq(paddleWebhookEvents.id, inserted.id));
    return false;
  });

  return NextResponse.json({ ok: true, duplicate });
}
