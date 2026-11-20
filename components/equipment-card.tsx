import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { Equipment, PublicUser } from "@/lib/types";
import { Avatar } from "./avatar";
import { GearImage } from "./gear-image";
import { IdentityTick } from "./identity-badge";
import { SaveButton } from "./save-button";
import { Stars } from "./ui";

const conditionLabel = { new: "New", excellent: "Excellent", good: "Good", fair: "Fair" } as const;

export function EquipmentCard({ item, owner }: { item: Equipment; owner?: PublicUser }) {
  return (
    <Link href={`/equipment/${item.id}`} className="group block focus-visible:outline-offset-4">
      <div className="relative overflow-hidden rounded-[var(--radius-card)]">
        <GearImage
          src={item.images[0]}
          category={item.category}
          alt={item.title}
          className="aspect-[4/3] w-full transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 right-3">
          <SaveButton equipmentId={item.id} />
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <span className="rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-ink">{conditionLabel[item.condition]}</span>
          {item.listingType !== "rent" && <span className="rounded-full bg-ink/85 px-2 py-0.5 text-[11px] font-semibold text-white">For sale</span>}
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-snug group-hover:text-brand">{item.brand} {item.model}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" aria-hidden /> {item.area}, {item.city}
          </p>
        </div>
        <p className="shrink-0 text-right">
          <span className="text-[15px] font-bold">{formatMoney(item.dailyRateMinor)}</span>
          <span className="block text-xs text-muted">per day</span>
        </p>
      </div>
      {owner && (
        <div className="mt-2.5 flex items-center gap-2 text-sm">
          <Avatar user={owner} size="sm" />
          <span className="truncate text-ink-soft">{owner.displayName.split(" ")[0]} {owner.displayName.split(" ")[1]?.[0]}.</span>
          <IdentityTick verified={owner.verification.identity === "verified"} />
          {owner.stats.rating && (
            <span className="ml-auto flex items-center gap-1 text-muted">
              <Stars rating={owner.stats.rating} /> <span className="text-xs">({owner.stats.reviewCount})</span>
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
