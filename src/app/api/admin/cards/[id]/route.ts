import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards } from "@/lib/schema";
import { requireAdmin, isUuid } from "@/lib/admin";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const published = !!body?.published;
  await db.update(cards).set({ published, updatedAt: new Date() }).where(eq(cards.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  await db.delete(cards).where(eq(cards.id, id));
  return NextResponse.json({ ok: true });
}
