import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { GearImage } from "@/components/gear-image";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { api, CURRENT_USER_ID } from "@/lib/api-client";
import { formatMoney, formatRange } from "@/lib/format";
import { nextAction, STATE_LABEL, stateTone } from "@/lib/rental-state";
import type { Equipment, PublicUser, Rental } from "@/lib/types";

export const metadata = { title: "Rentals" };

function Row({ r, eq, other, role }: { r: Rental; eq?: Equipment; other?: PublicUser; role: "renter" | "owner" }) {
  const action = nextAction(r, CURRENT_USER_ID);
  return (
    <li>
      <Link href={`/rentals/${r.id}`} className="card flex items-center gap-4 p-3 pr-4 transition hover:border-brand/40 hover:shadow-[var(--shadow-card)]">
        {eq && <GearImage src={eq.images[0]} category={eq.category} alt="" iconSize="size-7" className="size-20 shrink-0 rounded-[10px]" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted">{r.reference}</span>
            <Badge tone={stateTone(r.state)}>{STATE_LABEL[r.state]}</Badge>
            {r.overdue && <Badge tone="danger">Overdue</Badge>}
          </div>
          <p className="mt-1 truncate font-semibold">{eq?.brand} {eq?.model}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays className="size-3.5" /> {formatRange(r.startDate, r.endDate)} · {role === "renter" ? "from" : "to"} {other?.displayName}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="font-semibold">{formatMoney(r.price.totalMinor)}</p>
          {action.who === "you" && r.state !== "COMPLETED" && <p className="text-xs font-semibold text-brand">{action.label}</p>}
        </div>
        <ChevronRight className="size-5 text-subtle" />
      </Link>
    </li>
  );
}

export default async function RentalsPage() {
  const [rentals, equipment, users] = await Promise.all([api.rentals.list(), api.equipment.list(), api.users.all()]);
  const allEq = new Map([...equipment, ...(await api.equipment.mine())].map((e) => [e.id, e]));
  const byId = new Map(users.map((u) => [u.id, u]));
  const renting = rentals.filter((r) => r.renterId === CURRENT_USER_ID);
  const lending = rentals.filter((r) => r.ownerId === CURRENT_USER_ID);
  const needsYou = rentals.filter((r) => nextAction(r, CURRENT_USER_ID).who === "you" && !["COMPLETED", "DISPUTED"].includes(r.state));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader title="Rentals" description="Every rental, its status and your next step — in one place." actions={<Link href="/explore" className="btn-primary">Find equipment</Link>} />

      {needsYou.length > 0 && (
        <div className="mb-8 rounded-[var(--radius-card)] border border-warning/30 bg-warning-soft p-4">
          <p className="font-semibold text-warning">{needsYou.length} rental{needsYou.length > 1 ? "s" : ""} need{needsYou.length === 1 ? "s" : ""} your action</p>
          <ul className="mt-1 text-sm text-ink-soft">
            {needsYou.map((r) => (
              <li key={r.id}>
                <Link href={`/rentals/${r.id}`} className="hover:underline">{r.reference} — {nextAction(r, CURRENT_USER_ID).label}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rentals.length === 0 ? (
        <EmptyState icon={<CalendarDays className="size-6" />} title="No rentals yet" body="When you request equipment or receive a request for yours, it shows up here." action={{ label: "Explore equipment", href: "/explore" }} />
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Renting <span className="text-muted">({renting.length})</span></h2>
            <ul className="space-y-3">
              {renting.map((r) => <Row key={r.id} r={r} eq={allEq.get(r.equipmentId)} other={byId.get(r.ownerId)} role="renter" />)}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Lending your equipment <span className="text-muted">({lending.length})</span></h2>
            <ul className="space-y-3">
              {lending.map((r) => <Row key={r.id} r={r} eq={allEq.get(r.equipmentId)} other={byId.get(r.renterId)} role="owner" />)}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
