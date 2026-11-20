"use client";

import { Heart } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

export function SaveButton({ equipmentId, initial = false, variant = "overlay" }: { equipmentId: string; initial?: boolean; variant?: "overlay" | "inline" }) {
  const [saved, setSaved] = useState(initial);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      data-equipment={equipmentId}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((s) => !s);
      }}
      className={clsx(
        variant === "overlay"
          ? "grid size-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105"
          : "btn-secondary",
      )}
    >
      <Heart className={clsx("size-4", saved ? "fill-danger text-danger" : "text-ink")} />
      {variant === "inline" && (saved ? "Saved" : "Save")}
    </button>
  );
}
