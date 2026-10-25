import { NextResponse } from "next/server";
import { COOKIE, revokeSession } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/request-security";

export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const token = req.headers.get("cookie")?.match(new RegExp(`${COOKIE}=([^;]+)`))?.[1];
  await revokeSession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { ...({ httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", maxAge: 0, path: "/" }) });
  return res;
}
