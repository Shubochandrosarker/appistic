import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { PRICING } from "@/lib/plan";
import BillingClient from "./BillingClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing — Appistic" };

export default async function Billing() {
  const uid = await currentUserId();
  if (!uid) redirect("/login");
  const [user] = await db.select().from(users).where(eq(users.id, uid)).limit(1);
  if (!user) redirect("/login");
  return (
    <BillingClient
      email={user.email}
      plan={user.plan}
      userId={user.id}
      portalUrl={process.env.PADDLE_PORTAL_URL || "https://customer-portal.paddle.com/cpl_01m1ycy6ry01sg09dgnyt31pd1"}
      pricing={{ monthly: PRICING.proMonthlyUsd, yearly: PRICING.proYearlyUsd }}
      monthlyPriceId={PRICING.proMonthlyPriceId}
      yearlyPriceId={PRICING.proYearlyPriceId}
    />
  );
}
