import Link from "next/link";
import { PRICING } from "@/lib/plan";

export const metadata = { title: "Pricing — Appistic" };

const free = ["1 digital business card", "Dynamic QR with unlimited scans", "50 leads per month", "Core analytics", "Save-to-contacts vCard", "Five clean themes"];
const pro = ["10 digital business cards", "Everything in Free", "Unlimited lead capture", "Leads CSV export", "Remove Appistic branding", "Priority support"];

export default function Pricing() {
  return (
    <main className="a-shell min-h-screen">
      <nav className="a-nav"><div className="a-container flex items-center justify-between py-4"><Link href="/" className="a-brand text-lg"><span className="a-brand-mark">A<span className="text-[var(--acc)]">.</span></span><span>App<span className="text-[var(--acc)]">istic</span></span></Link><Link href="/login" className="a-ghost px-4 py-2 text-xs">Log in</Link></div></nav>
      <div className="a-container py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center"><p className="a-eyebrow">Simple by design</p><h1 className="mt-4 text-4xl font-black tracking-[-.06em] sm:text-6xl">A plan for the stage you&apos;re in.</h1><p className="mt-5 text-base leading-7 text-[var(--mut-strong)]">Start with the essentials. Upgrade when your business needs more room to grow.</p></div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
          <PlanCard title="Free" price="$0" suffix="forever" description="Everything you need to make a memorable first impression." items={free} cta="Start free" href="/signup" />
          <PlanCard title="Pro" price={`$${PRICING.proMonthlyUsd}`} suffix="/month" description="More cards, more conversations, and a cleaner brand experience." items={pro} cta="Choose Pro" href="/signup" featured />
        </div>
        <div className="mx-auto mt-7 grid max-w-5xl gap-4 sm:grid-cols-3"><div className="a-card p-5"><p className="text-lg font-black">1 → 10</p><p className="mt-1 text-xs text-[var(--mut)]">cards as you grow</p></div><div className="a-card p-5"><p className="text-lg font-black">50 → ∞</p><p className="mt-1 text-xs text-[var(--mut)]">monthly lead capacity</p></div><div className="a-card p-5"><p className="text-lg font-black">$0 to start</p><p className="mt-1 text-xs text-[var(--mut)]">no credit card required</p></div></div>
        <div className="mx-auto mt-14 max-w-5xl border-t border-[var(--line)] pt-7 text-center text-xs text-[var(--mut)]"><p>Pro is ${PRICING.proYearlyUsd}/year when billed annually. Payments are secured by Paddle. Cancel anytime from your customer portal.</p></div>
      </div>
    </main>
  );
}

function PlanCard({ title, price, suffix, description, items, cta, href, featured = false }: { title: string; price: string; suffix: string; description: string; items: string[]; cta: string; href: string; featured?: boolean }) {
  return <article className={`relative overflow-hidden rounded-[1.5rem] border p-7 sm:p-9 ${featured ? "border-[var(--acc)] bg-[var(--txt)] text-white shadow-[0_24px_70px_rgba(23,25,35,.18)]" : "a-card"}`}>
    {featured && <div className="absolute right-6 top-6 rounded-full bg-[#f28d82] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--txt)]">Most chosen</div>}
    <p className={`text-sm font-black ${featured ? "text-[#f28d82]" : "text-[var(--acc)]"}`}>{title}</p><div className="mt-5 flex items-end gap-2"><span className="text-5xl font-black tracking-[-.07em]">{price}</span><span className={`mb-2 text-sm ${featured ? "text-white/50" : "text-[var(--mut)]"}`}>{suffix}</span></div><p className={`mt-4 max-w-sm text-sm leading-6 ${featured ? "text-white/60" : "text-[var(--mut-strong)]"}`}>{description}</p>
    <ul className="mt-8 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm"><span className={`font-black ${featured ? "text-[#f28d82]" : "text-[var(--acc)]"}`}>✓</span><span className={featured ? "text-white/80" : "text-[var(--mut-strong)]"}>{item}</span></li>)}</ul>
    <Link href={href} className={`mt-9 w-full py-3.5 text-center text-sm ${featured ? "a-btn bg-[#f28d82] text-[var(--txt)] shadow-none hover:bg-white" : "a-ghost"}`}>{cta} <span aria-hidden>↗</span></Link>
  </article>;
}
