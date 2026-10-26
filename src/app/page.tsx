import Link from "next/link";
import { PRICING } from "@/lib/plan";

const pillars = [
  ["01", "Make the introduction count", "Give people one polished place to find your story, contact details, products, and next step."],
  ["02", "Capture the conversation", "Let interested visitors send their details while the conversation is still fresh — no manual notes required."],
  ["03", "See what is working", "Track views, scans, clicks, saves, and leads so you can improve the way customers discover you."],
] as const;

const features = [
  ["Dynamic QR", "Update your card whenever your business changes. The QR you print keeps pointing to the live page."],
  ["Lead inbox", "Collect name, email, phone, and a note in one simple form. Follow up from a single owner dashboard."],
  ["Mini-store", "Show products, prices, images, and buy links without sending customers through a maze of pages."],
  ["Save to contacts", "Give every visitor a fast vCard download with the information they actually need."],
  ["Shareable profile", "Use one link in your email signature, social bio, proposals, packaging, and event materials."],
  ["Useful analytics", "Understand which introductions become visits, clicks, contact saves, and real leads."],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5" aria-label="Primary navigation">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl text-sm text-white" style={{ background: "var(--acc)" }}>A</span>
          App<span style={{ color: "var(--acc)" }}>istic</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <a href="#how-it-works" className="hidden a-mut hover:opacity-70 sm:inline">How it works</a>
          <a href="#features" className="hidden a-mut hover:opacity-70 sm:inline">Features</a>
          <Link href="/pricing" className="hidden a-mut hover:opacity-70 sm:inline">Pricing</Link>
          <Link href="/login" className="hidden a-mut hover:opacity-70 sm:inline">Log in</Link>
          <Link href="/signup" className="a-btn px-3 py-2 text-xs sm:px-4 sm:text-sm">
            <span className="sm:hidden">Start free</span>
            <span className="hidden sm:inline">Create your card</span>
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
        <div className="relative z-10">
          <p className="mb-5 w-fit rounded-full border border-[var(--line)] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] a-mut">
            Digital presence · Dynamic QR · Lead capture
          </p>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-7xl">
            Turn every introduction into a <span style={{ color: "var(--acc)" }}>next step.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed a-mut sm:text-lg">
            Appistic gives you one polished business profile for the moments that matter — then turns visits, scans, and conversations into follow-up opportunities.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="a-btn px-7 py-3.5 text-base">Create your card — free</Link>
            <Link href="/pricing" className="a-ghost px-7 py-3.5 text-base">See plans</Link>
          </div>
          <p className="mt-4 text-xs a-mut">Free forever plan · No credit card required · Live in minutes</p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mr-0">
          <div className="absolute -left-10 top-12 h-40 w-40 rounded-full blur-3xl" style={{ background: "var(--acc-soft)" }} aria-hidden="true" />
          <div className="a-card relative p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold" style={{ background: "var(--acc-soft)", color: "var(--acc)", border: "2px solid var(--acc)" }}>R</div>
                <div>
                  <p className="font-extrabold">Rahim Store</p>
                  <p className="text-xs a-mut">Your live business profile</p>
                </div>
              </div>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-extrabold" style={{ background: "#dcfce7", color: "#15803d" }}>LIVE</span>
            </div>
            <p className="mt-5 text-lg font-extrabold">Electronics · Dhaka</p>
            <p className="mt-2 text-sm leading-relaxed a-mut">One link for your story, products, social channels, and the next conversation.</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold">
              {["🌐 Website", "💬 WhatsApp", "🛍️ Products", "📇 Save contact"].map((item) => <div key={item} className="rounded-xl border border-[var(--line)] px-3 py-3 a-mut">{item}</div>)}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "var(--acc-soft)" }}>
              <div><p className="text-xs font-extrabold" style={{ color: "var(--acc)" }}>New lead captured</p><p className="mt-0.5 text-[11px] a-mut">Interested in your products</p></div>
              <span className="text-lg" aria-hidden="true">↗</span>
            </div>
          </div>
          <div className="a-card absolute -bottom-5 -left-5 hidden w-44 p-4 sm:block">
            <p className="text-[10px] font-extrabold uppercase tracking-wider a-mut">This month</p>
            <p className="mt-1 text-2xl font-extrabold">42</p>
            <p className="text-xs a-mut">profile visits</p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white" aria-label="Appistic value">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-6 text-center text-sm font-bold a-mut sm:justify-between sm:text-left">
          <span>For founders</span><span>For local businesses</span><span>For sales teams</span><span>For service professionals</span><span>For anyone who meets customers</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24" id="how-it-works">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--acc)" }}>The gap between meeting and follow-up</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">A printed card starts the conversation. Appistic helps you keep it.</h2>
          <p className="mt-5 leading-relaxed a-mut">Your information changes. People forget where they met you. Good leads get buried in notebooks and message threads. Appistic keeps the introduction current, useful, and measurable.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {pillars.map(([number, title, description]) => (
            <article key={number} className="a-card p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ background: "var(--acc)" }}>{number}</div>
              <h3 className="mt-6 text-lg font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed a-mut">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24" id="features">
        <div className="rounded-[28px] p-7 sm:p-12" style={{ background: "#171923", color: "#fff" }}>
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em]" style={{ color: "#ff9a91" }}>One profile, more useful moments</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Everything people need to say yes to the next step.</h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed" style={{ color: "#b9bdc9" }}>Keep the front door simple for visitors and the follow-up data useful for you.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map(([title, description]) => (
                <article key={title} className="rounded-2xl border p-4" style={{ borderColor: "#343744", background: "#20222d" }}>
                  <h3 className="font-extrabold">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#b9bdc9" }}>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-4">
        <div className="grid gap-4 md:grid-cols-3">
          {["Create your profile", "Share one smart link", "Follow up with context"].map((title, index) => (
            <div key={title} className="a-card p-6">
              <p className="text-xs font-extrabold" style={{ color: "var(--acc)" }}>0{index + 1}</p>
              <h3 className="mt-3 font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed a-mut">{index === 0 ? "Add your details, links, products, and brand accent in one place." : index === 1 ? "Put your QR and profile link on cards, packaging, email, social, and signage." : "See the visit, the click, and the lead so you know who to contact next."}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-24 text-center">
        <div className="a-card mx-auto max-w-3xl p-8 sm:p-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em]" style={{ color: "var(--acc)" }}>Start with a better first impression</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Make your next introduction easier to remember.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed a-mut">Build your free Appistic card today. Upgrade when you need more cards, unlimited leads, and CSV export — ${PRICING.proMonthlyUsd}/mo.</p>
          <Link href="/signup" className="a-btn mt-7 inline-block px-8 py-3.5">Create your card — free</Link>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-8 text-center text-xs a-mut">
        <p>Appistic — a WordPressistic LLC product · Albuquerque, NM · <a className="underline" href="mailto:hello@wordpressistic.com">hello@wordpressistic.com</a></p>
      </footer>
    </main>
  );
}
