import crypto from "node:crypto";
import { cookies } from "next/headers";

const SECRET = process.env.AUTH_SECRET || "appistic-dev-secret-change-me";
export const COOKIE = "apst_session";

export function hashPassword(pw: string) {
  return crypto.createHash("sha256").update(`appistic:${SECRET}:${pw}`).digest("hex");
}

export function signSession(userId: string, days = 30) {
  const exp = Date.now() + days * 86400_000;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expect = crypto.createHmac("sha256", SECRET).update(`${userId}.${exp}`).digest("base64url");
  if (sig.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  if (Number(exp) < Date.now()) return null;
  return userId;
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
