import { db } from "@/lib/db";
import { cards, events } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { canonicalPublicBaseUrl } from "@/lib/request-security";

export const dynamic = "force-dynamic";

/** Dynamic QR target: tracks a qr_scan event, then 302s to the live card. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const [c] = await db.select({ id: cards.id, orgId: cards.orgId, published: cards.published }).from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!c || !c.published) return NextResponse.redirect(new URL("/", canonicalPublicBaseUrl()), 302);
  await db.insert(events).values({ orgId: c.orgId, cardId: c.id, type: "qr_scan", ref: "qr" }).catch(() => {});
  return NextResponse.redirect(new URL(`/c/${slug}`, canonicalPublicBaseUrl()), 302);
}
