import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, events, leads, users } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { entitlementsForPlan } from "@/lib/entitlements";
import { consumeRateLimit, requestRateKey } from "@/lib/rate-limit";

/** Public lead capture from a card page. Free plan capped at 50/mo, Pro unlimited. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const slug = String(b?.slug || "");
  if (!slug) return NextResponse.json({ error: "missing card" }, { status: 400 });
  if (!(await consumeRateLimit(requestRateKey(req, "lead", slug), 10, 60))) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const [card] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!card || !card.leadFormEnabled) return NextResponse.json({ error: "unavailable" }, { status: 404 });

  const name = String(b?.name || "").trim().slice(0, 80);
  const email = String(b?.email || "").trim().slice(0, 120);
  const phone = String(b?.phone || "").trim().slice(0, 40);
  const note = String(b?.note || "").trim().slice(0, 500);
  if (!email && !phone) return NextResponse.json({ error: "Email or phone required." }, { status: 400 });

  const accepted = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM users WHERE id = ${card.userId} FOR UPDATE`);
    const [owner] = await tx.select({ plan: users.plan }).from(users).where(eq(users.id, card.userId)).limit(1);
    const entitlements = entitlementsForPlan(owner?.plan || "free");
    if (entitlements.leadCapPerMonth !== null) {
      const [count] = await tx
        .select({ n: sql<number>`count(*)` })
        .from(leads)
        .innerJoin(cards, eq(cards.id, leads.cardId))
        .where(and(eq(cards.userId, card.userId), sql`${leads.createdAt} >= date_trunc('month', now())`));
      if (Number(count?.n || 0) >= entitlements.leadCapPerMonth) return false;
    }
    await tx.insert(leads).values({ orgId: card.orgId, cardId: card.id, name, email, phone, note });
    await tx.insert(events).values({ orgId: card.orgId, cardId: card.id, type: "view", ref: "lead_form" });
    return true;
  });
  if (!accepted) return NextResponse.json({ error: "This card's monthly lead inbox is full. The owner should upgrade to Pro." }, { status: 429 });
  return NextResponse.json({ ok: true });
}
