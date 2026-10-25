import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./schema";

export type Entitlements = {
  plan: "free" | "pro";
  cards: number;
  leadCapPerMonth: number | null;
  exportCsv: boolean;
  removeBranding: boolean;
  grandfathered: boolean;
};

export function entitlementsForPlan(plan: string): Entitlements {
  if (plan === "pro") {
    return { plan: "pro", cards: 10, leadCapPerMonth: null, exportCsv: true, removeBranding: true, grandfathered: true };
  }
  return { plan: "free", cards: 1, leadCapPerMonth: 50, exportCsv: false, removeBranding: false, grandfathered: false };
}

export async function getEntitlements(userId: string) {
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1);
  return entitlementsForPlan(user?.plan || "free");
}

