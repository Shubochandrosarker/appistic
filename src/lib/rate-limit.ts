import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "./db";

export function requestRateKey(req: Request, scope: string, subject: string) {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `${scope}:${crypto.createHash("sha256").update(`${ip}|${subject}`).digest("hex")}`;
}

export async function consumeRateLimit(key: string, max: number, windowSeconds: number) {
  if (!Number.isInteger(max) || max < 1 || !Number.isInteger(windowSeconds) || windowSeconds < 1) throw new Error("Invalid rate limit configuration.");
  const rows = await db.execute<{ allowed: boolean }>(sql`
    insert into rate_limit_buckets (key, window_started_at, count)
    values (${key}, now(), 1)
    on conflict (key) do update set
      window_started_at = case
        when rate_limit_buckets.window_started_at <= now() - (${windowSeconds} * interval '1 second') then now()
        else rate_limit_buckets.window_started_at
      end,
      count = case
        when rate_limit_buckets.window_started_at <= now() - (${windowSeconds} * interval '1 second') then 1
        else rate_limit_buckets.count + 1
      end
    returning count <= ${max} as allowed
  `);
  return Boolean(rows[0]?.allowed);
}
