/**
 * Mutating authenticated browser requests must carry a same-origin Origin or
 * Referer. Webhooks and public lead/analytics collection intentionally use
 * their own authentication/rate-limit rules and do not call this helper.
 */
export function isSameOriginRequest(req: Request) {
  const configuredOrigin = process.env.PUBLIC_BASE_URL ? new URL(process.env.PUBLIC_BASE_URL).origin : null;
  const requestOrigin = new URL(req.url).origin;
  const allowedOrigin = configuredOrigin || (process.env.NODE_ENV === "production" ? null : requestOrigin);
  if (!allowedOrigin) return false;

  const origin = req.headers.get("origin");
  if (origin) return origin === allowedOrigin;

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === allowedOrigin;
    } catch {
      return false;
    }
  }

  return process.env.NODE_ENV !== "production";
}

export function isSafePublicUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function canonicalPublicBaseUrl() {
  const raw = process.env.PUBLIC_BASE_URL?.trim();
  if (!raw) throw new Error("PUBLIC_BASE_URL is required.");
  const url = new URL(raw);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("PUBLIC_BASE_URL must use HTTPS in production.");
  }
  return url.toString().replace(/\/$/, "");
}
