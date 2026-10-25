import { NextResponse } from "next/server";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { paddleCheckoutAttempts, paddleWebhookEvents, users } from "@/lib/schema";
import { verifyPaddleSignature } from "@/lib/paddle-signature";

type PaddleData = Record<string, unknown>;
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.created",
  "subscription.activated",
  "subscription.imported",
  "subscription.trialing",
  "subscription.resumed",
  "subscription.updated",
  "subscription.past_due",
  "subscription.paused",
  "subscription.canceled",
]);

function configuredEnvironment() {
  const environment = process.env.PADDLE_ENVIRONMENT?.trim().toLowerCase();
  return environment === "live" || environment === "sandbox" ? environment : null;
}

function configuredPriceIds() {
  return new Set([process.env.PADDLE_PRO_MONTHLY_PRICE_ID, process.env.PADDLE_PRO_YEARLY_PRICE_ID].map((value) => value?.trim()).filter(Boolean));
}

function configuredProductId() {
  return process.env.PADDLE_PRO_PRODUCT_ID?.trim() || null;
}

function asRecord(value: unknown): PaddleData {
  return value && typeof value === "object" && !Array.isArray(value) ? value as PaddleData : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function customData(data: PaddleData) {
  return asRecord(data.custom_data);
}

function eventPriceIds(data: PaddleData) {
  const items = Array.isArray(data.items) ? data.items : [];
  return new Set(items.map((item) => {
    const row = asRecord(item);
    const price = asRecord(row.price);
    return stringValue(price.id || row.price_id || row.priceId);
  }).filter(Boolean));
}

function eventProductIds(data: PaddleData) {
  const items = Array.isArray(data.items) ? data.items : [];
  return new Set(items.map((item) => {
    const row = asRecord(item);
    const price = asRecord(row.price);
    return stringValue(price.product_id || price.productId || row.product_id || data.product_id);
  }).filter(Boolean));
}

function catalogMatches(data: PaddleData, expectedPriceId?: string) {
  const productId = configuredProductId();
  const priceIds = eventPriceIds(data);
  const productIds = eventProductIds(data);
  if (!productId || !configuredPriceIds().size || !productIds.has(productId)) return false;
  if (expectedPriceId) return priceIds.has(expectedPriceId);
  return [...priceIds].some((priceId) => configuredPriceIds().has(priceId));
}

function occurredAtFor(evt: PaddleData, data: PaddleData) {
  const raw = stringValue(evt.occurred_at || data.updated_at);
  if (!raw) return null;
  const value = new Date(raw);
  return Number.isNaN(value.getTime()) ? null : value;
}

function identifiers(data: PaddleData) {
  return {
    customerId: stringValue(data.customer_id),
    subscriptionId: stringValue(data.subscription_id || (data.id && String(data.id).startsWith("sub_") ? data.id : "")),
    transactionId: stringValue(data.id && String(data.id).startsWith("txn_") ? data.id : ""),
  };
}

async function findAttempt(tx: DbTransaction, data: PaddleData, environment: string) {
  const metadata = customData(data);
  const attemptId = stringValue(metadata.appisticCheckoutAttemptId);
  const { transactionId } = identifiers(data);
  if (attemptId) {
    const [attempt] = await tx.select().from(paddleCheckoutAttempts).where(and(eq(paddleCheckoutAttempts.id, attemptId), eq(paddleCheckoutAttempts.environment, environment))).limit(1);
    return attempt || null;
  }
  if (transactionId) {
    const [attempt] = await tx.select().from(paddleCheckoutAttempts).where(and(eq(paddleCheckoutAttempts.transactionId, transactionId), eq(paddleCheckoutAttempts.environment, environment))).limit(1);
    return attempt || null;
  }
  return null;
}

async function findAccount(tx: DbTransaction, data: PaddleData, environment: string, attempt: Awaited<ReturnType<typeof findAttempt>>) {
  const { customerId, subscriptionId } = identifiers(data);
  const metadata = customData(data);
  const declaredEnvironment = stringValue(metadata.appisticEnvironment);
  if (declaredEnvironment && declaredEnvironment !== environment) return null;

  if (attempt) {
    if (!catalogMatches(data, attempt.priceId)) return null;
    if (attempt.customerId && customerId && attempt.customerId !== customerId) return null;
    if (attempt.subscriptionId && subscriptionId && attempt.subscriptionId !== subscriptionId) return null;
    const [account] = await tx.select().from(users).where(eq(users.id, attempt.userId)).limit(1);
    if (!account || (account.paddleEnvironment && account.paddleEnvironment !== environment)) return null;
    if (account.paddleCustomerId && customerId && account.paddleCustomerId !== customerId) return null;
    if (account.paddleSubscriptionId && subscriptionId && account.paddleSubscriptionId !== subscriptionId) return null;
    return account;
  }

  let account: typeof users.$inferSelect | undefined;
  if (subscriptionId) {
    const [row] = await tx.select().from(users).where(and(eq(users.paddleSubscriptionId, subscriptionId), or(isNull(users.paddleEnvironment), eq(users.paddleEnvironment, environment)))).limit(1);
    account = row;
  }
  if (!account && customerId) {
    const [row] = await tx.select().from(users).where(and(eq(users.paddleCustomerId, customerId), or(isNull(users.paddleEnvironment), eq(users.paddleEnvironment, environment)))).limit(1);
    account = row;
  }
  if (!account) return null;
  if (account.paddleCustomerId && customerId && account.paddleCustomerId !== customerId) return null;
  if (account.paddleSubscriptionId && subscriptionId && account.paddleSubscriptionId !== subscriptionId) return null;
  return account;
}

export async function handlePaddleWebhook(req: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET?.trim();
  const environment = configuredEnvironment();
  if (!secret || !environment || !configuredProductId() || !configuredPriceIds().size) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const raw = await req.text();
  if (!verifyPaddleSignature(raw, req.headers.get("paddle-signature"), secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let evt: PaddleData;
  try {
    evt = JSON.parse(raw) as PaddleData;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const eventId = stringValue(evt.event_id);
  const type = stringValue(evt.event_type);
  const data = asRecord(evt.data);
  if (!eventId || !type) return NextResponse.json({ error: "invalid event" }, { status: 400 });

  const occurredAt = occurredAtFor(evt, data);
  if ((type === "transaction.completed" || SUBSCRIPTION_EVENTS.has(type)) && !occurredAt) {
    return NextResponse.json({ error: "event ordering timestamp required" }, { status: 400 });
  }

  const duplicate = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(paddleWebhookEvents)
      .values({ eventId, eventType: type, occurredAt })
      .onConflictDoNothing({ target: paddleWebhookEvents.eventId })
      .returning({ id: paddleWebhookEvents.id });
    if (!inserted) return true;

    const attempt = await findAttempt(tx, data, environment);
    const { customerId, subscriptionId } = identifiers(data);
    if (attempt && catalogMatches(data, attempt.priceId)) {
      await tx.update(paddleCheckoutAttempts).set({
        customerId: customerId || undefined,
        subscriptionId: subscriptionId || undefined,
        updatedAt: new Date(),
      }).where(eq(paddleCheckoutAttempts.id, attempt.id));
    }

    // A completed transaction confirms payment, but does not establish an
    // active subscription state and therefore never grants Pro.
    if (type === "transaction.completed") {
      await tx.update(paddleWebhookEvents).set({ processedAt: new Date() }).where(eq(paddleWebhookEvents.id, inserted.id));
      return false;
    }
    if (!SUBSCRIPTION_EVENTS.has(type) || !catalogMatches(data, attempt?.priceId)) {
      await tx.update(paddleWebhookEvents).set({ processedAt: new Date() }).where(eq(paddleWebhookEvents.id, inserted.id));
      return false;
    }

    const account = await findAccount(tx, data, environment, attempt);
    if (!account) {
      await tx.update(paddleWebhookEvents).set({ processedAt: new Date() }).where(eq(paddleWebhookEvents.id, inserted.id));
      return false;
    }

    const ordering = or(isNull(users.paddleEventAt), lt(users.paddleEventAt, occurredAt!));
    const fields = {
      paddleCustomerId: customerId || undefined,
      paddleSubscriptionId: subscriptionId || undefined,
      paddleEnvironment: environment,
      paddleEventAt: occurredAt,
    };
    const status = stringValue(data.status);
    if (["active", "trialing"].includes(status)) {
      await tx.update(users).set({ ...fields, plan: "pro", proSince: account.plan === "pro" ? undefined : occurredAt }).where(and(eq(users.id, account.id), ordering));
    } else if (["paused", "canceled"].includes(status)) {
      await tx.update(users).set({ ...fields, plan: "free" }).where(and(eq(users.id, account.id), ordering));
    } else {
      // past_due and scheduled changes retain the current plan until Paddle
      // sends an effective paused/canceled state; no grace policy is invented.
      await tx.update(users).set(fields).where(and(eq(users.id, account.id), ordering));
    }
    await tx.update(paddleWebhookEvents).set({ processedAt: new Date() }).where(eq(paddleWebhookEvents.id, inserted.id));
    return false;
  });

  return NextResponse.json({ ok: true, duplicate });
}
