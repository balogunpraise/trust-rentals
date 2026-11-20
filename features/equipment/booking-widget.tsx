"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { PriceBreakdown } from "@/components/price-breakdown";
import { formatMoney } from "@/lib/format";
import { BILLING_RULE, daysBetween, estimatePrice, rangeOverlapsBlocked } from "@/lib/pricing";
import type { Equipment } from "@/lib/types";

export function BookingWidget({ item, isOwner }: { item: Equipment; isOwner: boolean }) {
  const router = useRouter();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const days = start && end ? daysBetween(start, end) : 0;
  const invalidOrder = !!(start && end && end <= start);
  const unavailable = !!(start && end && !invalidOrder && rangeOverlapsBlocked(start, end, item.blockedDates));
  const price = useMemo(() => estimatePrice(item, days), [item, days]);
  const canRequest = days > 0 && !unavailable && !invalidOrder && !isOwner && item.listingType !== "buy";

  return (
    <div className="card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between">
        <p>
          <span className="text-2xl font-bold">{formatMoney(item.dailyRateMinor)}</span>
          <span className="text-muted"> / day</span>
        </p>
        {item.weeklyRateMinor && <p className="text-sm text-muted">{formatMoney(item.weeklyRateMinor)} / week</p>}
      </div>
      {item.salePriceMinor && (
        <p className="mt-1 text-sm">
          Also for sale: <span className="font-semibold">{formatMoney(item.salePriceMinor)}</span>
        </p>
      )}

      {item.listingType !== "buy" && (
        <>
          <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-[var(--radius-control)] border border-line-strong">
            <label className="border-r border-line-strong p-2.5">
              <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">Pickup</span>
              <input type="date" min="2026-11-20" value={start} onChange={(e) => setStart(e.target.value)} className="w-full text-sm focus:outline-none" />
            </label>
            <label className="p-2.5">
              <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">Return</span>
              <input
                type="date"
                min={start || "2026-11-21"}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                aria-invalid={invalidOrder}
                className="w-full text-sm focus:outline-none"
              />
            </label>
          </div>
          <p className="mt-1.5 text-xs text-muted">{BILLING_RULE}</p>
          {invalidOrder && <p role="alert" className="mt-2 text-sm text-danger">Return date must be after pickup date.</p>}
          {unavailable && <p role="alert" className="mt-2 text-sm text-danger">Some of these dates are already booked. Choose different dates.</p>}

          {days > 0 && !invalidOrder && (
            <div className="mt-4">
              <PriceBreakdown price={price} dailyRateMinor={item.dailyRateMinor} note="Final amount is confirmed by the server before payment." />
            </div>
          )}

          <button
            type="button"
            disabled={!canRequest}
            onClick={() => router.push(`/rentals/new?equipment=${item.id}&start=${start}&end=${end}`)}
            className="btn-primary mt-4 w-full py-3"
          >
            {isOwner ? "This is your listing" : days > 0 ? "Request rental" : "Select dates to request"}
          </button>
          <p className="mt-2 text-center text-xs text-muted">You won&apos;t be charged until the owner accepts and you both sign the agreement.</p>
        </>
      )}
      {!isOwner && (
        <Link href="/messages?to=owner" className="btn-secondary mt-3 w-full">
          <MessageSquare className="size-4" /> {item.listingType === "buy" ? "Contact seller" : "Message owner"}
        </Link>
      )}
    </div>
  );
}
