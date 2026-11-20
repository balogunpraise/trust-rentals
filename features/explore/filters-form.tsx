"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/lib/types";

const areas = ["Ikeja", "Lekki", "Victoria Island", "Yaba", "Surulere", "Gbagada", "Ikoyi", "Ajah"];

export function FiltersForm({ categories, current }: { categories: Category[]; current: Record<string, string | undefined> }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const min = Number(f.get("min") || 0);
        const max = Number(f.get("max") || 0);
        if (min && max && min > max) {
          setError("Minimum price must be less than or equal to maximum price.");
          return;
        }
        const start = String(f.get("start") || "");
        const end = String(f.get("end") || "");
        if (start && end && end < start) {
          setError("End date cannot be before start date.");
          return;
        }
        setError(null);
        const p = new URLSearchParams();
        for (const [k, v] of f.entries()) if (v) p.set(k, String(v));
        if (current.q) p.set("q", current.q);
        router.push(`/explore?${p.toString()}`);
        (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
      }}
    >
      <div>
        <label className="label" htmlFor="f-category">Category</label>
        <select id="f-category" name="category" className="input" defaultValue={current.category ?? ""}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>
      <fieldset>
        <legend className="label">Listing type</legend>
        <div className="grid grid-cols-3 gap-1 rounded-[var(--radius-control)] bg-canvas p-1 text-sm">
          {[["", "Any"], ["rent", "Rent"], ["buy", "Buy"]].map(([v, l]) => (
            <label key={l} className="cursor-pointer">
              <input type="radio" name="type" value={v} defaultChecked={(current.type ?? "") === v} className="peer sr-only" />
              <span className="block rounded-md py-1.5 text-center font-medium text-muted peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-sm">{l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">Daily price (₦)</legend>
        <div className="flex items-center gap-2">
          <input aria-label="Minimum price" name="min" type="number" min={0} step={1000} placeholder="Min" defaultValue={current.min} className="input" aria-invalid={!!error?.startsWith("Minimum")} />
          <span className="text-muted">–</span>
          <input aria-label="Maximum price" name="max" type="number" min={0} step={1000} placeholder="Max" defaultValue={current.max} className="input" aria-invalid={!!error?.startsWith("Minimum")} />
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="f-area">Area</label>
        <select id="f-area" name="area" className="input" defaultValue={current.area ?? ""}>
          <option value="">All of Lagos</option>
          {areas.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
      <fieldset>
        <legend className="label">Availability</legend>
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Start date" type="date" name="start" defaultValue={current.start} className="input" />
          <input aria-label="End date" type="date" name="end" defaultValue={current.end} className="input" aria-invalid={!!error?.startsWith("End")} />
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="f-condition">Condition</label>
        <select id="f-condition" name="condition" className="input" defaultValue={current.condition ?? ""}>
          <option value="">Any condition</option>
          <option value="new">New</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>
      </div>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line p-3">
        <span className="text-sm">
          <span className="block font-medium">Identity-verified owners only</span>
          <span className="text-xs text-muted">Owner completed provider identity check</span>
        </span>
        <input type="checkbox" name="verified" value="1" defaultChecked={current.verified === "1"} className="size-4 accent-brand" />
      </label>
      <input type="hidden" name="sort" value={current.sort ?? ""} />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">Apply filters</button>
        <button type="button" className="btn-secondary" onClick={() => router.push(current.q ? `/explore?q=${encodeURIComponent(current.q)}` : "/explore")}>
          Clear all
        </button>
      </div>
    </form>
  );
}

export function SortSelect({ value }: { value?: string }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort</span>
      <select
        className="input w-auto py-1.5"
        value={value ?? "relevance"}
        onChange={(e) => {
          const p = new URLSearchParams(window.location.search);
          p.set("sort", e.target.value);
          router.push(`/explore?${p.toString()}`);
        }}
      >
        <option value="relevance">Relevance</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="newest">Newest</option>
      </select>
    </label>
  );
}
