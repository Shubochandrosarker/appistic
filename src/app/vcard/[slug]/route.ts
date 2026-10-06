import { db } from "@/lib/db";
import { cards } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function esc(s: string) {
  return s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const [c] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!c || !c.published) return new Response("Not found", { status: 404 });
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(c.brandName)}`,
    `ORG:${esc(c.brandName)}`,
    c.headline ? `TITLE:${esc(c.headline)}` : "",
    c.phone ? `TEL;TYPE=WORK,VOICE:${esc(c.phone)}` : "",
    c.email ? `EMAIL;TYPE=WORK:${esc(c.email)}` : "",
    c.website ? `URL:${esc(c.website)}` : "",
    c.address ? `ADR;TYPE=WORK:;;${esc(c.address)};;;;` : "",
    c.bio ? `NOTE:${esc(c.bio.slice(0, 200))}` : "",
    `URL;TYPE=card:https://appistic.com/c/${c.slug}`,
    "END:VCARD",
  ].filter(Boolean);
  return new Response(lines.join("\r\n"), {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `attachment; filename="${c.slug}.vcf"`,
    },
  });
}
