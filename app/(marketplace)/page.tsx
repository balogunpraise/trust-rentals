import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, CreditCard, FileText, Handshake, Lock, ShieldCheck } from "lucide-react";
import { EquipmentCard } from "@/components/equipment-card";
import { categoryIcon } from "@/components/gear-image";
import { HeroSearch } from "@/components/hero-search";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import type { Equipment, PublicUser } from "@/lib/types";

function Grid({ items, owners }: { items: Equipment[]; owners: Map<string, PublicUser> }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((e) => <EquipmentCard key={e.id} item={e} owner={owners.get(e.ownerId)} />)}
    </div>
  );
}

function SectionHead({ title, subtitle, href }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline sm:flex">
          View all <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

const steps = [
  { icon: BadgeCheck, title: "Verify once", body: "Confirm your phone and identity through an approved provider. Your ID details are never shown publicly." },
  { icon: FileText, title: "Request & agree", body: "Pick dates, see the full cost upfront, and both accept a versioned rental agreement." },
  { icon: CreditCard, title: "Pay through a licensed provider", body: "Rental fee and refundable deposit are handled by a regulated payment provider — never a TrustRent wallet." },
  { icon: Camera, title: "Document handover & return", body: "Photo checklists at pickup and return create a timestamped record both parties confirm." },
];

export default async function HomePage() {
  const [categories, all, users] = await Promise.all([api.categories.list(), api.equipment.list(), api.users.all()]);
  const owners = new Map(users.map((u) => [u.id, u]));
  const popular = [...all].sort((a, b) => b.requests - a.requests).slice(0, 4);
  const recent = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const featured = popular[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(23,105,170,0.55),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(23,105,170,0.25),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-sky-200">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Now in beta · Professional audio · Lagos
            </p>
            <h1 className="text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Rent, buy and sell equipment <span className="text-sky-300">with confidence.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Microphones, wireless, recorders and PA from identity-verified owners near you — with clear agreements and documented handovers on every rental.
            </p>
          </div>
          <div className="mt-10 max-w-5xl text-ink">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <span className="text-slate-400">Popular:</span>
            {["Wireless lav", "MixPre", "Shotgun mic", "PA speakers", "IFB"].map((t) => (
              <Link key={t} href={`/explore?q=${encodeURIComponent(t.split(" ")[0])}`} className="rounded-full border border-white/15 px-3 py-0.5 text-slate-200 hover:bg-white/10">
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 text-sm sm:px-6 md:grid-cols-4">
          {[
            [BadgeCheck, "Identity-verified members", "via approved provider"],
            [FileText, "Versioned agreements", "accepted by both parties"],
            [Lock, "Licensed payment provider", "no in-app wallet"],
            [Camera, "Photo-documented handovers", "timestamped evidence"],
          ].map(([Icon, a, b]) => {
            const I = Icon as React.ElementType;
            return (
              <div key={a as string} className="flex items-center gap-3">
                <I className="size-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold">{a as string}</p>
                  <p className="text-xs text-muted">{b as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Categories */}
        <section className="pt-14">
          <SectionHead title="Browse by category" subtitle="Audio equipment only during beta." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((c) => {
              const Icon = categoryIcon[c.slug];
              const count = all.filter((e) => e.category === c.slug).length;
              return (
                <Link
                  key={c.slug}
                  href={`/explore?category=${c.slug}`}
                  className="card group flex flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-6" strokeWidth={1.6} />
                  </span>
                  <span className="text-sm leading-tight font-semibold">{c.name}</span>
                  <span className="text-xs text-muted">{count} listed</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="pt-16">
          <SectionHead title="Popular equipment" subtitle="Most-requested gear from verified owners this month." href="/explore?sort=relevance" />
          <Grid items={popular} owners={owners} />
        </section>

        <section className="pt-16">
          <SectionHead title="Recently listed" subtitle="Fresh inventory across Lagos. Always check dates before you plan." href="/explore?sort=newest" />
          <Grid items={recent} owners={owners} />
        </section>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="mt-20 border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Every rental leaves a clear record</h2>
            <p className="mt-2 text-muted">From request to return, each step is confirmed by both parties and tied to one transaction reference.</p>
          </div>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand text-white"><s.icon className="size-5" /></span>
                  <span className="text-sm font-semibold text-subtle">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Protection */}
      <section id="protection" className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark p-8 text-white md:grid-cols-2 md:p-14">
          <div>
            <ShieldCheck className="size-10 text-sky-200" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight">What we verify — and what we don&apos;t</h2>
            <p className="mt-3 text-sky-100">
              We show exactly which facts have been checked, not an opaque trust score. Verification reduces risk; it doesn&apos;t guarantee anyone&apos;s behaviour.
              Protections apply only to rentals agreed and paid on TrustRent.
            </p>
            <Link href="/verify" className="btn mt-6 bg-white text-brand-dark hover:bg-sky-50">
              Verify your identity <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="grid gap-3 text-sm">
            {[
              ["Phone verified", "Member proved control of their phone number by one-time code."],
              ["Identity verified", "Confirmed through an approved identity provider. NIN is never displayed."],
              ["Professional info reviewed", "Our team reviewed the member's stated profession and portfolio."],
              ["Serial number registered", "Owner registered the item's serial privately. Only the last 4 digits are shown."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="flex items-center gap-2 font-semibold"><BadgeCheck className="size-4 text-emerald-300" /> {t}</p>
                <p className="mt-1 text-sky-100">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Owner CTA */}
      {featured && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6">
          <div className="card grid items-center gap-8 p-8 md:grid-cols-[1.3fr_1fr] md:p-12">
            <div>
              <p className="eyebrow">For owners</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Your idle kit could be paying for itself</h2>
              <p className="mt-2 max-w-lg text-muted">
                List in minutes, approve every request yourself, and keep a photo record of every handover. Owners like {owners.get(featured.ownerId)?.displayName.split(" ")[0]} earn{" "}
                {formatMoney(featured.dailyRateMinor)}/day on a single {featured.brand} {featured.model}.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/listings/new" className="btn-primary">List equipment</Link>
                <Link href="/#how-it-works" className="btn-secondary">How it works</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              {[["You approve", "every request"], ["Agreement", "for every rental"], ["Deposit", "via licensed PSP"], ["Evidence", "at handover & return"]].map(([a, b]) => (
                <div key={a} className="rounded-xl bg-canvas p-4">
                  <p className="flex items-center justify-center gap-1.5 font-semibold"><Handshake className="size-4 text-brand" />{a}</p>
                  <p className="text-xs text-muted">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
