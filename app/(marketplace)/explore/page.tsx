import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import { EquipmentCard } from "@/components/equipment-card";
import { CardGridSkeleton, EmptyState } from "@/components/ui";
import { FiltersForm, SortSelect } from "@/features/explore/filters-form";
import { api } from "@/lib/api-client";
import { rangeOverlapsBlocked } from "@/lib/pricing";
import type { CategorySlug, Condition, EquipmentFilters, ListingType } from "@/lib/types";

export const metadata: Metadata = { title: "Explore equipment" };

type SP = Record<string, string | string[] | undefined>;

async function Results({ searchParams }: { searchParams: Promise<SP> }) {
  const raw = await searchParams;
  const sp = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])) as Record<string, string | undefined>;
  const filters: EquipmentFilters = {
    q: sp.q,
    category: sp.category as CategorySlug | undefined,
    type: sp.type as ListingType | undefined,
    condition: sp.condition as Condition | undefined,
    area: sp.area,
    minPrice: sp.min ? Number(sp.min) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    verifiedOnly: sp.verified === "1",
    sort: sp.sort as EquipmentFilters["sort"],
  };
  const [categories, items, users] = await Promise.all([api.categories.list(), api.equipment.list(filters), api.users.all()]);
  const owners = new Map(users.map((u) => [u.id, u]));
  const results = sp.start && sp.end ? items.filter((e) => !rangeOverlapsBlocked(sp.start!, sp.end!, e.blockedDates)) : items;
  const catName = categories.find((c) => c.slug === sp.category)?.name;

  const chipLabels: Record<string, string | undefined> = {
    category: catName,
    type: sp.type === "rent" ? "For rent" : sp.type === "buy" ? "For sale" : undefined,
    area: sp.area,
    min: sp.min && `From ₦${Number(sp.min).toLocaleString()}`,
    max: sp.max && `Up to ₦${Number(sp.max).toLocaleString()}`,
    condition: sp.condition && `Condition: ${sp.condition}`,
    verified: sp.verified === "1" ? "Identity-verified owners" : undefined,
    start: sp.start && `From ${sp.start}`,
    end: sp.end && `To ${sp.end}`,
  };
  const chips = Object.entries(chipLabels).filter(([, v]) => v) as [string, string][];
  const without = (key: string) => {
    const p = new URLSearchParams(sp as Record<string, string>);
    p.delete(key);
    return `/explore?${p.toString()}`;
  };

  const filterPanel = <FiltersForm categories={categories} current={sp} />;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <div className="card sticky top-24 p-5">
          <h2 className="mb-4 font-semibold">Filters</h2>
          {filterPanel}
        </div>
      </aside>
      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {sp.q ? <>Results for “{sp.q}”</> : catName ?? "All audio equipment"}
            </h1>
            <p className="text-sm text-muted" aria-live="polite">{results.length} listing{results.length === 1 ? "" : "s"} in Lagos</p>
          </div>
          <div className="flex items-center gap-2">
            <details className="relative lg:hidden">
              <summary className="btn-secondary cursor-pointer list-none py-1.5">
                <SlidersHorizontal className="size-4" /> Filters {chips.length > 0 && `(${chips.length})`}
              </summary>
              <div className="fixed inset-0 z-50 overflow-y-auto bg-surface p-5">
                <p className="mb-4 text-lg font-semibold">Filter & sort</p>
                {filterPanel}
              </div>
            </details>
            <SortSelect value={sp.sort} />
          </div>
        </div>

        {chips.length > 0 && (
          <ul className="mb-6 flex flex-wrap gap-2">
            {chips.map(([k, label]) => (
              <li key={k}>
                <Link href={without(k)} className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-medium text-brand-dark hover:bg-brand/15">
                  {label} <X className="size-3" aria-label="Remove filter" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {results.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="No equipment matches these filters"
            body="Try removing a filter, widening the price range, or choosing different dates. Inventory is still growing during beta."
            action={{ label: "Clear filters", href: "/explore" }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((e) => <EquipmentCard key={e.id} item={e} owner={owners.get(e.ownerId)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage({ searchParams }: PageProps<"/explore">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Suspense fallback={<CardGridSkeleton count={6} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
