import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

function requiredAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32 || secret.includes("change-me") || secret.includes("replace")) {
    throw new Error("AUTH_SECRET must be configured with at least 32 random characters.");
  }
  return secret;
}

/** New password hashes are deliberately independent from the session secret. */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** Supports the legacy SHA-256 format only long enough to migrate it at login. */
export async function verifyPassword(password: string, storedHash: string) {
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return { valid: await bcrypt.compare(password, storedHash), needsRehash: false };
  }

  const legacy = crypto.createHash("sha256").update(`appistic:${requiredAuthSecret()}:${password}`).digest("hex");
  const valid = legacy.length === storedHash.length && crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(storedHash));
  return { valid, needsRehash: valid };
}

export function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}
