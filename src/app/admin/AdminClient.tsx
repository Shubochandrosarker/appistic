"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type U = { id: string; email: string; name: string; plan: string; paddleCustomerId: string | null; createdAt: string };
type C = { id: string; slug: string; brandName: string; published: boolean; userId: string; createdAt: string };
type L = { id: string; name: string; email: string; phone: string; cardId: string; createdAt: string };

export default function AdminClient({
  adminEmail,
  stats,
  users,
  cards,
  recentLeads,
}: {
  adminEmail: string;
  stats: { users: number; pro: number; cards: number; published: number; leads: number; events: number };
  users: U[];
  cards: C[];
  recentLeads: L[];
}) {
  const r = useRouter();
  const [tab, setTab] = useState<"users" | "cards" | "leads">("users");
  const [msg, setMsg] = useState("");

  async function act(url: string, method: string, body?: unknown, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await res.json().catch(() => ({}));
    setMsg(res.ok ? "✓ Done" : `✗ ${j.error || "Failed"}`);
    if (res.ok) r.refresh();
    setTimeout(() => setMsg(""), 2500);
  }

  const emailOf = (id: string) => users.find((u) => u.id === id)?.email || id.slice(0, 8);
  const slugOf = (id: string) => cards.find((c) => c.id === id)?.slug || id.slice(0, 8);

  const tiles = [
    ["Users", stats.users],
    ["Pro users", stats.pro],
    ["Cards", stats.cards],
    ["Published", stats.published],
    ["Leads total", stats.leads],
    ["Track events", stats.events],
  ] as const;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            App<span style={{ color: "var(--acc)" }}>istic</span> <span className="a-mut text-sm font-semibold">Admin</span>
          </Link>
          <p className="mt-0.5 text-xs a-mut">{adminEmail}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {msg && <span className="text-xs font-semibold">{msg}</span>}
          <Link href="/dashboard" className="a-ghost px-4 py-2 text-xs">My dashboard</Link>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {tiles.map(([label, n]) => (
          <div key={label} className="a-card p-4">
            <p className="text-2xl font-extrabold">{n}</p>
            <p className="mt-0.5 text-[11px] a-mut">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        {(["users", "cards", "leads"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-bold capitalize ${tab === t ? "a-btn" : "a-ghost"}`}>
            {t}{t === "leads" ? ` (${recentLeads.length} recent)` : ""}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="a-card mt-5 divide-y divide-[var(--line)]">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm">
              <div className="min-w-0">
                <p className="font-semibold">{u.name || "—"} <span className="a-mut font-normal">· {u.email}</span></p>
                <p className="text-xs a-mut">joined {new Date(u.createdAt).toLocaleDateString()}{u.paddleCustomerId ? ` · paddle ${u.paddleCustomerId}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${u.plan === "pro" ? "text-white" : "a-mut"}`}
                  style={u.plan === "pro" ? { background: "var(--acc)" } : { border: "1.5px solid var(--line)" }}>
                  {u.plan.toUpperCase()}
                </span>
                <button onClick={() => act(`/api/admin/users/${u.id}`, "PATCH", { plan: u.plan === "pro" ? "free" : "pro" })}
                  className="a-ghost px-3 py-1.5 text-[11px]">{u.plan === "pro" ? "→ Free" : "→ Pro"}</button>
                <button onClick={() => act(`/api/admin/users/${u.id}`, "DELETE", undefined, `Delete ${u.email} and ALL their cards/leads? This cannot be undone.`)}
                  className="px-3 py-1.5 text-[11px] font-bold text-red-500 hover:opacity-70">Delete</button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="p-8 text-center text-sm a-mut">No users yet.</p>}
        </div>
      )}

      {tab === "cards" && (
        <div className="a-card mt-5 divide-y divide-[var(--line)]">
          {cards.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm">
              <div className="min-w-0">
                <p className="font-semibold">{c.brandName || "—"} <span className="a-mut font-normal">· /c/{c.slug}</span></p>
                <p className="text-xs a-mut">owner {emailOf(c.userId)} · created {new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${c.published ? "text-white" : "a-mut"}`}
                  style={c.published ? { background: "#16a34a" } : { border: "1.5px solid var(--line)" }}>
                  {c.published ? "LIVE" : "DRAFT"}
                </span>
                <button onClick={() => act(`/api/admin/cards/${c.id}`, "PATCH", { published: !c.published })}
                  className="a-ghost px-3 py-1.5 text-[11px]">{c.published ? "Unpublish" : "Publish"}</button>
                <a href={`/c/${c.slug}`} target="_blank" rel="noreferrer" className="a-mut text-[11px] underline hover:opacity-70">Open ↗</a>
                <button onClick={() => act(`/api/admin/cards/${c.id}`, "DELETE", undefined, `Delete card "${c.brandName}" and its leads? This cannot be undone.`)}
                  className="px-3 py-1.5 text-[11px] font-bold text-red-500 hover:opacity-70">Delete</button>
              </div>
            </div>
          ))}
          {cards.length === 0 && <p className="p-8 text-center text-sm a-mut">No cards yet.</p>}
        </div>
      )}

      {tab === "leads" && (
        <div className="a-card mt-5 divide-y divide-[var(--line)]">
          {recentLeads.map((l) => (
            <div key={l.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3.5 text-sm">
              <div className="min-w-0">
                <p className="font-semibold">{l.name || "—"} <span className="a-mut font-normal">· {[l.email, l.phone].filter(Boolean).join(" · ")}</span></p>
                <p className="text-xs a-mut">card /c/{slugOf(l.cardId)}</p>
              </div>
              <span className="text-xs a-mut">{new Date(l.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {recentLeads.length === 0 && <p className="p-8 text-center text-sm a-mut">No leads yet.</p>}
        </div>
      )}
    </main>
  );
}
