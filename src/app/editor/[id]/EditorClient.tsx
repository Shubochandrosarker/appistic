"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type LinkItem = { type: string; label: string; url: string };
type ProductItem = { title: string; price: string; url: string; image: string; desc: string };
type CardData = {
  id: string; slug: string; brandName: string; headline: string; bio: string;
  avatarUrl: string; coverUrl: string; phone: string; email: string; website: string; address: string;
  theme: { preset: string; accent: string };
  links: LinkItem[]; products: ProductItem[];
  leadFormEnabled: boolean; published: boolean;
};

const THEMES: { id: string; name: string; grad: string }[] = [
  { id: "snow", name: "Snow", grad: "linear-gradient(135deg,#f7f8fa,#eef1f6)" },
  { id: "linen", name: "Linen", grad: "linear-gradient(135deg,#faf6f2,#f3ece4)" },
  { id: "sky", name: "Sky", grad: "linear-gradient(135deg,#f2f7fc,#e4eef7)" },
  { id: "mint", name: "Mint", grad: "linear-gradient(135deg,#f2faf6,#e3f2ea)" },
  { id: "blush", name: "Blush", grad: "linear-gradient(135deg,#fdf3f2,#fae6e3)" },
  { id: "midnight", name: "Midnight", grad: "linear-gradient(135deg,#0b0b12,#161627)" },
  { id: "mono", name: "Mono", grad: "linear-gradient(135deg,#101010,#1d1d1d)" },
];

const LINK_TYPES = ["website", "instagram", "facebook", "whatsapp", "youtube", "x", "linkedin", "tiktok", "telegram", "shop", "link"];

