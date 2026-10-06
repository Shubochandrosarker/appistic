import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { cards } from "@/lib/schema";
import { currentUserId } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editor — Appistic" };

export default async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const uid = await currentUserId();
  if (!uid) redirect("/login");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [card] = await db.select().from(cards).where(and(eq(cards.id, id), eq(cards.userId, uid))).limit(1);
  if (!card) notFound();
  return <EditorClient initial={JSON.parse(JSON.stringify(card))} />;
}
