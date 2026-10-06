import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, leads, users } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

/** Pro-only leads CSV export. */
export async function GET(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, uid)).limit(1);
  if (user?.plan !== "pro") return NextResponse.json({ error: "Pro plan required." }, { status: 402 });
  const cardId = new URL(req.url).searchParams.get("cardId") || "";
  if (!/^[0-9a-f-]{36}$/i.test(cardId)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const [card] = await db.select({ id: cards.id, slug: cards.slug }).from(cards).where(and(eq(cards.id, cardId), eq(cards.userId, uid))).limit(1);
  if (!card) return NextResponse.json({ error: "not found" }, { status: 404 });
  const rows = await db.select().from(leads).where(eq(leads.cardId, card.id));
  const esc = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
  const csv = [
    "name,email,phone,note,created_at",
    ...rows.map((r) => [esc(r.name), esc(r.email), esc(r.phone), esc(r.note), r.createdAt.toISOString()].join(",")),
  ].join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${card.slug}-leads.csv"`,
    },
  });
}
