import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards, leads } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { escapeCsvCell } from "@/lib/csv";
import { getEntitlements } from "@/lib/entitlements";
import { getPersonalOrganization } from "@/lib/organization";

/** Pro-only leads CSV export. */
export async function GET(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const org = await getPersonalOrganization(uid);
  if (!org) return NextResponse.json({ error: "workspace unavailable" }, { status: 409 });
  const cardId = new URL(req.url).searchParams.get("cardId") || "";
  if (!/^[0-9a-f-]{36}$/i.test(cardId)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const [card] = await db.select({ id: cards.id, slug: cards.slug }).from(cards).where(and(eq(cards.id, cardId), eq(cards.userId, uid), eq(cards.orgId, org.id))).limit(1);
  if (!card) return NextResponse.json({ error: "not found" }, { status: 404 });
  const entitlements = await getEntitlements(uid);
  if (!entitlements.exportCsv) return NextResponse.json({ error: "Pro plan required." }, { status: 402 });
  const rows = await db.select().from(leads).where(and(eq(leads.cardId, card.id), eq(leads.orgId, org.id)));
  const csv = [
    "name,email,phone,note,created_at",
    ...rows.map((r) => [escapeCsvCell(r.name), escapeCsvCell(r.email), escapeCsvCell(r.phone), escapeCsvCell(r.note), escapeCsvCell(r.createdAt.toISOString())].join(",")),
  ].join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${card.slug}-leads.csv"`,
    },
  });
}
