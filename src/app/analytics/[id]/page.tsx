import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cards, events, leads } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { eq, sql, and, gte } from "drizzle-orm";
import { users } from "@/lib/schema";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics — Appistic" };

export default async function Analytics({ params }: { params: Promise<{ id: string }> }) {
  const uid = await currentUserId();
  if (!uid) redirect("/login");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [card] = await db.select().from(cards).where(and(eq(cards.id, id), eq(cards.userId, uid))).limit(1);
  if (!card) notFound();
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, uid)).limit(1);

  const counts = await db
    .select({ type: events.type, n: sql<number>`count(*)` })
    .from(events)
    .where(eq(events.cardId, card.id))
    .groupBy(events.type);
  const byType: Record<string, number> = {};
  for (const c of counts) byType[c.type] = Number(c.n);

  const leadsTotal = await db.select({ n: sql<number>`count(*)` }).from(leads).where(eq(leads.cardId, card.id));
  const leadsMonth = await db
    .select({ n: sql<number>`count(*)` })
    .from(leads)
    .where(and(eq(leads.cardId, card.id), gte(leads.createdAt, sql`date_trunc('month', now())`)));
  const leadRows = await db.select().from(leads).where(eq(leads.cardId, card.id)).orderBy(sql`${leads.createdAt} desc`).limit(200);

  return (
    <AnalyticsClient
      card={{ id: card.id, slug: card.slug, brandName: card.brandName }}
      plan={user?.plan || "free"}
      stats={{
        views: byType["view"] || 0,
        qrScans: byType["qr_scan"] || 0,
        linkClicks: byType["link_click"] || 0,
        productClicks: byType["product_click"] || 0,
        saves: byType["vcard_save"] || 0,
        leadsTotal: Number(leadsTotal[0]?.n || 0),
        leadsThisMonth: Number(leadsMonth[0]?.n || 0),
      }}
      leads={JSON.parse(JSON.stringify(leadRows))}
    />
  );
}
