import Link from "next/link";

export function Logo({ href = "/", tone = "dark" }: { href?: string; tone?: "dark" | "light" }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="TrustRent home">
      <span className="grid size-8 place-items-center rounded-[9px] bg-brand text-white">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
      <span className={`text-lg font-bold tracking-tight ${tone === "light" ? "text-white" : "text-ink"}`}>
        Trust<span className={tone === "light" ? "text-sky-300" : "text-brand"}>Rent</span>
      </span>
    </Link>
  );
}
