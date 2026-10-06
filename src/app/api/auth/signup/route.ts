import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { users } from "@/lib/schema";
import { hashPassword, signSession, COOKIE } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const name = String(body?.name || "").trim().slice(0, 80);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8) {
    return NextResponse.json({ error: "Valid email and 8+ char password required." }, { status: 400 });
  }
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  const [u] = await db.insert(users).values({ email, passwordHash: hashPassword(password), name }).returning();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, signSession(u.id), { httpOnly: true, sameSite: "lax", secure: true, maxAge: 30 * 86400, path: "/" });
  return res;
}
