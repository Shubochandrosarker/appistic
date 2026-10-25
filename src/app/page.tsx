import Link from "next/link";
import { PRICING } from "@/lib/plan";

const features = [
  ["01", "One link, always current", "Your printed QR keeps pointing to the same live page while your offer, contact details, and products evolve."],
  ["02", "A storefront in miniature", "Turn a scan into a clear next step with products, social links, contact actions, and a frictionless lead form."],
  ["03", "Signals you can act on", "See views, QR scans, link clicks, contact saves, product interest, and the leads ready for follow-up."],
];

const steps = [
  ["Create", "Set up your brand, contact details, and first card in a few focused fields."],
  ["Connect", "Add the links and products customers already ask you about."],
  ["Share", "Print one QR, put it on your counter, packaging, profile, or next to your signature."],
];

export default function Home() {
  return (
    <main className="a-shell min-h-screen">
      <nav className="a-nav sticky top-0 z-20">
        <div className="a-container flex items-center justify-between gap-4 py-4">
          <Link href="/" className="a-brand text-lg" aria-label="Appistic home">
            <span className="a-brand-mark">A<span className="text-[var(--acc)]">.</span></span>
            <span>App<span className="text-[var(--acc)]">istic</span></span>
          </Link>
          <div className="flex items-center gap-2 text-sm sm:gap-5">
            <Link href="/pricing" className="hidden font-bold text-[var(--mut)] transition-colors hover:text-[var(--txt)] sm:inline">Pricing</Link>
            <Link href="/login" className="font-bold text-[var(--mut)] transition-colors hover:text-[var(--txt)]">Log in</Link>
            <Link href="/signup" className="a-btn px-4 py-2.5 text-xs sm:px-5 sm:text-sm">Create your card <span aria-hidden>↗</span></Link>
          </div>
        </div>
      </nav>

      <section className="a-container grid items-center gap-12 pb-20 pt-16 lg:grid-cols-[1.03fr_.97fr] lg:gap-20 lg:pb-28 lg:pt-24">
        <div className="a-fade-up">
          <div className="a-pill mb-6 gap-2 bg-white/70"><span className="h-2 w-2 rounded-full bg-[var(--success)]" /> Your next introduction, ready to share</div>
          <p className="a-eyebrow">Digital identity for growing businesses</p>
          <h1 className="a-display mt-5 max-w-3xl">A better first impression, <em>one scan away.</em></h1>
          <p className="a-lede mt-7 max-w-xl">Appistic turns your business details, products, links, and lead capture into one polished page. Print your QR once. Keep your story current.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="a-btn px-6 py-3.5 text-sm">Create your card <span aria-hidden>↗</span></Link>
            <Link href="/pricing" className="a-ghost px-6 py-3.5 text-sm">See how it works</Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[var(--mut)]">
            <span>✓ Free forever plan</span><span>✓ No credit card required</span><span>✓ Dynamic QR</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[510px] lg:justify-self-end" aria-label="Appistic card preview">
          <div className="a-grid-pattern absolute -inset-5 rounded-[2rem] opacity-50" />
          <div className="relative grid gap-4 sm:grid-cols-[.75fr_1fr] sm:items-end">
            <div className="a-card-solid relative overflow-hidden rounded-[1.8rem] p-5 shadow-[0_30px_80px_rgba(31,31,42,.16)] sm:rotate-[-4deg]">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-[#f4a59b] via-[#f8d2ca] to-[#f4f1e9]" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-[var(--txt)] text-xl font-black text-white shadow-lg">RS</div>
              <p className="mt-4 text-lg font-black tracking-tight">Rahim Studio</p>
              <p className="mt-1 text-xs font-bold text-[var(--acc)]">Brand & product design · Dhaka</p>
              <p className="mt-4 text-xs leading-relaxed text-[var(--mut)]">A considered digital home for a business people can remember and reach.</p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-[11px] font-bold">
                <span className="rounded-xl bg-[#f7f7f4] px-3 py-2.5">Website ↗</span><span className="rounded-xl bg-[#f7f7f4] px-3 py-2.5">WhatsApp ↗</span>
              </div>
              <div className="mt-2 rounded-xl bg-[var(--acc-soft)] px-3 py-2.5 text-[11px] font-bold text-[var(--acc-strong)]">Send your details →</div>
            </div>
            <div className="a-card relative p-5 sm:translate-y-5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[.15em] text-[var(--mut)]"><span>Live insight</span><span className="text-[var(--success)]">This week</span></div>
              <div className="mt-5 flex items-end gap-2"><span className="text-4xl font-black tracking-tight">124</span><span className="mb-1 text-xs font-bold text-[var(--success)]">+18%</span></div>
              <p className="mt-1 text-xs text-[var(--mut)]">profile visits</p>
              <div className="mt-6 flex h-16 items-end gap-1.5">
                {[28, 42, 34, 52, 45, 62, 72, 58, 84, 68, 92, 78].map((height, i) => <span key={i} className="flex-1 rounded-t-md bg-[var(--acc)] opacity-70" style={{ height: `${height}%` }} />)}
              </div>
              <div className="a-rule mt-5" />
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><p className="font-black">12</p><p className="mt-1 text-[var(--mut)]">new leads</p></div><div><p className="font-black">38</p><p className="mt-1 text-[var(--mut)]">QR scans</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white/45">
        <div className="a-container grid gap-5 py-6 text-sm font-bold text-[var(--mut)] sm:grid-cols-3 sm:divide-x sm:divide-[var(--line)]">
          <p className="sm:px-6 sm:first:pl-0"><span className="mr-2 text-[var(--acc)]">01</span> One smart destination</p>
          <p className="sm:px-6"><span className="mr-2 text-[var(--acc)]">02</span> Clear actions for customers</p>
          <p className="sm:px-6 sm:last:pr-0"><span className="mr-2 text-[var(--acc)]">03</span> A follow-up list you own</p>
        </div>
      </section>

      <section className="a-container py-24 lg:py-32">
        <div className="max-w-2xl"><p className="a-eyebrow">Designed for momentum</p><h2 className="mt-4 text-3xl font-black tracking-[-.055em] sm:text-5xl">The small surface area your business actually needs.</h2><p className="mt-5 text-base leading-7 text-[var(--mut-strong)]">Every part of Appistic is built to shorten the distance between being discovered and being contacted.</p></div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {features.map(([n, title, body]) => <article key={n} className="a-card a-card-hover p-7"><p className="text-sm font-black text-[var(--acc)]">{n}</p><h3 className="mt-12 text-xl font-black tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--mut-strong)]">{body}</p><div className="mt-8 h-1 w-12 rounded-full bg-[var(--acc)]" /></article>)}
        </div>
      </section>

      <section className="bg-[var(--txt)] py-24 text-white lg:py-32">
        <div className="a-container grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#f28d82]">A calmer workflow</p><h2 className="mt-4 text-3xl font-black tracking-[-.05em] sm:text-5xl">From scan to conversation in three moves.</h2><p className="mt-5 max-w-md leading-7 text-white/60">No redesign every time your offer changes. No lost details in a screenshot. Just one living link.</p></div>
          <div className="grid gap-3">
            {steps.map(([title, body], i) => <div key={title} className="flex gap-5 border-b border-white/15 py-5 first:pt-0 last:border-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-[var(--txt)]">0{i + 1}</span><div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm leading-6 text-white/60">{body}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="a-container py-24 lg:py-32">
        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--acc)] px-7 py-12 text-white shadow-[0_28px_80px_rgba(227,75,60,.2)] sm:px-12 sm:py-16">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[34px] border-white/10" /><div className="absolute -bottom-40 right-24 h-72 w-72 rounded-full border-[34px] border-white/10" />
          <div className="relative max-w-2xl"><p className="text-xs font-black uppercase tracking-[.16em] text-white/70">Start with the essentials</p><h2 className="mt-4 text-3xl font-black tracking-[-.05em] sm:text-5xl">Your next introduction should feel intentional.</h2><p className="mt-5 max-w-xl leading-7 text-white/80">Create a polished card for free. Upgrade when you need more cards, unlimited lead capture, and CSV export.</p><Link href="/signup" className="mt-8 inline-flex rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[var(--acc-strong)] transition-transform hover:translate-y-[-2px]">Create your card <span className="ml-2" aria-hidden>↗</span></Link><p className="mt-4 text-xs text-white/70">Pro starts at ${PRICING.proMonthlyUsd}/month · ${PRICING.proYearlyUsd}/year</p></div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-8">
        <div className="a-container flex flex-col gap-3 text-xs text-[var(--mut)] sm:flex-row sm:items-center sm:justify-between"><p className="font-bold">Appistic · a WordPressistic LLC product</p><div className="flex gap-4"><Link href="/pricing" className="hover:text-[var(--txt)]">Pricing</Link><a href="mailto:hello@wordpressistic.com" className="hover:text-[var(--txt)]">Contact</a></div></div>
      </footer>
    </main>
  );
}
