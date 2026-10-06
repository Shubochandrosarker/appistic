"use client";

import { useEffect, useRef, useState } from "react";

export type CardData = {
  id: string;
  slug: string;
  brandName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  theme: { preset: string; accent: string };
  links: { type: string; label: string; url: string }[];
  products: { title: string; price: string; url: string; image: string; desc: string }[];
  leadFormEnabled: boolean;
};

type Preset = { bg: string; surface: string; text: string; mut: string; line: string; dark?: boolean };

/* HiHello-inspired themes: soft gradient background, floating white card, big radius */
const PRESETS: Record<string, Preset> = {
  snow: { bg: "linear-gradient(180deg,#f7f8fa 0%,#eef1f6 100%)", surface: "#ffffff", text: "#171923", mut: "#6b7280", line: "#e7e9f0" },
  linen: { bg: "linear-gradient(180deg,#faf6f2 0%,#f3ece4 100%)", surface: "#ffffff", text: "#221c16", mut: "#7a6f63", line: "#ece2d8" },
  sky: { bg: "linear-gradient(180deg,#f2f7fc 0%,#e4eef7 100%)", surface: "#ffffff", text: "#12212e", mut: "#5f7488", line: "#dce7f1" },
  mint: { bg: "linear-gradient(180deg,#f2faf6 0%,#e3f2ea 100%)", surface: "#ffffff", text: "#0f241a", mut: "#5e7a6d", line: "#daeee4" },
  blush: { bg: "linear-gradient(180deg,#fdf3f2 0%,#fae6e3 100%)", surface: "#ffffff", text: "#2b1512", mut: "#8a635d", line: "#f4dbd7" },
  // legacy dark themes (kept for cards created before the redesign)
  midnight: { bg: "linear-gradient(180deg,#0b0b12 0%,#161627 100%)", surface: "#161627", text: "#f4f4f8", mut: "#9a9aad", line: "#262636", dark: true },
  ocean: { bg: "linear-gradient(180deg,#071a2b 0%,#0d2f4b 100%)", surface: "#0d2f4b", text: "#eef6ff", mut: "#9db8cf", line: "#1c4266", dark: true },
  forest: { bg: "linear-gradient(180deg,#082016 0%,#0f3a28 100%)", surface: "#0f3a28", text: "#eafff5", mut: "#9cc4b0", line: "#1d563c", dark: true },
  sunset: { bg: "linear-gradient(180deg,#1f0e14 0%,#3d1526 100%)", surface: "#3d1526", text: "#fff0f5", mut: "#cf9fb2", line: "#5c2740", dark: true },
  mono: { bg: "linear-gradient(180deg,#101010 0%,#1d1d1d 100%)", surface: "#1d1d1d", text: "#f5f5f5", mut: "#a3a3a3", line: "#333333", dark: true },
};

function track(cardId: string, type: string, ref = "") {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cardId, type, ref }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

const ICONS: Record<string, string> = {
  website: "🌐", instagram: "📸", facebook: "📘", whatsapp: "💬", youtube: "▶️",
  x: "𝕏", linkedin: "💼", tiktok: "🎵", email: "✉️", phone: "📞", link: "🔗",
  shop: "🛍️", map: "📍", telegram: "✈️",
};

