import { formatMoney } from "@/lib/format";
import type { PriceBreakdown as PB } from "@/lib/types";

export function PriceBreakdown({ price, dailyRateMinor, note }: { price: PB; dailyRateMinor?: number; note?: string }) {
  const rows: [string, number, string?][] = [
    [dailyRateMinor ? `Rental fee (${price.days} day${price.days === 1 ? "" : "s"})` : "Rental fee", price.rentalFeeMinor],
    ["Platform fee", price.platformFeeMinor],
  ];
  if (price.otherFeesMinor) rows.push(["Other authorised fees", price.otherFeesMinor]);
  return (
    <div className="text-sm">
      <dl className="space-y-2">
        {rows.map(([label, v]) => (
          <div key={label} className="flex justify-between">
            <dt className="text-muted">{label}</dt>
            <dd>{formatMoney(v)}</dd>
          </div>
        ))}
        <div className="flex justify-between">
          <dt className="text-muted">
            Security deposit
            <span className="ml-1.5 rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium text-brand-dark">Refundable*</span>
          </dt>
          <dd>{formatMoney(price.depositMinor)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2.5 text-base font-semibold">
          <dt>Total payable</dt>
          <dd>{formatMoney(price.totalMinor)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted">
        *The deposit is held by our licensed payment provider and released after a successful return inspection. It is not platform revenue.
        {note ? ` ${note}` : ""}
      </p>
    </div>
  );
}
