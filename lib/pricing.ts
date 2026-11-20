import type { Equipment, PriceBreakdown } from "./types";

/**
 * Display-only estimate. The server recalculates before owner acceptance and payment
 * (spec S21) — the client never decides the amount charged.
 *
 * Billing rule (shown to users): billed per 24-hour period from pickup; the return day is not charged
 * when equipment is back by the agreed time.
 */
export const PLATFORM_FEE_RATE = 0.05;
export const BILLING_RULE = "Billed per 24-hour period from pickup. Weekly rate applies automatically for 7+ days.";

const DAY = 86_400_000;

export function daysBetween(start: string, end: string) {
  const s = Date.parse(start);
  const e = Date.parse(end);
  if (Number.isNaN(s) || Number.isNaN(e)) return 0;
  return Math.max(0, Math.round((e - s) / DAY));
}

export function estimatePrice(eq: Pick<Equipment, "dailyRateMinor" | "weeklyRateMinor" | "depositMinor">, days: number): PriceBreakdown {
  const weeks = eq.weeklyRateMinor ? Math.floor(days / 7) : 0;
  const rem = days - weeks * 7;
  const remCost = eq.weeklyRateMinor ? Math.min(rem * eq.dailyRateMinor, eq.weeklyRateMinor) : rem * eq.dailyRateMinor;
  const rentalFeeMinor = weeks * (eq.weeklyRateMinor ?? 0) + remCost;
  const platformFeeMinor = Math.round(rentalFeeMinor * PLATFORM_FEE_RATE);
  const depositMinor = days > 0 ? eq.depositMinor : 0;
  return {
    days,
    rentalFeeMinor,
    platformFeeMinor,
    depositMinor,
    otherFeesMinor: 0,
    totalMinor: rentalFeeMinor + platformFeeMinor + depositMinor,
    currency: "NGN",
  };
}

export function rangeOverlapsBlocked(start: string, end: string, blocked: string[]) {
  const s = Date.parse(start);
  const e = Date.parse(end);
  return blocked.some((d) => {
    const t = Date.parse(d);
    return t >= s && t < e;
  });
}
