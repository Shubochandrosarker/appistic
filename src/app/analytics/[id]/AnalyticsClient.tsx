"use client";

import Link from "next/link";
import { useState } from "react";

type Lead = { id: string; name: string; email: string; phone: string; note: string; createdAt: string };

export default function AnalyticsClient({
  card,
  plan,
  stats,
  leads,
}: {
  card: { id: string; slug: string; brandName: string };
  plan: string;
  stats: { views: number; qrScans: number; linkClicks: number; productClicks: number; saves: number; leadsTotal: number; leadsThisMonth: number };
  leads: Lead[];
}) {
  const [err, setErr] = useState("");
  async function exportCsv() {
    const res = await fetch(`/api/leads/export?cardId=${card.id}`);
    if (!res.ok) {
      setErr("Export failed.");
      return;
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${card.slug}-leads.csv`;
    a.click();
  }
  const tiles = [
    ["👁️", "Page views", stats.views],
    ["📱", "QR scans", stats.qrScans],
    ["🔗", "Link clicks", stats.linkClicks],
    ["🛍️", "Product clicks", stats.productClicks],
    ["📇", "Contact saves", stats.saves],
    ["📥", `Leads (${stats.leadsThisMonth} this month)`, stats.leadsTotal],
  ] as const;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/dashboard" className="text-sm a-mut hover:text-white">← Dashboard</Link>
      <header className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{card.brandName} — Analytics</h1>
        {plan === "pro" ? (
          <button onClick={exportCsv} className="a-btn px-5 py-2.5 text-sm">Export leads CSV</button>
        ) : (
          <Link href="/dashboard/billing" className="a-card px-5 py-2.5 text-sm hover:border-[var(--acc)]">CSV export — Pro</Link>
        )}
      </header>
      {err && <p className="mt-2 text-sm text-red-400">{err}</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([icon, label, n]) => (
          <div key={label} className="a-card p-4">
            <p className="text-xl">{icon}</p>
            <p className="mt-1 text-2xl font-extrabold">{n}</p>
            <p className="text-xs a-mut">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold">Leads ({leads.length})</h2>
      {leads.length === 0 ? (
        <div className="a-card mt-4 p-8 text-center text-sm a-mut">
          No leads yet. Share your QR — leads land here automatically.
        </div>
      ) : (
        <div className="a-card mt-4 divide-y divide-[var(--line)]">
          {leads.map((l) => (
            <div key={l.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3.5 text-sm">
              <div className="min-w-0">
                <p className="font-semibold">{l.name || "—"}</p>
                <p className="a-mut">{[l.email, l.phone].filter(Boolean).join(" · ")}</p>
                {l.note && <p className="mt-1 text-xs a-mut">“{l.note}”</p>}
              </div>
              <span className="text-xs a-mut">{new Date(l.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
