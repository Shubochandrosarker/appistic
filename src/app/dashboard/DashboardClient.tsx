"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CardRow = {
  id: string;
  slug: string;
  brandName: string;
  headline: string;
  published: boolean;
  createdAt: string;
};

export default function DashboardClient({
  user,
  cards,
}: {
  user: { name: string; email: string; plan: string };
  cards: CardRow[];
}) {
  const r = useRouter();
  const [rows, setRows] = useState(cards);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function createCard() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ brandName: user.name ? `${user.name}'s Business` : "My Business" }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.ok) {
      setRows([j.card, ...rows]);
    } else {
      setErr(j.error || "Could not create card.");
      if (j.upgrade) setShowUpgrade(true);
    }
    setBusy(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    r.push("/");
    r.refresh();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            App<span style={{ color: "var(--acc)" }}>istic</span>
          </Link>
          <p className="mt-0.5 text-sm a-mut">{user.email}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.plan === "pro" ? "text-white" : "a-mut"}`}
            style={user.plan === "pro" ? { background: "var(--acc)" } : { border: "1px solid var(--line)" }}>
            {user.plan === "pro" ? "PRO" : "FREE"}
          </span>
          {user.plan !== "pro" && (
            <Link href="/dashboard/billing" className="a-btn px-4 py-2 text-xs">Upgrade to Pro — $5/mo</Link>
          )}
          <button onClick={logout} className="a-mut hover:text-white">Log out</button>
        </div>
      </header>

      <div className="mt-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your cards</h1>
        <button onClick={createCard} disabled={busy} className="a-btn px-5 py-2.5 text-sm">
          {busy ? "Creating…" : "+ New card"}
        </button>
      </div>
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}

      {showUpgrade && (
        <div className="a-card mt-4 p-5" style={{ borderColor: "var(--acc)" }}>
          <p className="text-sm font-semibold">Free plan = 1 card.</p>
          <p className="mt-1 text-sm a-mut">Pro gives you 10 cards, unlimited leads and CSV export — $5/mo.</p>
          <Link href="/dashboard/billing" className="a-btn mt-3 inline-block px-5 py-2.5 text-sm">See Pro</Link>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="a-card mt-6 p-10 text-center">
          <p className="text-3xl">🪪</p>
          <p className="mt-3 font-semibold">No cards yet</p>
          <p className="mt-1 text-sm a-mut">Create your first digital business card — it takes 3 minutes.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map((c) => (
            <div key={c.id} className="a-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{c.brandName}</p>
                  <p className="truncate text-xs a-mut">appistic.com/c/{c.slug}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${c.published ? "text-white" : "a-mut"}`}
                  style={c.published ? { background: "#22c55e" } : { border: "1px solid var(--line)" }}>
                  {c.published ? "LIVE" : "DRAFT"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/qr/${c.slug}`} alt="QR" className="h-16 w-16 rounded-lg bg-white p-1" />
                <div className="flex flex-col gap-1.5 text-xs">
                  <Link href={`/editor/${c.id}`} className="a-btn px-4 py-2 text-center text-xs">Edit</Link>
                  <a href={`/qr/${c.slug}`} download={`${c.slug}-qr.png`} className="px-4 py-2 text-center a-card hover:border-[var(--acc)]">Download QR</a>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-xs">
                <Link href={`/analytics/${c.id}`} className="underline a-mut hover:text-white">Analytics & leads</Link>
                {c.published && (
                  <a href={`/c/${c.slug}`} target="_blank" rel="noreferrer" className="underline a-mut hover:text-white">View live ↗</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
