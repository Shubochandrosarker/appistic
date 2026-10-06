import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cards, events, leads, users } from "@/lib/schema";
import { requireAdmin } from "@/lib/admin";
import { desc, eq, sql } from "drizzle-orm";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Appistic", robots: { index: false } };

export default async function Admin() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const [userRows, cardRows, leadRows] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)).limit(200),
    db.select().from(cards).orderBy(desc(cards.createdAt)).limit(300),
    db.select().from(leads).orderBy(desc(leads.createdAt)).limit(50),
  ]);

  const [{ n: totalLeads }] = await db.select({ n: sql<number>`count(*)` }).from(leads);
  const [{ n: totalEvents }] = await db.select({ n: sql<number>`count(*)` }).from(events);

  return (
    <AdminClient
      adminEmail={admin.email}
      stats={{
        users: userRows.length,
        pro: userRows.filter((u) => u.plan === "pro").length,
        cards: cardRows.length,
        published: cardRows.filter((c) => c.published).length,
        leads: Number(totalLeads || 0),
        events: Number(totalEvents || 0),
      }}
      users={userRows.map((u) => ({
        id: u.id, email: u.email, name: u.name, plan: u.plan,
        paddleCustomerId: u.paddleCustomerId, createdAt: u.createdAt.toISOString(),
      }))}
      cards={cardRows.map((c) => ({
        id: c.id, slug: c.slug, brandName: c.brandName, published: c.published,
        userId: c.userId, createdAt: c.createdAt.toISOString(),
      }))}
      recentLeads={leadRows.map((l) => ({
        id: l.id, name: l.name, email: l.email, phone: l.phone,
        cardId: l.cardId, createdAt: l.createdAt.toISOString(),
      }))}
    />
  );
}
