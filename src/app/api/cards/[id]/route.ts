import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const [own] = await db.select({ id: cards.id }).from(cards).where(and(eq(cards.id, id), eq(cards.userId, uid))).limit(1);
  if (!own) return NextResponse.json({ error: "not found" }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  // Partial-update semantics: absent (undefined) fields keep their current value.
  const clean = (v: unknown, n: number) => (v === undefined ? undefined : String(v ?? "").slice(0, n));
  const [row] = await db
    .update(cards)
    .set({
      brandName: clean(b.brandName, 80),
      headline: clean(b.headline, 120),
      bio: clean(b.bio, 1000),
      avatarUrl: clean(b.avatarUrl, 500),
      coverUrl: clean(b.coverUrl, 500),
      phone: clean(b.phone, 40),
      email: clean(b.email, 120),
      website: clean(b.website, 200),
      address: clean(b.address, 200),
      theme: b.theme && typeof b.theme === "object" ? { preset: String(b.theme.preset || "midnight"), accent: String(b.theme.accent || "#7c5cff").slice(0, 9) } : undefined,
      links: Array.isArray(b.links)
        ? b.links.slice(0, 25).map((l: { type?: string; label?: string; url?: string }) => ({
            type: String(l?.type || "link").slice(0, 20),
            label: String(l?.label || "").slice(0, 60),
            url: String(l?.url || "").slice(0, 300),
          }))
        : undefined,
      products: Array.isArray(b.products)
        ? b.products.slice(0, 25).map((p: { title?: string; price?: string; url?: string; image?: string; desc?: string }) => ({
            title: String(p?.title || "").slice(0, 80),
            price: String(p?.price || "").slice(0, 30),
            url: String(p?.url || "").slice(0, 300),
            image: String(p?.image || "").slice(0, 500),
            desc: String(p?.desc || "").slice(0, 300),
          }))
        : undefined,
      leadFormEnabled: typeof b.leadFormEnabled === "boolean" ? b.leadFormEnabled : undefined,
      published: typeof b.published === "boolean" ? b.published : undefined,
      updatedAt: new Date(),
    })
    .where(eq(cards.id, id))
    .returning();
  return NextResponse.json({ card: row });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.delete(cards).where(and(eq(cards.id, id), eq(cards.userId, uid)));
  return NextResponse.json({ ok: true });
}
