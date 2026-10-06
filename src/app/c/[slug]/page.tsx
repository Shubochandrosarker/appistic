import { db } from "@/lib/db";
import { cards } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import CardClient from "./CardClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [card] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1);
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
  const [card] = await db.select().from(cards).where(eq(cards.slug, slug)).limit(1);
  if (!card || !card.published) notFound();
  return <CardClient card={JSON.parse(JSON.stringify(card))} />;
}
