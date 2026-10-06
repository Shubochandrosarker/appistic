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

const PRESETS: Record<string, string> = {
  midnight: "linear-gradient(180deg,#0b0b12 0%,#161627 100%)",
  ocean: "linear-gradient(180deg,#071a2b 0%,#0d2f4b 100%)",
  forest: "linear-gradient(180deg,#082016 0%,#0f3a28 100%)",
  sunset: "linear-gradient(180deg,#1f0e14 0%,#3d1526 100%)",
  mono: "linear-gradient(180deg,#101010 0%,#1d1d1d 100%)",
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
  const accent = card.theme?.accent || "#7c5cff";
  const bg = PRESETS[card.theme?.preset] || PRESETS.midnight;
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
    <main style={{ background: bg, minHeight: "100dvh" }} className="text-white">
      <div className="mx-auto max-w-md px-5 pb-28 pt-10">
        {/* header */}
        <div className="flex flex-col items-center text-center">
          {card.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.avatarUrl} alt={card.brandName} className="h-24 w-24 rounded-full border-2 object-cover" style={{ borderColor: accent }} />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 text-3xl font-bold" style={{ borderColor: accent, background: "#ffffff14" }}>
              {card.brandName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{card.brandName}</h1>
          {card.headline && <p className="mt-1 text-sm" style={{ color: accent }}>{card.headline}</p>}
          {card.bio && <p className="mt-3 text-sm leading-relaxed text-white/80">{card.bio}</p>}

          {/* quick actions */}
          <div className="mt-5 flex gap-3">
            {card.phone && (
              <a href={`tel:${card.phone.replace(/[^+\d]/g, "")}`} className="a-btn px-5 py-2.5 text-sm" style={{ background: accent }}>Call</a>
            )}
            <a href={`/vcard/${card.slug}`} onClick={() => track(card.id, "vcard_save", "button")} className="px-5 py-2.5 text-sm font-semibold text-white" style={{ background: "#ffffff1a", borderRadius: 12, border: `1px solid ${accent}` }}>
              Save contact
            </a>
          </div>
        </div>

        {/* contact rows */}
        {(card.phone || card.email || card.website || card.address) && (
          <section className="mt-8 space-y-2">
            {card.phone && <Row icon="📞" label={card.phone} href={`tel:${card.phone.replace(/[^+\d]/g, "")}`} />}
            {card.email && <Row icon="✉️" label={card.email} href={`mailto:${card.email}`} />}
            {card.website && <Row icon="🌐" label={card.website.replace(/^https?:\/\//, "")} href={card.website} />}
            {card.address && <Row icon="📍" label={card.address} href={`https://maps.google.com/?q=${encodeURIComponent(card.address)}`} />}
          </section>
        )}

        {/* social links */}
        {card.links.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Follow</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {card.links.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  onClick={() => track(card.id, "link_click", l.label)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-transform active:scale-[.98]"
                  style={{ background: "#ffffff10", border: "1px solid #ffffff1f", borderRadius: 12 }}
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
          <section className="mt-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Products</h2>
            <div className="space-y-3">
              {card.products.map((p, i) => (
                <a
                  key={i}
                  href={p.url || "#"}
                  target={p.url ? "_blank" : undefined}
                  rel="noopener noreferrer nofollow"
                  onClick={() => track(card.id, "product_click", p.title)}
                  className="flex gap-3 p-3 transition-transform active:scale-[.99]"
                  style={{ background: "#ffffff10", border: "1px solid #ffffff1f", borderRadius: 14 }}
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.title} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: "#ffffff12" }}>🛍️</div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{p.title}</p>
                      {p.price && <span className="shrink-0 text-sm font-bold" style={{ color: accent }}>{p.price}</span>}
                    </div>
                    {p.desc && <p className="mt-0.5 line-clamp-2 text-xs text-white/60">{p.desc}</p>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* lead form */}
        {card.leadFormEnabled && (
          <section className="mt-8">
            {leadState === "done" ? (
              <div className="p-5 text-center text-sm" style={{ background: "#22c55e22", border: "1px solid #22c55e55", borderRadius: 14 }}>
                ✅ Saved! {card.brandName} will get back to you.
              </div>
            ) : (
              <form onSubmit={submitLead} className="space-y-2.5 p-5" style={{ background: "#ffffff10", border: "1px solid #ffffff1f", borderRadius: 16 }}>
                <p className="text-sm font-semibold">Get in touch</p>
                <input name="name" placeholder="Your name" className="w-full px-3 py-2.5 text-sm" style={{ background: "#00000040", border: "1px solid #ffffff22", borderRadius: 10, outline: "none" }} />
                <input name="email" type="email" placeholder="Email" className="w-full px-3 py-2.5 text-sm" style={{ background: "#00000040", border: "1px solid #ffffff22", borderRadius: 10, outline: "none" }} />
                <input name="phone" placeholder="Phone (optional)" className="w-full px-3 py-2.5 text-sm" style={{ background: "#00000040", border: "1px solid #ffffff22", borderRadius: 10, outline: "none" }} />
                <textarea name="note" rows={2} placeholder="Message (optional)" className="w-full px-3 py-2.5 text-sm" style={{ background: "#00000040", border: "1px solid #ffffff22", borderRadius: 10, outline: "none" }} />
                <button type="submit" disabled={leadState === "sending"} className="a-btn w-full py-3 text-sm" style={{ background: accent }}>
                  {leadState === "sending" ? "Sending…" : "Send my info"}
                </button>
                {leadState === "error" && <p className="text-xs text-red-300">{leadMsg}</p>}
              </form>
            )}
          </section>
        )}

        <p className="mt-10 text-center text-[11px] text-white/35">
          Made with <a href="/" className="underline" style={{ color: accent }}>Appistic</a> — digital business cards
        </p>
      </div>
    </main>
  );
}

function Row({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer nofollow"
      className="flex items-center gap-3 px-4 py-3 text-sm"
      style={{ background: "#ffffff0d", border: "1px solid #ffffff1a", borderRadius: 12 }}>
      <span>{icon}</span>
      <span className="truncate text-white/90">{label}</span>
    </a>
  );
}
