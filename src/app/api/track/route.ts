import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, events, leads } from "@/lib/schema";
import { and, eq, sql } from "drizzle-orm";
import crypto from "node:crypto";

const TYPES = new Set(["view", "qr_scan", "link_click", "vcard_save", "product_click"]);

/** Public, fire-and-forget analytics. No PII. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const cardId = String(b?.cardId || "");
  const type = String(b?.type || "");
  if (!/^[0-9a-f-]{36}$/i.test(cardId) || !TYPES.has(type)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const [own] = await db.select({ id: cards.id }).from(cards).where(eq(cards.id, cardId)).limit(1);
  if (!own) return NextResponse.json({ ok: false }, { status: 404 });
  await db.insert(events).values({ cardId, type, ref: String(b?.ref || "").slice(0, 120) });
  return NextResponse.json({ ok: true });
}

/** Owner stats for a card. */
export async function GET(req: Request) {
  const cardId = new URL(req.url).searchParams.get("cardId") || "";
  if (!/^[0-9a-f-]{36}$/i.test(cardId)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const counts = await db
    .select({ type: events.type, n: sql<number>`count(*)` })
    .from(events)
    .where(eq(events.cardId, cardId))
    .groupBy(events.type);
  const recentLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.cardId, cardId))
    .orderBy(sql`${leads.createdAt} desc`)
    .limit(100);
  const leadsThisMonth = await db
    .select({ n: sql<number>`count(*)` })
    .from(leads)
    .where(and(eq(leads.cardId, cardId), sql`${leads.createdAt} >= date_trunc('month', now())`));
  const out: Record<string, number> = {};
  for (const c of counts) out[c.type] = Number(c.n);
  return NextResponse.json({
    stats: {
      views: out["view"] || 0,
      qrScans: out["qr_scan"] || 0,
      linkClicks: out["link_click"] || 0,
      saves: out["vcard_save"] || 0,
      productClicks: out["product_click"] || 0,
      leadsTotal: recentLeads.length ? undefined : 0,
      leadsThisMonth: Number(leadsThisMonth[0]?.n || 0),
    },
    leads: recentLeads,
    nonce: crypto.randomUUID(),
  });
}
