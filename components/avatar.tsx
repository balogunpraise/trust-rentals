import clsx from "clsx";
import type { PublicUser } from "@/lib/types";

const palette = ["bg-sky-100 text-sky-800", "bg-amber-100 text-amber-800", "bg-emerald-100 text-emerald-800", "bg-violet-100 text-violet-800", "bg-rose-100 text-rose-800", "bg-teal-100 text-teal-800"];

export function Avatar({ user, size = "md" }: { user: Pick<PublicUser, "id" | "initials" | "avatarUrl" | "displayName">; size?: "sm" | "md" | "lg" | "xl" }) {
  const dims = { sm: "size-7 text-[11px]", md: "size-10 text-sm", lg: "size-14 text-lg", xl: "size-24 text-3xl" }[size];
  const color = palette[user.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
  if (user.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.avatarUrl} alt="" className={clsx(dims, "rounded-full object-cover")} />;
  }
  return (
    <span className={clsx(dims, color, "inline-grid shrink-0 place-items-center rounded-full font-semibold")} aria-hidden>
      {user.initials}
    </span>
  );
}
