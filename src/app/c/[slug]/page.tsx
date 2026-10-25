import { db } from "@/lib/db";
import { cards, users } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import CardClient from "./CardClient";
import { isSafePublicUrl } from "@/lib/request-security";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [card] = await db.select().from(cards).where(and(eq(cards.slug, slug), eq(cards.published, true))).limit(1);
  if (!card) return { title: "Card not found — Appistic" };
  const title = `${card.brandName}${card.headline ? ` — ${card.headline}` : ""} | Appistic`;
  const desc = card.bio.slice(0, 160) || `Digital business card for ${card.brandName}. Contact, products, socials — all in one link.`;
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, images: card.avatarUrl ? [card.avatarUrl] : [] },
  };
}

export default async function PublicCard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [card] = await db.select().from(cards).where(and(eq(cards.slug, slug), eq(cards.published, true))).limit(1);
  if (!card || !card.published) notFound();
  const [owner] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, card.userId)).limit(1);
  const safeCard = {
    ...card,
    links: card.links.filter((link) => isSafePublicUrl(link.url)),
    products: card.products.filter((product) => isSafePublicUrl(product.url) && isSafePublicUrl(product.image)),
  };
  return <CardClient card={JSON.parse(JSON.stringify(safeCard))} showBranding={owner?.plan !== "pro"} />;
}
