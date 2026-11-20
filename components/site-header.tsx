"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, MessageSquare, Plus, Search } from "lucide-react";
import clsx from "clsx";
import { Logo } from "./logo";

const nav = [
  { href: "/explore", label: "Explore" },
  { href: "/rentals", label: "Rentals" },
  { href: "/listings", label: "My equipment" },
];

type HeaderProps = { unread?: number; notifications?: number; pathname?: string };

/** Reads the pathname; must be rendered inside <Suspense> (Cache Components). */
export function SiteHeaderLive(props: HeaderProps) {
  return <SiteHeader {...props} pathname={usePathname()} />;
}

export function SiteHeader({ unread = 0, notifications = 0, pathname = "" }: HeaderProps) {
  const router = useRouter();
  const showSearch = pathname !== "/";
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        {showSearch && (
          <form
            role="search"
            className="ml-2 hidden max-w-md flex-1 md:block"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              router.push(`/explore?q=${encodeURIComponent(String(q ?? ""))}`);
            }}
          >
            <label className="relative block">
              <span className="sr-only">Search equipment</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle" />
              <input name="q" placeholder="Search microphones, recorders, PA…" className="h-10 w-full rounded-full border border-line-strong bg-canvas pr-4 pl-10 text-sm focus:border-brand focus:bg-surface focus:outline-none" />
            </label>
          </form>
        )}
        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={clsx("rounded-full px-3.5 py-2 text-sm font-medium transition", pathname.startsWith(n.href) ? "bg-brand-soft text-brand" : "text-ink-soft hover:bg-canvas")}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <Link href="/listings/new" className="btn-primary hidden py-2 sm:inline-flex">
            <Plus className="size-4" /> List equipment
          </Link>
          <Link href="/messages" className="relative hidden rounded-full p-2.5 text-ink-soft hover:bg-canvas sm:block" aria-label={`Messages, ${unread} unread`}>
            <MessageSquare className="size-5" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger" />}
          </Link>
          <Link href="/notifications" className="relative rounded-full p-2.5 text-ink-soft hover:bg-canvas" aria-label={`Notifications, ${notifications} unread`}>
            <Bell className="size-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">{notifications}</span>
            )}
          </Link>
          <Link href="/profile" className="ml-1 grid size-9 place-items-center rounded-full bg-sky-100 text-sm font-semibold text-sky-800 ring-2 ring-transparent hover:ring-brand/30" aria-label="Your profile">
            TB
          </Link>
        </div>
      </div>
    </header>
  );
}