export default function EditorClient({ initial }: { initial: CardData }) {
  const r = useRouter();
  const [c, setC] = useState<CardData>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function set<K extends keyof CardData>(k: K, v: CardData[K]) {
    setC((p) => ({ ...p, [k]: v }));
    scheduleSave({ [k]: v });
  }
  function scheduleSave(patch: Partial<CardData>) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(patch), 900);
  }
  async function save(patch: Partial<CardData> = {}) {
    const res = await fetch(`/api/cards/${c.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...c, ...patch }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      r.refresh();
    } else setErr("Save failed — check connection.");
  }

  const updLink = (i: number, patch: Partial<LinkItem>) => {
    const links = c.links.map((l, j) => (j === i ? { ...l, ...patch } : l));
    set("links", links);
  };
  const updProd = (i: number, patch: Partial<ProductItem>) => {
    const products = c.products.map((p, j) => (j === i ? { ...p, ...patch } : p));
    set("products", products);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm a-mut hover:opacity-70">← Dashboard</Link>
          <h1 className="mt-1 text-2xl font-bold">Edit card</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs transition-opacity ${saved ? "opacity-100" : "opacity-0"}`} style={{ color: "#22c55e" }}>✓ Saved</span>
          <button onClick={() => set("published", !c.published)} className={`px-5 py-2.5 text-sm font-semibold ${c.published ? "a-card" : "a-btn"}`}>
            {c.published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}

      {c.published && (
        <div className="a-card mt-5 flex flex-wrap items-center gap-4 p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/qr/${c.slug}`} alt="QR" className="h-24 w-24 rounded-xl border border-[var(--line)] bg-white p-1.5" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold">Dynamic QR — live</p>
            <p className="a-mut">appistic.com/c/{c.slug}</p>
            <div className="mt-2 flex gap-3 text-xs">
              <a href={`/qr/${c.slug}`} download={`${c.slug}-qr.png`} className="a-btn px-4 py-2">Download QR (PNG)</a>
              <a href={`/c/${c.slug}`} target="_blank" rel="noreferrer" className="underline a-mut hover:opacity-70">Open live card ↗</a>
            </div>
          </div>
        </div>
      )}

      {/* basics */}
      <Section title="Basics">
        <Field label="Business / brand name"><input className="a-input" value={c.brandName} maxLength={80} onChange={(e) => set("brandName", e.target.value)} /></Field>
        <Field label="Headline (what you do)"><input className="a-input" value={c.headline} maxLength={120} placeholder="e.g. Electronics Store · Dhaka" onChange={(e) => set("headline", e.target.value)} /></Field>
        <Field label="About (short bio)"><textarea className="a-input" rows={3} value={c.bio} maxLength={1000} onChange={(e) => set("bio", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Avatar image URL"><input className="a-input" value={c.avatarUrl} placeholder="https://…" onChange={(e) => set("avatarUrl", e.target.value)} /></Field>
          <Field label="Contact phone"><input className="a-input" value={c.phone} placeholder="+880…" onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Contact email"><input className="a-input" value={c.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Website"><input className="a-input" value={c.website} placeholder="https://…" onChange={(e) => set("website", e.target.value)} /></Field>
          <Field label="Address (shows in Google Maps link)"><input className="a-input" value={c.address} onChange={(e) => set("address", e.target.value)} /></Field>
        </div>
      </Section>

      {/* theme */}
      <Section title="Theme">
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => (
            <button key={t.id} onClick={() => set("theme", { ...c.theme, preset: t.id })}
              className={`h-14 w-20 rounded-xl border-2 text-[10px] font-semibold text-white/80 ${c.theme.preset === t.id ? "" : "border-transparent opacity-70"}`}
              style={{ background: t.grad, borderColor: c.theme.preset === t.id ? "var(--acc)" : undefined }}>
              {t.name}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <input type="color" value={c.theme.accent} onChange={(e) => set("theme", { ...c.theme, accent: e.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--line)]" />
          <span className="text-sm a-mut">Accent color (buttons & highlights)</span>
        </div>
      </Section>

      {/* links */}
      <Section title={`Social links (${c.links.length}/25)`}>
        <div className="space-y-3">
          {c.links.map((l, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-[var(--line)] p-3 sm:grid-cols-[130px_1fr_2fr_36px]">
              <select className="a-input" value={l.type} onChange={(e) => updLink(i, { type: e.target.value })}>
                {LINK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="a-input" placeholder="Label" value={l.label} onChange={(e) => updLink(i, { label: e.target.value })} />
              <input className="a-input" placeholder="https://…" value={l.url} onChange={(e) => updLink(i, { url: e.target.value })} />
              <button onClick={() => set("links", c.links.filter((_, j) => j !== i))} className="a-mut hover:text-red-400">✕</button>
            </div>
          ))}
        </div>
        {c.links.length < 25 && (
          <button onClick={() => set("links", [...c.links, { type: "link", label: "", url: "" }])} className="mt-3 px-4 py-2.5 text-sm a-card hover:border-[var(--acc)]">+ Add link</button>
        )}
      </Section>

      {/* products */}
      <Section title={`Products (${c.products.length}/25)`}>
        <div className="space-y-3">
          {c.products.map((p, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-[var(--line)] p-3">
              <div className="grid gap-2 sm:grid-cols-[2fr_110px_36px]">
                <input className="a-input" placeholder="Product title" value={p.title} onChange={(e) => updProd(i, { title: e.target.value })} />
                <input className="a-input" placeholder="Price" value={p.price} onChange={(e) => updProd(i, { price: e.target.value })} />
                <button onClick={() => set("products", c.products.filter((_, j) => j !== i))} className="a-mut hover:text-red-400">✕</button>
              </div>
              <input className="a-input" placeholder="Buy link (https://…)" value={p.url} onChange={(e) => updProd(i, { url: e.target.value })} />
              <input className="a-input" placeholder="Image URL (https://…jpg/png)" value={p.image} onChange={(e) => updProd(i, { image: e.target.value })} />
              <input className="a-input" placeholder="Short description" value={p.desc} onChange={(e) => updProd(i, { desc: e.target.value })} />
            </div>
          ))}
        </div>
        {c.products.length < 25 && (
          <button onClick={() => set("products", [...c.products, { title: "", price: "", url: "", image: "", desc: "" }])} className="mt-3 px-4 py-2.5 text-sm a-card hover:border-[var(--acc)]">+ Add product</button>
        )}
      </Section>

      {/* lead form toggle */}
      <Section title="Lead capture">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={c.leadFormEnabled} onChange={(e) => set("leadFormEnabled", e.target.checked)} className="h-5 w-5 accent-[var(--acc)]" />
          Show &ldquo;Send my info&rdquo; form on the card (leads land in Analytics)
        </label>
      </Section>

      <div className="mt-8 flex justify-end">
        <button onClick={() => save()} disabled={busy} className="a-btn px-8 py-3 text-sm">Save now</button>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="a-card mt-6 p-6">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider a-mut">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium a-mut">{label}</span>
      {children}
    </label>
  );
}
