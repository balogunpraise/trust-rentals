"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Fingerprint, Flag, Gavel, LayoutDashboard, Package, ScrollText, Users } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/rentals", label: "Rentals & payments", icon: CreditCard },
  { href: "/admin/disputes", label: "Disputes", icon: Gavel },
  { href: "/admin/verification", label: "Verification", icon: Fingerprint },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
];

export function AdminNav() {
  return <AdminNavView pathname={usePathname()} />;
}

export function AdminNavView({ pathname }: { pathname: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={clsx("flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium whitespace-nowrap", active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
