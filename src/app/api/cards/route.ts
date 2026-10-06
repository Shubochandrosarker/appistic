import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { cards } from "@/lib/schema";
import { currentUserId, slugify } from "@/lib/auth";
import { PLAN, planOf } from "@/lib/plan";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db.select().from(cards).where(eq(cards.userId, uid)).orderBy(desc(cards.createdAt));
  return NextResponse.json({ cards: rows });
}

export async function POST(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const brandName = String(body?.brandName || "").trim().slice(0, 80) || "My Business";
  const existing = await db
    .select({ n: sql<number>`count(*)` })
    .from(cards)
    .where(eq(cards.userId, uid));
  const plan = planOf((await db.query.users.findFirst({ where: eq(schema.users.id, uid) }))?.plan || "free");
  if (Number(existing[0]?.n || 0) >= plan.cards) {
    return NextResponse.json(
      { error: `Your ${plan.priceLabel} plan allows ${plan.cards} card(s). Upgrade to Pro for 10 cards.`, upgrade: true },
      { status: 402 }
    );
  }
  let slug = slugify(body?.slug || brandName);
  const taken = await db.select({ id: cards.id }).from(cards).where(eq(cards.slug, slug)).limit(1);
  if (taken.length) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db
    .insert(cards)
    .values({ userId: uid, slug, brandName, headline: String(body?.headline || "").slice(0, 120), theme: { preset: "snow", accent: "#ea3a2e" } })
    .returning();
  return NextResponse.json({ card: row });
}
