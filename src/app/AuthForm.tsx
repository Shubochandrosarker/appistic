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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-center text-2xl font-extrabold tracking-tight">
        App<span style={{ color: "var(--acc)" }}>istic</span>
      </Link>
      <form onSubmit={submit} className="a-card space-y-3 p-7">
        <h1 className="text-xl font-bold">{mode === "signup" ? "Create your free card" : "Welcome back"}</h1>
        {mode === "signup" && (
          <input name="name" placeholder="Your name" required className="a-input" autoComplete="name" />
        )}
        <input name="email" type="email" placeholder="Email" required className="a-input" autoComplete="email" />
        <input name="password" type="password" placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"} required minLength={8} className="a-input" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button type="submit" disabled={busy} className="a-btn w-full py-3 text-sm">
          {busy ? "…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
        <p className="pt-1 text-center text-xs a-mut">
          {mode === "signup" ? (
            <>Already have an account? <Link href="/login" className="underline" style={{ color: "var(--acc)" }}>Log in</Link></>
          ) : (
            <>New here? <Link href="/signup" className="underline" style={{ color: "var(--acc)" }}>Create a free account</Link></>
          )}
        </p>
      </form>
    </main>
  );
}
