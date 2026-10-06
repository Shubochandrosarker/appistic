import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, events, leads, users } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

const FREE_LEAD_CAP = 50;

/** Public lead capture from a card page. Free plan capped at 50/mo, Pro unlimited. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const slug = String(b?.slug || "");
  if (!slug) return NextResponse.json({ error: "missing card" }, { status: 400 });
  const [card] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!card || !card.leadFormEnabled) return NextResponse.json({ error: "unavailable" }, { status: 404 });

  // plan cap for free users
  const [owner] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, card.userId)).limit(1);
  if ((owner?.plan || "free") !== "pro") {
    const [count] = await db
      .select({ n: sql<number>`count(*)` })
      .from(leads)
      .where(and(eq(leads.cardId, card.id), sql`${leads.createdAt} >= date_trunc('month', now())`));
    if (Number(count?.n || 0) >= FREE_LEAD_CAP) {
      return NextResponse.json({ error: "This card's monthly lead inbox is full. The owner should upgrade to Pro." }, { status: 429 });
    }
  }

  const name = String(b?.name || "").trim().slice(0, 80);
  const email = String(b?.email || "").trim().slice(0, 120);
  const phone = String(b?.phone || "").trim().slice(0, 40);
  const note = String(b?.note || "").trim().slice(0, 500);
  if (!email && !phone) return NextResponse.json({ error: "Email or phone required." }, { status: 400 });

  await db.insert(leads).values({ cardId: card.id, name, email, phone, note });
  await db.insert(events).values({ cardId: card.id, type: "view", ref: "lead_form" });
  return NextResponse.json({ ok: true });
}
