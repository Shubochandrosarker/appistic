import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cards } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { isSameOriginRequest } from "@/lib/request-security";
import { parseCardPatch } from "@/lib/validation";
import { getPersonalOrganization } from "@/lib/organization";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const org = await getPersonalOrganization(uid);
  if (!org) return NextResponse.json({ error: "workspace unavailable" }, { status: 409 });
  const { id } = await ctx.params;
  const parsed = parseCardPatch(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid card data.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  const b = parsed.data;
  const [row] = await db
    .update(cards)
    .set({
      ...b,
      updatedAt: new Date(),
    })
    .where(and(eq(cards.id, id), eq(cards.userId, uid), eq(cards.orgId, org.id)))
    .returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ card: row });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(_req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const org = await getPersonalOrganization(uid);
  if (!org) return NextResponse.json({ error: "workspace unavailable" }, { status: 409 });
  const { id } = await ctx.params;
  await db.delete(cards).where(and(eq(cards.id, id), eq(cards.userId, uid), eq(cards.orgId, org.id)));
  return NextResponse.json({ ok: true });
}
