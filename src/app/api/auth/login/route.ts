import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { users } from "@/lib/schema";
import { hashPassword, signSession, COOKIE } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u || u.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, signSession(u.id), { httpOnly: true, sameSite: "lax", secure: true, maxAge: 30 * 86400, path: "/" });
  return res;
}
