import { Check } from "lucide-react";
import clsx from "clsx";
import { TIMELINE_STEPS, timelineIndex } from "@/lib/rental-state";
import type { RentalState } from "@/lib/types";

export function StatusTimeline({ state, lastHealthyState }: { state: RentalState; lastHealthyState?: RentalState }) {
  const effective = state === "DISPUTED" ? lastHealthyState ?? "ACTIVE" : state;
  const current = timelineIndex(effective);
  const done = state === "COMPLETED";
  return (
    <ol className="flex w-full overflow-x-auto pb-1" aria-label="Rental progress">
      {TIMELINE_STEPS.map((step, i) => {
        const complete = done || i < current;
        const active = !done && i === current;
        return (
          <li key={step.label} className="flex min-w-[78px] flex-1 flex-col items-center text-center" aria-current={active ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span className={clsx("h-0.5 flex-1", i === 0 ? "invisible" : complete || active ? "bg-brand" : "bg-line")} />
              <span
                className={clsx(
                  "grid size-7 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold",
                  complete && "border-brand bg-brand text-white",
                  active && (state === "DISPUTED" ? "border-danger bg-danger-soft text-danger" : "border-brand bg-brand-soft text-brand"),
                  !complete && !active && "border-line bg-surface text-subtle",
                )}
              >
                {complete ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={clsx("h-0.5 flex-1", i === TIMELINE_STEPS.length - 1 ? "invisible" : complete ? "bg-brand" : "bg-line")} />
            </div>
            <span className={clsx("mt-1.5 text-[11px] font-medium", active ? "text-ink" : "text-muted")}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
