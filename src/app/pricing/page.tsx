import Link from "next/link";
import { PRICING } from "@/lib/plan";

export const metadata = { title: "Pricing — Appistic" };

export default function Pricing() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/" className="text-sm a-mut hover:opacity-70">← Appistic</Link>
      <h1 className="mt-6 text-center text-4xl font-extrabold tracking-tight">Simple pricing.</h1>
      <p className="mt-3 text-center a-mut">Start free. Upgrade only when your business grows.</p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        <div className="a-card p-8">
          <h2 className="text-lg font-bold">Free</h2>
          <p className="mt-2 text-4xl font-extrabold">$0<span className="text-base font-medium a-mut"> forever</span></p>
          <ul className="mt-6 space-y-3 text-sm">
            {["1 digital business card", "Dynamic QR (unlimited scans)", "Lead capture — 50 leads/month", "Basic analytics (views, scans, clicks)", "Save-to-contacts vCard", "5 clean themes"].map((f) => (
              <li key={f} className="flex gap-2.5"><span style={{ color: "var(--acc)" }}>✓</span><span className="a-mut">{f}</span></li>
            ))}
          </ul>
          <Link href="/signup" className="a-ghost mt-8 block py-3 text-center">Start free</Link>
        </div>

        <div className="a-card p-8" style={{ borderColor: "var(--acc)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Pro</h2>
            <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: "var(--acc)" }}>RECOMMENDED</span>
          </div>
          <p className="mt-2 text-4xl font-extrabold">
            ${PRICING.proMonthlyUsd}<span className="text-base font-medium a-mut">/mo</span>
            <span className="ml-3 text-sm font-medium a-mut">or ${PRICING.proYearlyUsd}/yr</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {["10 business cards", "Everything in Free, plus:", "Unlimited lead capture", "Leads CSV export", "Remove 'Made with Appistic'", "Priority support"].map((f) => (
              <li key={f} className="flex gap-2.5"><span style={{ color: "var(--acc)" }}>✓</span><span className="a-mut">{f}</span></li>
            ))}
          </ul>
          <a href="/dashboard/billing" className="a-btn mt-8 block py-3 text-center font-semibold">Go Pro</a>
        </div>
      </div>

      <div className="mt-14 a-card p-6 text-sm a-mut">
        <p className="font-semibold">What we don&apos;t have (on purpose)</p>
        <p className="mt-2">No &ldquo;Agency&rdquo; plan. No &ldquo;Enterprise&rdquo; sales call. No per-seat math. One free plan, one Pro plan. That&apos;s it.</p>
      </div>

      <p className="mt-10 text-center text-xs a-mut">
        Payments secured by Paddle · Cancel anytime from your customer portal
      </p>
    </main>
  );
}
