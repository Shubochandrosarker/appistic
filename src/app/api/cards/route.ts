import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { cards, users } from "@/lib/schema";
import { currentUserId, slugify } from "@/lib/auth";
import { entitlementsForPlan } from "@/lib/entitlements";
import { isSameOriginRequest } from "@/lib/request-security";
import { and, desc, eq, sql } from "drizzle-orm";
import { getPersonalOrganization } from "@/lib/organization";

export async function GET() {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const org = await getPersonalOrganization(uid);
  if (!org) return NextResponse.json({ error: "workspace unavailable" }, { status: 409 });
  const rows = await db.select().from(cards).where(and(eq(cards.userId, uid), eq(cards.orgId, org.id))).orderBy(desc(cards.createdAt));
  return NextResponse.json({ cards: rows });
}

export async function POST(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const org = await getPersonalOrganization(uid);
  if (!org) return NextResponse.json({ error: "workspace unavailable" }, { status: 409 });
  const body = await req.json().catch(() => ({}));
  const brandName = String(body?.brandName || "").trim().slice(0, 80) || "My Business";
  const row = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM users WHERE id = ${uid} FOR UPDATE`);
    const [user] = await tx.select({ plan: users.plan }).from(users).where(eq(users.id, uid)).limit(1);
    const entitlements = entitlementsForPlan(user?.plan || "free");
    const existing = await tx.select({ n: sql<number>`count(*)` }).from(cards).where(and(eq(cards.userId, uid), eq(cards.orgId, org.id)));
    if (Number(existing[0]?.n || 0) >= entitlements.cards) {
      throw new Error(`LIMIT:${entitlements.plan}:${entitlements.cards}`);
    }
    let slug = slugify(body?.slug || brandName);
    const taken = await tx.select({ id: cards.id }).from(cards).where(eq(cards.slug, slug)).limit(1);
    if (taken.length) slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
    const [created] = await tx.insert(cards).values({ orgId: org.id, userId: uid, slug, brandName, headline: String(body?.headline || "").slice(0, 120), theme: { preset: "snow", accent: "#ea3a2e" } }).returning();
    return created;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message.startsWith("LIMIT:")) return null;
    throw error;
  });
  if (!row) return NextResponse.json({ error: "Your plan has reached its card limit. Upgrade to Pro for more cards.", upgrade: true }, { status: 402 });
  return NextResponse.json({ card: row });
}
