import Link from "next/link";
import { PRICING } from "@/lib/plan";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-extrabold tracking-tight">
          App<span style={{ color: "var(--acc)" }}>istic</span>
        </span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/pricing" className="a-mut hover:opacity-70">Pricing</Link>
          <Link href="/login" className="a-mut hover:opacity-70">Log in</Link>
          <Link href="/signup" className="a-btn px-4 py-2 text-sm">Get your card</Link>
        </div>
      </nav>

      {/* hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-14 text-center">
        <p className="mx-auto mb-5 w-fit rounded-full border border-[var(--line)] px-4 py-1.5 text-xs font-medium a-mut">
          Digital Business Card · Dynamic QR · Lead capture
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Your business in <span style={{ color: "var(--acc)" }}>one smart QR.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed a-mut sm:text-lg">
          Print one QR code. It never goes out of date. When people scan it, they land on your live page —
          your business info, products, socials — and every scan becomes a lead you can follow up.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="a-btn px-7 py-3.5 text-base">Create your card — free</Link>
          <Link href="/pricing" className="px-7 py-3.5 text-base font-semibold a-card hover:border-[var(--acc)]">See pricing</Link>
        </div>
        <p className="mt-4 text-xs a-mut">Free forever plan · No credit card required</p>

        {/* phone mock */}
        <div className="mx-auto mt-14 max-w-sm a-card p-6 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold" style={{ background: "var(--acc-soft)", border: "2px solid var(--acc)" }}>R</div>
            <div>
              <p className="font-bold">Rahim Store</p>
              <p className="text-xs" style={{ color: "var(--acc)" }}>Electronics · Dhaka</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {["📸 Instagram", "💬 WhatsApp", "🌐 Website", "🛍️ Products"].map((s) => (
              <div key={s} className="rounded-xl border border-[var(--line)] px-3 py-2.5 a-mut">{s}</div>
            ))}
          </div>
          <div className="mt-3 rounded-xl px-3 py-2.5 text-sm" style={{ background: "var(--acc-soft)", color: "var(--acc)" }}>
            ✅ 12 new leads this week
          </div>
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Everything a growing business needs. Nothing it doesn&apos;t.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["🔗", "Dynamic QR", "Your printed QR always points to your live page. Change content anytime — the QR never changes. Scans are counted."],
            ["🛍️", "Product mini-store", "Show up to 25 products with price, photo and a buy link. Your card becomes your storefront."],
            ["📥", "Lead inbox", "Visitors tap 'Send my info' — name, email, phone land straight in your dashboard. Follow up the same day."],
            ["📇", "Save to contacts", "One tap and you're in their phone. vCard with your number, email, website and address."],
            ["📈", "Real analytics", "Views, QR scans, link clicks, product clicks, contact saves. Know what your customers actually want."],
            ["🎨", "Clean themes", "5 professional themes with your accent color. Looks great in a browser, a wallet, or on paper."],
          ].map(([icon, t, d]) => (
            <div key={t} className="a-card p-6">
              <div className="text-2xl">{icon}</div>
              <h3 className="mt-3 font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed a-mut">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Live in 3 minutes</h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            ["1", "Create your card", "Name, photo, bio, contact info."],
            ["2", "Add your links & products", "Socials, website, WhatsApp, store items."],
            ["3", "Publish & print your QR", "Download the QR. Put it anywhere."],
          ].map(([n, t, d]) => (
            <div key={n} className="a-card p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white" style={{ background: "var(--acc)" }}>{n}</div>
              <h3 className="mt-3 font-bold">{t}</h3>
              <p className="mt-1.5 text-sm a-mut">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-8 text-center">
        <div className="a-card mx-auto max-w-2xl p-10">
          <h2 className="text-2xl font-bold">Stop printing new cards. Start collecting customers.</h2>
          <p className="mt-2 a-mut">Free plan forever. Pro when you grow — ${PRICING.proMonthlyUsd}/mo.</p>
          <Link href="/signup" className="a-btn mt-6 inline-block px-8 py-3.5">Create your card — free</Link>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-8 text-center text-xs a-mut">
        <p>Appistic — a WordPressistic LLC product · Albuquerque, NM · <a className="underline" href="mailto:hello@wordpressistic.com">hello@wordpressistic.com</a></p>
      </footer>
    </main>
  );
}
