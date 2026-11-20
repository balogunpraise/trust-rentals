"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Search } from "lucide-react";

const areas = ["All of Lagos", "Ikeja", "Lekki", "Victoria Island", "Yaba", "Surulere", "Gbagada", "Ikoyi", "Ajah"];

export function HeroSearch() {
  const router = useRouter();
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const p = new URLSearchParams();
        const q = String(f.get("q") ?? "").trim();
        const area = String(f.get("area") ?? "");
        const start = String(f.get("start") ?? "");
        if (q) p.set("q", q);
        if (area && area !== "All of Lagos") p.set("area", area);
        if (start) p.set("start", start);
        router.push(`/explore?${p.toString()}`);
      }}
      className="grid gap-2 rounded-2xl bg-surface p-2 shadow-[var(--shadow-pop)] md:grid-cols-[1.6fr_1fr_1fr_auto] md:gap-0 md:rounded-full md:p-1.5"
    >
      <label className="flex items-center gap-3 rounded-xl px-4 py-2.5 md:rounded-full md:border-r md:border-line">
        <Search className="size-5 shrink-0 text-brand" aria-hidden />
        <span className="flex-1">
          <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">What do you need?</span>
          <input name="q" placeholder="e.g. wireless lav, MixPre, PA" className="w-full bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none" />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-xl px-4 py-2.5 md:rounded-none md:border-r md:border-line">
        <MapPin className="size-5 shrink-0 text-brand" aria-hidden />
        <span className="flex-1">
          <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">Where</span>
          <select name="area" className="w-full bg-transparent text-sm text-ink focus:outline-none" defaultValue="All of Lagos">
            {areas.map((a) => <option key={a}>{a}</option>)}
          </select>
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-xl px-4 py-2.5">
        <CalendarDays className="size-5 shrink-0 text-brand" aria-hidden />
        <span className="flex-1">
          <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">Pickup</span>
          <input type="date" name="start" min="2026-11-20" className="w-full bg-transparent text-sm text-ink focus:outline-none" />
        </span>
      </label>
      <button type="submit" className="btn-primary rounded-xl px-7 py-3.5 md:rounded-full">
        <Search className="size-4" /> Search
      </button>
    </form>
  );
}
