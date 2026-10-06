import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { cards, users } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard — Appistic" };

export default async function Dashboard() {
  const uid = await currentUserId();
  if (!uid) redirect("/login");
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) redirect("/login");
  const rows = await db.select().from(cards).where(eq(cards.userId, uid));
  return (
    <DashboardClient
      user={{ name: user.name, email: user.email, plan: user.plan }}
      cards={JSON.parse(JSON.stringify(rows))}
    />
  );
}
