import clsx from "clsx";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function Month({ year, month, blocked, today }: { year: number; month: number; blocked: Set<string>; today: string }) {
  const first = new Date(Date.UTC(year, month, 1));
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const label = first.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((d, i) => <span key={i} className="py-1 font-medium text-subtle">{d}</span>)}
        {Array.from({ length: offset }).map((_, i) => <span key={`o${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          const isBlocked = blocked.has(iso);
          const past = iso < today;
          return (
            <span
              key={iso}
              title={isBlocked ? "Unavailable" : undefined}
              className={clsx(
                "rounded-md py-1.5",
                isBlocked && "bg-danger-soft text-danger line-through",
                past && !isBlocked && "text-line-strong",
                !past && !isBlocked && "bg-success-soft/60 text-ink",
                iso === today && "ring-1 ring-brand",
              )}
            >
              {i + 1}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function AvailabilityCalendar({ blockedDates, today = "2026-11-20" }: { blockedDates: string[]; today?: string }) {
  const [y, m] = today.split("-").map(Number);
  const blocked = new Set(blockedDates);
  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Month year={y} month={m - 1} blocked={blocked} today={today} />
        <Month year={m === 12 ? y + 1 : y} month={m % 12} blocked={blocked} today={today} />
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-success-soft" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-danger-soft" /> Booked / blocked</span>
      </div>
      <p className="mt-2 text-xs text-muted">Availability is confirmed by the server when the owner accepts. Saving a listing doesn&apos;t reserve it.</p>
    </div>
  );
}
