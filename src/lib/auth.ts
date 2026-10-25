import crypto from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "./db";
import { sessions } from "./schema";

export const COOKIE = "apst_session";
export { hashPassword, verifyPassword } from "./password";

function digestToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function sessionCookieOptions(days = 30) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: days * 86400,
    path: "/",
  };
}

export async function createSession(userId: string, days = 30) {
  const token = crypto.randomBytes(32).toString("base64url");
  await db.insert(sessions).values({
    userId,
    tokenHash: digestToken(token),
    expiresAt: new Date(Date.now() + days * 86400_000),
  });
  return token;
}

export async function revokeSession(token: string | undefined) {
  if (!token) return;
  await db.update(sessions).set({ revokedAt: new Date() }).where(and(eq(sessions.tokenHash, digestToken(token)), isNull(sessions.revokedAt)));
}

export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [session] = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(and(eq(sessions.tokenHash, digestToken(token)), gt(sessions.expiresAt, new Date()), isNull(sessions.revokedAt)))
    .limit(1);
  return session?.userId || null;
}

export async function currentUserId(): Promise<string | null> {
  const store = await cookies();
  return verifySession(store.get(COOKIE)?.value);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || `card-${crypto.randomBytes(3).toString("hex")}`;
}
