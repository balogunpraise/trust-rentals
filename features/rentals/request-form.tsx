"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleCheck, Clock } from "lucide-react";
import { PriceBreakdown } from "@/components/price-breakdown";
import { InlineAlert } from "@/components/ui";
import { api } from "@/lib/api-client";
import { formatRange } from "@/lib/format";
import { BILLING_RULE, daysBetween, estimatePrice, rangeOverlapsBlocked } from "@/lib/pricing";
import type { Equipment, PublicUser, Rental } from "@/lib/types";

export function RequestForm({ item, owner, initialStart, initialEnd }: { item: Equipment; owner: PublicUser; initialStart: string; initialEnd: string }) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [pickupTime, setPickupTime] = useState("09:00");
  const [message, setMessage] = useState("");
  const [agreeCancel, setAgreeCancel] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Rental | null>(null);

  const days = start && end ? daysBetween(start, end) : 0;
  const invalid = !!(start && end && end <= start);
  const blocked = !invalid && days > 0 && rangeOverlapsBlocked(start, end, item.blockedDates);
  const price = estimatePrice(item, days);

  if (created) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <CircleCheck className="mx-auto size-14 text-success" />
        <h1 className="mt-4 text-2xl font-bold">Request sent</h1>
        <p className="mt-2 text-muted">
          {owner.displayName.split(" ")[0]} usually responds {owner.stats.responseTime}. The request expires in 24 hours if there&apos;s no response, and your dates aren&apos;t reserved until it&apos;s accepted.
        </p>
        <dl className="mt-6 space-y-2 rounded-[var(--radius-control)] bg-canvas p-4 text-left text-sm">
          <div className="flex justify-between"><dt className="text-muted">Reference</dt><dd className="font-mono">{created.reference}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Equipment</dt><dd>{item.brand} {item.model}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Dates</dt><dd>{formatRange(created.startDate, created.endDate)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Status</dt><dd className="flex items-center gap-1 text-warning"><Clock className="size-3.5" /> Awaiting owner</dd></div>
        </dl>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/rentals" className="btn-primary">Go to rentals</Link>
          <Link href="/messages" className="btn-secondary">Message owner</Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
      onSubmit={async (e) => {
        e.preventDefault();
        if (days <= 0 || invalid) return setError("Choose a return date after the pickup date.");
        if (blocked) return setError("Some of these dates are unavailable. Choose different dates.");
        if (!agreeCancel) return setError("Please confirm you've read the cancellation policy.");
        setError(null);
        setSubmitting(true);
        try {
          setCreated(await api.rentals.create({ equipmentId: item.id, startDate: start, endDate: end }));
        } catch {
          setError("We couldn't send your request. Nothing was charged — please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="space-y-6">
        <section className="card p-6">
          <h2 className="font-semibold">Dates & times</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="start">Pickup date</label>
              <input id="start" type="date" min="2026-11-20" className="input" value={start} onChange={(e) => setStart(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="end">Return date</label>
              <input id="end" type="date" min={start} className="input" value={end} onChange={(e) => setEnd(e.target.value)} aria-invalid={invalid} required />
            </div>
            <div>
              <label className="label" htmlFor="time">Pickup & return time</label>
              <input id="time" type="time" className="input" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">{BILLING_RULE}</p>
          {blocked && <p role="alert" className="mt-2 text-sm text-danger">These dates overlap an existing booking.</p>}
        </section>

        <section className="card p-6">
          <label htmlFor="msg" className="font-semibold">Message to {owner.displayName.split(" ")[0]} <span className="font-normal text-muted">(optional)</span></label>
          <textarea id="msg" rows={4} className="input mt-3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the owner about your project and how you'll use the equipment." />
          <p className="mt-2 text-xs text-muted">Don&apos;t share phone numbers or arrange payment outside TrustRent — protections only apply on-platform.</p>
        </section>

        <section className="card p-6">
          <h2 className="font-semibold">Cancellation policy</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
            <li>Free cancellation before the owner accepts.</li>
            <li>After payment: full refund of rental fee if cancelled 48+ hours before pickup.</li>
            <li>Within 48 hours of pickup: 50% of the rental fee is refunded. Deposit is always returned in full.</li>
          </ul>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agreeCancel} onChange={(e) => setAgreeCancel(e.target.checked)} className="mt-0.5 size-4 accent-brand" />
            I&apos;ve read the cancellation policy.
          </label>
        </section>
      </div>

      <aside>
        <div className="card sticky top-24 p-5">
          <p className="font-semibold">{item.brand} {item.model}</p>
          <p className="text-sm text-muted">{item.area}, {item.city} · Owner: {owner.displayName}</p>
          <div className="my-4 border-t border-line" />
          {days > 0 && !invalid ? (
            <PriceBreakdown price={price} dailyRateMinor={item.dailyRateMinor} note="This estimate is recalculated by the server before acceptance and payment." />
          ) : (
            <p className="text-sm text-muted">Select dates to see the full cost.</p>
          )}
          {error && <div className="mt-4"><InlineAlert tone="danger">{error}</InlineAlert></div>}
          <button className="btn-primary mt-4 w-full py-3" disabled={submitting || days <= 0}>
            {submitting ? "Sending request…" : "Send rental request"}
          </button>
          <p className="mt-2 text-center text-xs text-muted">You won&apos;t be charged now.</p>
        </div>
      </aside>
    </form>
  );
}
