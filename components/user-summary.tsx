import Link from "next/link";
import { MapPin } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { formatMonthYear } from "@/lib/format";
import { Avatar } from "./avatar";
import { IdentityBadges } from "./identity-badge";
import { Stars } from "./ui";

export function UserSummary({ user, href = true, heading }: { user: PublicUser; href?: boolean; heading?: string }) {
  const name = href ? (
    <Link href={`/users/${user.id}`} className="font-semibold hover:text-brand hover:underline">
      {user.displayName}
    </Link>
  ) : (
    <span className="font-semibold">{user.displayName}</span>
  );
  return (
    <div>
      {heading && <p className="eyebrow mb-3">{heading}</p>}
      <div className="flex items-start gap-3">
        <Avatar user={user} size="lg" />
        <div className="min-w-0">
          {name}
          <p className="text-sm text-muted">{user.profession}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" aria-hidden /> {user.area}, {user.city} · Joined {formatMonthYear(user.memberSince)}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <IdentityBadges verification={user.verification} compact />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-[var(--radius-control)] bg-canvas p-3 text-center">
        <div>
          <dt className="text-[11px] text-muted">Completed rentals</dt>
          <dd className="font-semibold">{user.stats.completedRentals}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">Rating</dt>
          <dd className="font-semibold">{user.stats.rating ? <Stars rating={user.stats.rating} size="md" /> : "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">Responds</dt>
          <dd className="text-sm font-semibold">{user.stats.responseTime.replace("within ", "< ")}</dd>
        </div>
      </dl>
    </div>
  );
}
