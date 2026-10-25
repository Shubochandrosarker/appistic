import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { createSession, COOKIE, sessionCookieOptions } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/password";
import { isSameOriginRequest } from "@/lib/request-security";
import { loginSchema } from "@/lib/validation";
import { consumeRateLimit, requestRateKey } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Valid email and password required." }, { status: 400 });
  const { email, password } = parsed.data;
  if (!(await consumeRateLimit(requestRateKey(req, "login", email), 10, 900))) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const verification = u ? await verifyPassword(password, u.passwordHash) : { valid: false, needsRehash: false };
  if (!u || !verification.valid) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }
  if (verification.needsRehash) await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, u.id));
  const token = await createSession(u.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, sessionCookieOptions());
  return res;
}
