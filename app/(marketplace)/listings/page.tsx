import Link from "next/link";
import { Suspense } from "react";
import { Archive, Eye, Package, Pause, Pencil, Plus } from "lucide-react";
import clsx from "clsx";
import { GearImage } from "@/components/gear-image";
import { Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import type { ListingStatus } from "@/lib/types";

export const metadata = { title: "My equipment" };

const tabs: { key: string; label: string; statuses: ListingStatus[] }[] = [
  { key: "active", label: "Active", statuses: ["active", "pending_review"] },
  { key: "drafts", label: "Drafts", statuses: ["draft"] },
  { key: "paused", label: "Paused", statuses: ["paused"] },
  { key: "archived", label: "Sold / Archived", statuses: ["sold", "archived"] },
];

async function List({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const tab = tabs.find((t) => t.key === sp.tab) ?? tabs[0];
  const mine = await api.equipment.mine();
  const shown = mine.filter((e) => tab.statuses.includes(e.status));
  return (
    <>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {tabs.map((t) => {
          const count = mine.filter((e) => t.statuses.includes(e.status)).length;
          return (
            <Link
              key={t.key}
              href={`/listings?tab=${t.key}`}
              role="tab"
              aria-selected={t.key === tab.key}
              className={clsx("-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap", t.key === tab.key ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink")}
            >
              {t.label} <span className="text-subtle">({count})</span>
            </Link>
          );
        })}
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={<Package className="size-6" />} title={`No ${tab.label.toLowerCase()} listings`} body="List your first piece of equipment and start earning from idle kit." action={{ label: "List equipment", href: "/listings/new" }} />
      ) : (
        <ul className="space-y-3">
          {shown.map((e) => (
            <li key={e.id} className="card flex flex-wrap items-center gap-4 p-3 pr-4">
              <GearImage src={e.images[0]} category={e.category} alt="" iconSize="size-7" className="size-20 shrink-0 rounded-[10px]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{e.title}</p>
                  <Badge tone={e.status === "active" ? "success" : e.status === "draft" ? "neutral" : "warning"}>{e.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-muted">{formatMoney(e.dailyRateMinor)}/day · Deposit {formatMoney(e.depositMinor)}</p>
                <p className="mt-1 flex gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1"><Eye className="size-3.5" /> {e.views} views</span>
                  <span>{e.requests} requests</span>
                </p>
              </div>
              <div className="flex gap-1">
                <Link href={`/equipment/${e.id}`} className="btn-ghost px-3" aria-label="View"><Eye className="size-4" /></Link>
                <Link href="/listings/new" className="btn-ghost px-3" aria-label="Edit"><Pencil className="size-4" /></Link>
                <button className="btn-ghost px-3" aria-label={e.status === "paused" ? "Unpause" : "Pause"}><Pause className="size-4" /></button>
                <button className="btn-ghost px-3" aria-label="Archive" title="Archive — listings with rental history are archived, never deleted"><Archive className="size-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-muted">Listings linked to active or disputed rentals can&apos;t be deleted — archive them instead so rental evidence is preserved.</p>
    </>
  );
}

export default function ListingsPage({ searchParams }: PageProps<"/listings">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader title="My equipment" description="Manage your listings, availability and pricing." actions={<Link href="/listings/new" className="btn-primary"><Plus className="size-4" /> Add equipment</Link>} />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <List searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
