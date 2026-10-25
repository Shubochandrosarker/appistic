"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password"), name: fd.get("name") }),
    });
    if (res.ok) {
      r.push("/dashboard");
      r.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <main className="a-shell grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
      <section className="hidden bg-[var(--txt)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="a-brand text-lg text-white"><span className="a-brand-mark bg-white text-[var(--txt)]">A<span className="text-[var(--acc)]">.</span></span><span>App<span className="text-[#f28d82]">istic</span></span></Link>
        <div className="max-w-md"><p className="text-xs font-black uppercase tracking-[.16em] text-[#f28d82]">Your business, considered</p><h2 className="mt-5 text-5xl font-black leading-[.98] tracking-[-.07em]">Make every introduction easier to remember.</h2><p className="mt-6 leading-7 text-white/60">Build a living business card with one smart link, one dynamic QR, and a clear path from interest to follow-up.</p><div className="mt-8 grid gap-3 text-sm text-white/75"><p>✓ Update your details without reprinting</p><p>✓ Capture the people who want to hear from you</p><p>✓ See what customers respond to</p></div></div>
        <p className="text-xs text-white/40">A WordPressistic LLC product</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="a-brand mb-10 text-xl lg:hidden"><span className="a-brand-mark">A<span className="text-[var(--acc)]">.</span></span><span>App<span className="text-[var(--acc)]">istic</span></span></Link>
          <div className="mb-7"><p className="a-eyebrow">{mode === "signup" ? "Start with the essentials" : "Welcome back"}</p><h1 className="mt-3 text-3xl font-black tracking-[-.05em]">{mode === "signup" ? "Create your free card" : "Continue to your workspace"}</h1><p className="mt-2 text-sm leading-6 text-[var(--mut)]">{mode === "signup" ? "A polished home for your business, ready in minutes." : "Your latest leads and card insights are waiting."}</p></div>
          <form onSubmit={submit} className="a-card space-y-4 p-6 sm:p-8">
        {mode === "signup" && (
          <label className="block"><span className="mb-1.5 block text-xs font-black text-[var(--mut)]">Your name</span><input name="name" placeholder="e.g. Rahim Ahmed" required className="a-input" autoComplete="name" /></label>
        )}
        <label className="block"><span className="mb-1.5 block text-xs font-black text-[var(--mut)]">Email</span><input name="email" type="email" placeholder="you@business.com" required className="a-input" autoComplete="email" /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-black text-[var(--mut)]">Password</span><input name="password" type="password" placeholder={mode === "signup" ? "At least 8 characters" : "Your password"} required minLength={8} className="a-input" autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
        {err && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
        <button type="submit" disabled={busy} className="a-btn w-full py-3.5 text-sm">
          {busy ? "…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
        <p className="pt-1 text-center text-xs text-[var(--mut)]">
          {mode === "signup" ? (
            <>Already have an account? <Link href="/login" className="font-bold text-[var(--acc)] underline">Log in</Link></>
          ) : (
            <>New here? <Link href="/signup" className="font-bold text-[var(--acc)] underline">Create a free account</Link></>
          )}
        </p>
          </form>
          <p className="mt-6 text-center text-[11px] text-[var(--mut)]">By continuing, you agree to use Appistic for legitimate business communication.</p>
        </div>
      </section>
    </main>
  );
}
