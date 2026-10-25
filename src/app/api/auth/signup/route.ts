import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organizationMembers, organizations, users } from "@/lib/schema";
import { createSession, COOKIE, sessionCookieOptions } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { isSameOriginRequest } from "@/lib/request-security";
import { signupSchema } from "@/lib/validation";
import { consumeRateLimit, requestRateKey } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = signupSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid email and 8+ char password required." }, { status: 400 });
  }
  const { email, password, name } = parsed.data;
  if (!(await consumeRateLimit(requestRateKey(req, "signup", email), 5, 900))) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  const u = await db.transaction(async (tx) => {
    const [created] = await tx.insert(users).values({ email, passwordHash: await hashPassword(password), name }).returning();
    if (!created) return null;
    const [org] = await tx.insert(organizations).values({ slug: `personal-${created.id.replaceAll("-", "")}`, displayName: name || "Personal workspace", ownerId: created.id }).returning();
    if (!org) throw new Error("Could not create personal workspace.");
    await tx.insert(organizationMembers).values({ orgId: org.id, userId: created.id, role: "owner" });
    return created;
  });
  if (!u) return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  const token = await createSession(u.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, sessionCookieOptions());
  return res;
}
