import { db } from "@/lib/db";
import { cards } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { canonicalPublicBaseUrl, isSafePublicUrl } from "@/lib/request-security";
import { escapeVCard } from "@/lib/vcard";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const [c] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!c || !c.published) return new Response("Not found", { status: 404 });
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(c.brandName)}`,
    `ORG:${escapeVCard(c.brandName)}`,
    c.headline ? `TITLE:${escapeVCard(c.headline)}` : "",
    c.phone ? `TEL;TYPE=WORK,VOICE:${escapeVCard(c.phone)}` : "",
    c.email ? `EMAIL;TYPE=WORK:${escapeVCard(c.email)}` : "",
    c.website && isSafePublicUrl(c.website) ? `URL:${escapeVCard(c.website)}` : "",
    c.address ? `ADR;TYPE=WORK:;;${escapeVCard(c.address)};;;;` : "",
    c.bio ? `NOTE:${escapeVCard(c.bio.slice(0, 200))}` : "",
    `URL;TYPE=card:${canonicalPublicBaseUrl()}/c/${c.slug}`,
    "END:VCARD",
  ].filter(Boolean);
  return new Response(lines.join("\r\n"), {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `attachment; filename="${c.slug}.vcf"`,
    },
  });
}
