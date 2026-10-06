import { db } from "@/lib/db";
import { cards } from "@/lib/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

/** Dynamic QR: encodes the /t/[slug] tracker URL so scans are counted and the destination can never go stale. */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const [c] = await db.select({ published: cards.published }).from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!c || !c.published) return new Response("Not found", { status: 404 });
  const url = new URL(req.url);
  const base = process.env.PUBLIC_BASE_URL || "https://appistic.com";
  const target = `${url.protocol}//${url.host}/t/${slug}`;
  const buf = await QRCode.toBuffer(target, {
    type: "png",
    width: 1024,
    margin: 2,
    color: { dark: "#0b0b12ff", light: "#ffffffff" },
    errorCorrectionLevel: "H",
  });
  return new Response(new Uint8Array(buf), {
    headers: { "content-type": "image/png", "cache-control": "public, max-age=300" },
  });
}
