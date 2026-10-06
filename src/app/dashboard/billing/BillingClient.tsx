"use client";

import Link from "next/link";
import { useState } from "react";

export default function BillingClient({
  email,
  plan,
  portalUrl,
  pricing,
}: {
  email: string;
  plan: string;
  userId: string;
  portalUrl: string;
  pricing: { monthly: number; yearly: number };
  monthlyPriceId: string;
  yearlyPriceId: string;
}) {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  async function go(interval: "monthly" | "yearly") {
    setBusy(interval);
    setErr("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const j = await res.json().catch(() => ({}));
      if (j.url) window.location.href = j.url;
      else {
        setErr(j.error || "Checkout unavailable right now.");
        setBusy("");
      }
    } catch {
      setErr("Checkout unavailable right now.");
      setBusy("");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/dashboard" className="text-sm a-mut hover:opacity-70">← Dashboard</Link>
      <h1 className="mt-3 text-3xl font-extrabold">Billing</h1>
      <p className="mt-1 a-mut">
        {email} · Current plan: <b className="text-white">{plan === "pro" ? "Pro" : "Free"}</b>
      </p>

      {plan !== "pro" ? (
        <div className="a-card mt-8 p-7" style={{ borderColor: "var(--acc)" }}>
          <h2 className="text-lg font-bold">Upgrade to Pro</h2>
          <p className="mt-1 text-sm a-mut">10 cards · unlimited leads · CSV export · no Appistic branding</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button onClick={() => go("monthly")} disabled={!!busy} className="a-btn py-3 text-sm">
              {busy === "monthly" ? "…" : `$${pricing.monthly}/month`}
            </button>
            <button onClick={() => go("yearly")} disabled={!!busy} className="a-card py-3 text-sm font-semibold hover:border-[var(--acc)]">
              {busy === "yearly" ? "…" : `$${pricing.yearly}/year (save 18%)`}
            </button>
          </div>
          {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
          <p className="mt-4 text-xs a-mut">Secure checkout by Paddle · Cancel anytime</p>
        </div>
      ) : (
        <div className="a-card mt-8 p-7">
          <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>✓ You are on Pro</p>
          <p className="mt-1 text-sm a-mut">Manage payment method, invoices or cancel from the Paddle customer portal.</p>
          <a href={portalUrl} target="_blank" rel="noreferrer" className="a-btn mt-4 inline-block px-5 py-2.5 text-sm">Open billing portal</a>
        </div>
      )}

      <div className="mt-10 a-card p-6 text-xs a-mut">
        Need help? <a className="underline" href="mailto:hello@wordpressistic.com">hello@wordpressistic.com</a>
        {" · "}Appistic is a WordPressistic LLC product.
      </div>
    </main>
  );
}
