import { BadgeCheck, Briefcase, Clock, Phone } from "lucide-react";
import clsx from "clsx";
import type { Verification } from "@/lib/types";

/**
 * Shows the exact verified attribute. Never says "safe", "trusted" or "fraud-proof" (spec 1.2).
 */
export function IdentityBadges({ verification, compact = false }: { verification: Verification; compact?: boolean }) {
  const items: { key: string; label: string; icon: React.ElementType; tone: "success" | "warning" }[] = [];
  if (verification.phone) items.push({ key: "phone", label: "Phone verified", icon: Phone, tone: "success" });
  if (verification.identity === "verified") items.push({ key: "id", label: "Identity verified", icon: BadgeCheck, tone: "success" });
  else if (verification.identity === "pending" || verification.identity === "manual_review")
    items.push({ key: "id", label: "Identity check pending", icon: Clock, tone: "warning" });
  if (verification.professionalReviewed) items.push({ key: "pro", label: "Professional info reviewed", icon: Briefcase, tone: "success" });

  if (!items.length) return <span className="text-xs text-muted">No verifications yet</span>;
  return (
    <ul className={clsx("flex flex-wrap", compact ? "gap-1.5" : "gap-2")}>
      {items.map(({ key, label, icon: Icon, tone }) => (
        <li
          key={key}
          className={clsx(
            "inline-flex items-center gap-1 rounded-full font-medium",
            compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
            tone === "success" ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
          )}
        >
          <Icon className={compact ? "size-3" : "size-3.5"} aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}

export function IdentityTick({ verified }: { verified: boolean }) {
  if (!verified) return null;
  return (
    <span title="Identity verified" className="inline-flex text-success">
      <BadgeCheck className="size-4" aria-label="Identity verified" />
    </span>
  );
}