export default function CardClient({ card }: { card: CardData }) {
  const accent = card.theme?.accent || "#ea3a2e";
  const p = PRESETS[card.theme?.preset] || PRESETS.snow;
  const soft = p.dark ? "#ffffff14" : "rgba(23,25,35,0.04)";
  const chipBg = p.dark ? "#ffffff10" : "#ffffff";
  const chipBorder = p.dark ? "#ffffff1f" : p.line;
  const tracked = useRef(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadState, setLeadState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [leadMsg, setLeadMsg] = useState("");

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const seen = sessionStorage.getItem(`ap_v_${card.id}`);
    track(card.id, seen ? "view" : "qr_scan");
    sessionStorage.setItem(`ap_v_${card.id}`, "1");
  }, [card.id]);

  async function submitLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLeadState("sending");
    const r = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: card.slug, name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), note: fd.get("note") }),
    });
    if (r.ok) {
      setLeadState("done");
    } else {
      const j = await r.json().catch(() => ({}));
      setLeadMsg(j.error || "Something went wrong.");
      setLeadState("error");
    }
  }

  return (
    <main style={{ background: p.bg, minHeight: "100dvh", color: p.text }}>
      <div className="mx-auto max-w-md px-4 pb-28 pt-8">
        {/* the card */}
        <div className="p-7" style={{ background: p.surface, border: `1px solid ${p.line}`, borderRadius: 32, boxShadow: "rgba(60,64,90,0.14) 0px 25px 50px 0px" }}>
          {/* header */}
          <div className="flex flex-col items-center text-center">
            {card.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.avatarUrl} alt={card.brandName} className="h-24 w-24 rounded-full object-cover" style={{ border: `3px solid ${accent}` }} />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-extrabold" style={{ background: `${accent}1a`, color: accent }}>
                {card.brandName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight" style={{ color: p.text }}>{card.brandName}</h1>
            {card.headline && <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>{card.headline}</p>}
            {card.bio && <p className="mt-3 text-sm leading-relaxed" style={{ color: p.mut }}>{card.bio}</p>}

            {/* quick actions */}
            <div className="mt-5 flex gap-3">
              {card.phone && (
                <a href={`tel:${card.phone.replace(/[^+\d]/g, "")}`} className="px-6 py-2.5 text-sm font-bold" style={{ background: accent, color: "#fff", borderRadius: 999 }}>
                  Call
                </a>
              )}
              <a href={`/vcard/${card.slug}`} onClick={() => track(card.id, "vcard_save", "button")}
                className="px-6 py-2.5 text-sm font-bold"
                style={{ background: chipBg, color: p.text, borderRadius: 999, border: `1.5px solid ${p.dark ? "#ffffff2e" : p.line}` }}>
                Save contact
              </a>
            </div>
          </div>

          {/* contact rows */}
          {(card.phone || card.email || card.website || card.address) && (
            <section className="mt-7 space-y-2">
              {card.phone && <Row p={p} icon="📞" label={card.phone} href={`tel:${card.phone.replace(/[^+\d]/g, "")}`} />}
              {card.email && <Row p={p} icon="✉️" label={card.email} href={`mailto:${card.email}`} />}
              {card.website && <Row p={p} icon="🌐" label={card.website.replace(/^https?:\/\//, "")} href={card.website} />}
              {card.address && <Row p={p} icon="📍" label={card.address} href={`https://maps.google.com/?q=${encodeURIComponent(card.address)}`} />}
            </section>
          )}

          {/* social links */}
          {card.links.length > 0 && (
            <section className="mt-7">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: p.mut }}>Follow</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {card.links.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    onClick={() => track(card.id, "link_click", l.label)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-transform active:scale-[.98]"
                    style={{ background: chipBg, border: `1px solid ${chipBorder}`, borderRadius: 16, color: p.text }}
                  >
                    <span>{ICONS[l.type] || "🔗"}</span>
                    <span className="truncate">{l.label}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* products / store */}
          {card.products.length > 0 && (
            <section className="mt-7">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: p.mut }}>Products</h2>
              <div className="space-y-3">
                {card.products.map((prd, i) => (
                  <a
                    key={i}
                    href={prd.url || "#"}
                    target={prd.url ? "_blank" : undefined}
                    rel="noopener noreferrer nofollow"
                    onClick={() => track(card.id, "product_click", prd.title)}
                    className="flex gap-3 p-3 transition-transform active:scale-[.99]"
                    style={{ background: chipBg, border: `1px solid ${chipBorder}`, borderRadius: 18 }}
                  >
                    {prd.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prd.image} alt={prd.title} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: soft }}>🛍️</div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-bold" style={{ color: p.text }}>{prd.title}</p>
                        {prd.price && <span className="shrink-0 text-sm font-extrabold" style={{ color: accent }}>{prd.price}</span>}
                      </div>
                      {prd.desc && <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: p.mut }}>{prd.desc}</p>}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* lead form */}
          {card.leadFormEnabled && (
            <section className="mt-7">
              {leadState === "done" ? (
                <div className="p-5 text-center text-sm font-semibold" style={{ background: "#22c55e1a", border: "1px solid #22c55e55", borderRadius: 18, color: "#15803d" }}>
                  ✅ Saved! {card.brandName} will get back to you.
                </div>
              ) : leadOpen ? (
                <form onSubmit={submitLead} className="space-y-2.5 p-5" style={{ background: chipBg, border: `1px solid ${chipBorder}`, borderRadius: 20 }}>
                  <p className="text-sm font-bold" style={{ color: p.text }}>Get in touch</p>
                  <input name="name" placeholder="Your name" required className="w-full px-3 py-2.5 text-sm" style={{ background: p.dark ? "#00000040" : "#fbfbfd", border: `1.5px solid ${chipBorder}`, borderRadius: 12, outline: "none", color: p.text }} />
                  <input name="email" type="email" placeholder="Email" className="w-full px-3 py-2.5 text-sm" style={{ background: p.dark ? "#00000040" : "#fbfbfd", border: `1.5px solid ${chipBorder}`, borderRadius: 12, outline: "none", color: p.text }} />
                  <input name="phone" placeholder="Phone (optional)" className="w-full px-3 py-2.5 text-sm" style={{ background: p.dark ? "#00000040" : "#fbfbfd", border: `1.5px solid ${chipBorder}`, borderRadius: 12, outline: "none", color: p.text }} />
                  <textarea name="note" rows={2} placeholder="Message (optional)" className="w-full px-3 py-2.5 text-sm" style={{ background: p.dark ? "#00000040" : "#fbfbfd", border: `1.5px solid ${chipBorder}`, borderRadius: 12, outline: "none", color: p.text }} />
                  <button type="submit" disabled={leadState === "sending"} className="w-full py-3 text-sm font-bold" style={{ background: accent, color: "#fff", borderRadius: 999 }}>
                    {leadState === "sending" ? "Sending…" : "Send my info"}
                  </button>
                  {leadState === "error" && <p className="text-xs text-red-400">{leadMsg}</p>}
                </form>
              ) : (
                <button onClick={() => setLeadOpen(true)} className="w-full py-3.5 text-sm font-bold" style={{ background: `${accent}14`, color: accent, borderRadius: 999, border: `1.5px solid ${accent}44` }}>
                  📥 Send my info
                </button>
              )}
            </section>
          )}
        </div>

        <p className="mt-8 text-center text-[11px]" style={{ color: p.mut }}>
          Made with <a href="/" className="font-bold underline" style={{ color: accent }}>Appistic</a> — digital business cards
        </p>
      </div>
    </main>
  );
}

function Row({ p, icon, label, href }: { p: Preset; icon: string; label: string; href: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer nofollow"
      className="flex items-center gap-3 px-4 py-3 text-sm"
      style={{ background: p.dark ? "#ffffff0d" : "#fbfbfd", border: `1px solid ${p.line}`, borderRadius: 14, color: p.text }}>
      <span>{icon}</span>
      <span className="truncate" style={{ color: p.mut }}>{label}</span>
    </a>
  );
}
