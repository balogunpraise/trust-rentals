import Link from "next/link";
import { BadgeCheck, Bell, CalendarDays, ChevronRight, Heart, HelpCircle, Package, Shield, Star, User } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { IdentityBadges } from "@/components/identity-badge";
import { Badge, Stars } from "@/components/ui";
import { api, CURRENT_USER_ID } from "@/lib/api-client";
import { formatMoney, formatRange } from "@/lib/format";
import { STATE_LABEL, stateTone } from "@/lib/rental-state";

export const metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const [me, rentals, mine, reviews, all] = await Promise.all([api.users.me(), api.rentals.list(), api.equipment.mine(), api.users.reviews(CURRENT_USER_ID), api.equipment.list()]);
  const eqMap = new Map([...all, ...mine].map((e) => [e.id, e]));
  const links = [
    { href: `/users/${me.id}`, icon: User, label: "View public profile", desc: "What other members see" },
    { href: "/listings", icon: Package, label: "My equipment", desc: `${mine.length} listings` },
    { href: "/rentals", icon: CalendarDays, label: "Rentals", desc: "As owner and renter" },
    { href: "/saved", icon: Heart, label: "Saved listings", desc: "Your shortlist" },
    { href: "/settings", icon: Shield, label: "Verification & security", desc: "Identity, password, sessions" },
    { href: "/notifications", icon: Bell, label: "Notifications", desc: "Activity and preferences" },
    { href: "/help", icon: HelpCircle, label: "Help, privacy & support", desc: "Policies, data requests, tickets" },
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar user={me} size="xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{me.displayName}</h1>
          <p className="text-muted">{me.profession} · {me.area}, {me.city}</p>
          <div className="mt-3"><IdentityBadges verification={me.verification} /></div>
        </div>
        <Link href="/settings" className="btn-secondary">Edit profile</Link>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Completed rentals", me.stats.completedRentals], ["Sales", me.stats.completedSales], ["On-time returns", me.stats.onTimeReturns], ["Rating", me.stats.rating ?? "—"]].map(([l, v]) => (
          <div key={l} className="card p-4">
            <dt className="text-xs text-muted">{l}</dt>
            <dd className="mt-1 flex items-center gap-1 text-2xl font-bold">{l === "Rating" && <Star className="size-5 fill-[#f5a524] text-[#f5a524]" />}{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1fr]">
        <nav className="card divide-y divide-line" aria-label="Account">
          {links.map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} className="flex items-center gap-3 p-4 hover:bg-canvas">
              <Icon className="size-5 text-brand" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">{label}</span>
                <span className="text-xs text-muted">{desc}</span>
              </span>
              <ChevronRight className="size-4 text-subtle" />
            </Link>
          ))}
        </nav>
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-semibold">Transaction history</h2>
            <ul className="card divide-y divide-line">
              {rentals.map((r) => (
                <li key={r.id}>
                  <Link href={`/rentals/${r.id}`} className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-canvas">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{eqMap.get(r.equipmentId)?.brand} {eqMap.get(r.equipmentId)?.model}</span>
                      <span className="text-xs text-muted">{r.reference} · {r.renterId === CURRENT_USER_ID ? "Rented" : "Lent"} · {formatRange(r.startDate, r.endDate)}</span>
                    </span>
                    <span className="text-right">
                      <Badge tone={stateTone(r.state)}>{STATE_LABEL[r.state]}</Badge>
                      <span className="mt-1 block text-xs text-muted">{formatMoney(r.price.totalMinor)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">Reviews about you <BadgeCheck className="size-4 text-success" /></h2>
            <ul className="card divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="p-4 text-sm">
                  <Stars rating={r.rating} />
                  <p className="mt-1 text-ink-soft">{r.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
