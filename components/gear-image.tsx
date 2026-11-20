import { Cable, Headphones, Headset, Mic, MicVocal, RadioReceiver, SlidersVertical, Speaker } from "lucide-react";
import clsx from "clsx";
import type { CategorySlug } from "@/lib/types";

export const categoryIcon: Record<CategorySlug, React.ElementType> = {
  microphones: Mic,
  wireless: RadioReceiver,
  "recorders-mixers": SlidersVertical,
  boom: MicVocal,
  "ifb-comms": Headset,
  monitoring: Headphones,
  pa: Speaker,
  accessories: Cable,
};

const gradient: Record<CategorySlug, string> = {
  microphones: "from-slate-800 via-slate-700 to-sky-900",
  wireless: "from-sky-900 via-blue-800 to-indigo-900",
  "recorders-mixers": "from-zinc-800 via-neutral-700 to-stone-800",
  boom: "from-emerald-950 via-teal-900 to-slate-800",
  "ifb-comms": "from-indigo-950 via-violet-900 to-slate-800",
  monitoring: "from-stone-800 via-amber-950 to-zinc-800",
  pa: "from-neutral-900 via-zinc-800 to-red-950",
  accessories: "from-slate-700 via-gray-700 to-slate-800",
};

/** Real listing photo if present; otherwise branded placeholder art for mock data. */
export function GearImage({
  src,
  category,
  alt,
  className,
  iconSize = "size-14",
}: {
  src?: string;
  category: CategorySlug;
  alt: string;
  className?: string;
  iconSize?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={clsx("object-cover", className)} />;
  }
  const Icon = categoryIcon[category];
  return (
    <div role="img" aria-label={alt} className={clsx("relative grid place-items-center overflow-hidden bg-gradient-to-br", gradient[category], className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="absolute -right-6 -bottom-6 size-32 rounded-full border border-white/10" />
      <div className="absolute -right-2 -bottom-2 size-20 rounded-full border border-white/10" />
      <Icon className={clsx(iconSize, "relative text-white/85")} strokeWidth={1.4} aria-hidden />
    </div>
  );
}
