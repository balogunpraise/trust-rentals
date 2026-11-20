"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, CircleCheck, Save } from "lucide-react";
import clsx from "clsx";
import { EvidenceUploader } from "@/components/evidence-uploader";
import { categoryIcon, GearImage } from "@/components/gear-image";
import { InlineAlert } from "@/components/ui";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import type { Category, CategorySlug, Condition, ListingType } from "@/lib/types";

const STEPS = ["Category", "Details", "Condition", "Photos", "Ownership", "Pricing", "Availability", "Preview"];
const HIGH_VALUE: CategorySlug[] = ["recorders-mixers", "wireless", "pa"];

type Draft = {
  category?: CategorySlug;
  brand: string;
  model: string;
  description: string;
  condition?: Condition;
  conditionNotes: string;
  accessories: string;
  serial: string;
  listingType: ListingType;
  daily: string;
  weekly: string;
  sale: string;
  deposit: string;
  blockStart: string;
  blockEnd: string;
  area: string;
};

const empty: Draft = { brand: "", model: "", description: "", conditionNotes: "", accessories: "", serial: "", listingType: "rent", daily: "", weekly: "", sale: "", deposit: "", blockStart: "", blockEnd: "", area: "Yaba" };

export function ListingWizard({ categories }: { categories: Category[] }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [blocks, setBlocks] = useState<[string, string][]>([]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const highValue = d.category && HIGH_VALUE.includes(d.category);

  function validate(i: number) {
    const e: Record<string, string> = {};
    if (i === 0 && !d.category) e.category = "Choose a category.";
    if (i === 1) {
      if (!d.brand.trim()) e.brand = "Brand is required.";
      if (!d.model.trim()) e.model = "Model is required.";
      if (d.description.trim().length < 30) e.description = "Add at least 30 characters so renters know what they're getting.";
    }
    if (i === 2 && !d.condition) e.condition = "Select the condition.";
    if (i === 4 && highValue && !d.serial.trim()) e.serial = "Serial number is required for this category.";
    if (i === 5) {
      if (d.listingType !== "buy" && !(Number(d.daily) > 0)) e.daily = "Enter a daily rate.";
      if (d.listingType !== "buy" && !(Number(d.deposit) >= 0 && d.deposit !== "")) e.deposit = "Enter a deposit (0 if none).";
      if (d.listingType !== "rent" && !(Number(d.sale) > 0)) e.sale = "Enter a sale price.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const missing = [
    !d.category && "Category",
    !d.brand && "Brand",
    !d.model && "Model",
    !d.condition && "Condition",
    d.listingType !== "buy" && !d.daily && "Daily rate",
  ].filter(Boolean) as string[];

  if (published) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <CircleCheck className="mx-auto size-14 text-success" />
        <h2 className="mt-4 text-2xl font-bold">Submitted for review</h2>
        <p className="mt-2 text-muted">
          Your {d.brand} {d.model} listing is <strong>Pending review</strong>. New listings{highValue ? " in high-value categories" : ""} are checked by our team before they appear in search — usually within one business day.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/listings" className="btn-primary">Go to my equipment</Link>
          <button className="btn-secondary" onClick={() => { setD(empty); setStep(0); setPublished(false); }}>List another</button>
        </div>
      </div>
    );
  }

  const field = (k: keyof Draft, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={`w-${k}`}>{label}</label>
      <input id={`w-${k}`} className="input" value={d[k] as string} onChange={(e) => set(k, e.target.value as never)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `w-${k}-err` : undefined} {...props} />
      {errors[k] && <p id={`w-${k}-err`} className="mt-1 text-xs text-danger">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
      {/* Progress */}
      <ol className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={clsx(
                "flex w-full items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-left text-sm whitespace-nowrap",
                i === step ? "bg-brand-soft font-semibold text-brand" : i < step ? "text-ink hover:bg-canvas" : "text-subtle",
              )}
              aria-current={i === step ? "step" : undefined}
            >
              <span className={clsx("grid size-6 shrink-0 place-items-center rounded-full text-xs", i < step ? "bg-brand text-white" : i === step ? "border-2 border-brand" : "border border-line-strong")}>
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="card p-6 sm:p-8">
        <p className="eyebrow">Step {step + 1} of {STEPS.length}</p>
        <h2 className="mt-1 mb-6 text-xl font-semibold">{STEPS[step]}</h2>

        {step === 0 && (
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.map((c) => {
                const Icon = categoryIcon[c.slug];
                return (
                  <button
                    type="button"
                    key={c.slug}
                    onClick={() => set("category", c.slug)}
                    aria-pressed={d.category === c.slug}
                    className={clsx("flex flex-col items-center gap-2 rounded-[var(--radius-card)] border p-4 text-center text-sm transition", d.category === c.slug ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong")}
                  >
                    <Icon className="size-6 text-brand" />
                    <span className="font-medium">{c.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="mt-2 text-sm text-danger">{errors.category}</p>}
            <p className="mt-4 text-xs text-muted">TrustRent is audio-only during beta.</p>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {field("brand", "Brand", { placeholder: "e.g. Sennheiser" })}
            {field("model", "Model", { placeholder: "e.g. MKH 416" })}
            <div className="sm:col-span-2">
              <label className="label" htmlFor="w-desc">Description</label>
              <textarea id="w-desc" rows={5} className="input" value={d.description} onChange={(e) => set("description", e.target.value)} aria-invalid={!!errors.description} placeholder="What is it good for? What's included? Any quirks?" />
              {errors.description && <p className="mt-1 text-xs text-danger">{errors.description}</p>}
            </div>
            <div>
              <label className="label" htmlFor="w-area">Pickup area</label>
              <select id="w-area" className="input" value={d.area} onChange={(e) => set("area", e.target.value)}>
                {["Ikeja", "Lekki", "Victoria Island", "Yaba", "Surulere", "Gbagada", "Ikoyi", "Ajah"].map((a) => <option key={a}>{a}</option>)}
              </select>
              <p className="mt-1 text-xs text-muted">Only the area is public. Share exact addresses after booking.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="label">Condition</legend>
              <div className="grid gap-2 sm:grid-cols-4">
                {(["new", "excellent", "good", "fair"] as Condition[]).map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border border-line p-3 text-sm capitalize has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                    <input type="radio" name="cond" checked={d.condition === c} onChange={() => set("condition", c)} className="accent-brand" /> {c}
                  </label>
                ))}
              </div>
              {errors.condition && <p className="mt-1 text-xs text-danger">{errors.condition}</p>}
            </fieldset>
            <div>
              <label className="label" htmlFor="w-cn">Condition notes</label>
              <textarea id="w-cn" rows={3} className="input" value={d.conditionNotes} onChange={(e) => set("conditionNotes", e.target.value)} placeholder="Be specific about wear or known issues." />
            </div>
            <div>
              <label className="label" htmlFor="w-acc">Included accessories (one per line)</label>
              <textarea id="w-acc" rows={4} className="input" value={d.accessories} onChange={(e) => set("accessories", e.target.value)} placeholder={"Rycote softie\nXLR cable 3m"} />
              <p className="mt-1 text-xs text-muted">These become the handover checklist.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <EvidenceUploader label="Listing photos" min={3} />
            <p className="mt-3 text-xs text-muted">Show the actual item from several angles. The first photo is the cover. Don&apos;t include serial plates in public photos.</p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            {highValue && <InlineAlert tone="info" title="Required for this category">High-value categories need a serial number and ownership evidence before publishing.</InlineAlert>}
            {field("serial", `Serial number${highValue ? "" : " (optional)"}`, { placeholder: "Stored encrypted — only the last 4 digits are ever shown", autoComplete: "off" })}
            <EvidenceUploader label="Ownership evidence (receipt, invoice, import docs) — private" />
            <p className="text-xs text-muted">Reviewed privately by TrustRent. Showing &ldquo;Ownership evidence reviewed&rdquo; doesn&apos;t mean ownership is legally proven.</p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="label">Offer</legend>
              <div className="grid grid-cols-3 gap-2">
                {([["rent", "Rent only"], ["buy", "Sell only"], ["both", "Rent & sell"]] as const).map(([v, l]) => (
                  <label key={v} className="flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-control)] border border-line p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                    <input type="radio" name="lt" checked={d.listingType === v} onChange={() => set("listingType", v)} className="sr-only" /> {l}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              {d.listingType !== "buy" && field("daily", "Daily rate (₦)", { type: "number", min: 0, step: 500 })}
              {d.listingType !== "buy" && field("weekly", "Weekly rate (₦, optional)", { type: "number", min: 0, step: 500 })}
              {d.listingType !== "buy" && field("deposit", "Refundable deposit (₦)", { type: "number", min: 0, step: 1000 })}
              {d.listingType !== "rent" && field("sale", "Sale price (₦)", { type: "number", min: 0, step: 1000 })}
            </div>
            <p className="text-xs text-muted">A 5% platform fee is added to the renter&apos;s total. Deposits are held by our licensed payment provider, not TrustRent.</p>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">Block dates when the equipment isn&apos;t available. Confirmed rentals block dates automatically and can&apos;t be overridden here.</p>
            <div className="flex flex-wrap items-end gap-3">
              {field("blockStart", "From", { type: "date", min: "2026-11-20" })}
              {field("blockEnd", "To", { type: "date", min: d.blockStart || "2026-11-20" })}
              <button
                type="button"
                className="btn-secondary"
                disabled={!d.blockStart || !d.blockEnd || d.blockEnd < d.blockStart}
                onClick={() => { setBlocks((b) => [...b, [d.blockStart, d.blockEnd]]); setD((p) => ({ ...p, blockStart: "", blockEnd: "" })); }}
              >
                Block dates
              </button>
            </div>
            <ul className="space-y-2">
              {blocks.map(([s, e], i) => (
                <li key={i} className="flex items-center justify-between rounded-[var(--radius-control)] bg-canvas px-3 py-2 text-sm">
                  {s} → {e}
                  <button type="button" className="text-xs text-danger" onClick={() => setBlocks((b) => b.filter((_, j) => j !== i))}>Unblock</button>
                </li>
              ))}
              {blocks.length === 0 && <li className="text-sm text-muted">No blocked dates — available every day.</li>}
            </ul>
          </div>
        )}

        {step === 7 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
            <div>
              {d.category && <GearImage category={d.category} alt="" className="aspect-[4/3] w-full rounded-[var(--radius-card)]" />}
              <p className="mt-3 font-semibold">{d.brand || "Brand"} {d.model || "Model"}</p>
              <p className="text-sm text-muted">{d.area}, Lagos</p>
              {d.daily && <p className="mt-1 font-bold">{formatMoney(Number(d.daily) * 100)} <span className="font-normal text-muted">/ day</span></p>}
            </div>
            <div className="space-y-4">
              {missing.length > 0 ? (
                <InlineAlert tone="warning" title="Missing information">{missing.join(", ")}. Go back to complete these before publishing.</InlineAlert>
              ) : (
                <InlineAlert tone="success" title="Ready to submit">Your listing will show as Pending review until our team approves it.</InlineAlert>
              )}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted">Condition</dt><dd className="capitalize">{d.condition ?? "—"}</dd></div>
                <div><dt className="text-muted">Offer</dt><dd>{d.listingType}</dd></div>
                <div><dt className="text-muted">Deposit</dt><dd>{d.deposit ? formatMoney(Number(d.deposit) * 100) : "—"}</dd></div>
                <div><dt className="text-muted">Serial</dt><dd>{d.serial ? `•••• ${d.serial.slice(-4)}` : "Not registered"}</dd></div>
                <div className="col-span-2"><dt className="text-muted">Accessories</dt><dd>{d.accessories.split("\n").filter(Boolean).join(", ") || "—"}</dd></div>
              </dl>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <div className="flex items-center gap-2">
            <button type="button" className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ChevronLeft className="size-4" /> Back</button>
            <button type="button" className="btn-ghost" onClick={() => setSavedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))}><Save className="size-4" /> Save draft</button>
            {savedAt && <span className="text-xs text-muted" role="status">Draft saved {savedAt}</span>}
          </div>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-primary" onClick={() => validate(step) && setStep((s) => s + 1)}>Next <ChevronRight className="size-4" /></button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={missing.length > 0}
              onClick={async () => {
                await api.equipment.create({ brand: d.brand, model: d.model, category: d.category, condition: d.condition });
                setPublished(true);
              }}
            >
              Submit for review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
