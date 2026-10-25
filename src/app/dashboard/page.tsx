import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cards, users } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { getPersonalOrganization } from "@/lib/organization";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — Appistic" };

export default async function Dashboard() {
  const uid = await currentUserId();
  if (!uid) redirect("/login");
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) redirect("/login");
  const org = await getPersonalOrganization(uid);
  if (!org) redirect("/login");
  const rows = await db.select().from(cards).where(and(eq(cards.userId, uid), eq(cards.orgId, org.id)));
  return (
    <DashboardClient
      user={{ name: user.name, email: user.email, plan: user.plan }}
      cards={JSON.parse(JSON.stringify(rows))}
    />
  );
}
