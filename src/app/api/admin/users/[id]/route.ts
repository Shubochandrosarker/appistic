import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { requireAdmin, isUuid } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { isSameOriginRequest } from "@/lib/request-security";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  if (body?.plan !== "pro" && body?.plan !== "free") return NextResponse.json({ error: "bad plan" }, { status: 400 });
  const plan = body.plan;
  await db
    .update(users)
    .set({ plan, proSince: plan === "pro" ? new Date() : null })
    .where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!isSameOriginRequest(_req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });
  if (id === admin.id) return NextResponse.json({ error: "You cannot delete your own account here." }, { status: 400 });
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
