const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

/** Format integer kobo as naira. Never pass floating naira values around. */
export const formatMoney = (amountMinor: number) => ngn.format(Math.round(amountMinor / 100));

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
const shortFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });
const dtFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Lagos" });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatShortDate = (iso: string) => shortFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dtFmt.format(new Date(iso));
export const formatMonthYear = (iso: string) => monthYear.format(new Date(iso));
export const formatRange = (start: string, end: string) => `${formatShortDate(start)} – ${formatDate(end)}`;

export const maskEmail = (email: string) => email.replace(/^(.).*(@.*)$/, "$1•••$2");
export const maskPhone = (phone: string) => phone.replace(/^(\+\d{3})\d+(\d{2})$/, "$1 ••• ••• $2");

export function relativeTime(iso: string, now = new Date("2026-11-20T12:00:00Z")) {
  const diff = (now.getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return formatShortDate(iso);
}
