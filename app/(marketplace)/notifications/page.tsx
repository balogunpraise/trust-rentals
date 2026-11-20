import Link from "next/link";
import { Bell, CalendarDays, CreditCard, Gavel, ShieldCheck, Store } from "lucide-react";
import clsx from "clsx";
import { EmptyState, PageHeader } from "@/components/ui";
import { api } from "@/lib/api-client";
import { relativeTime } from "@/lib/format";
import type { NotificationGroup } from "@/lib/types";

export const metadata = { title: "Notifications" };

const groups: Record<NotificationGroup, { label: string; icon: React.ElementType }> = {
  rentals: { label: "Rentals", icon: CalendarDays },
  payments: { label: "Payments", icon: CreditCard },
  account: { label: "Account & security", icon: ShieldCheck },
  disputes: { label: "Disputes", icon: Gavel },
  marketplace: { label: "Marketplace", icon: Store },
};

export default async function NotificationsPage() {
  const notes = await api.notifications.list();
  const present = (Object.keys(groups) as NotificationGroup[]).filter((g) => notes.some((n) => n.group === g));
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title="Notifications" actions={<><button className="btn-ghost">Mark all read</button><Link href="/settings" className="btn-secondary">Preferences</Link></>} />
      {notes.length === 0 ? (
        <EmptyState icon={<Bell className="size-6" />} title="You're all caught up" body="Rental, payment and account updates will appear here." />
      ) : (
        <div className="space-y-8">
          {present.map((g) => {
            const { label, icon: Icon } = groups[g];
            return (
              <section key={g}>
                <h2 className="eyebrow mb-2">{label}</h2>
                <ul className="card divide-y divide-line">
                  {notes.filter((n) => n.group === g).map((n) => (
                    <li key={n.id}>
                      <Link href={n.href} className={clsx("flex gap-3 p-4 hover:bg-canvas", !n.read && "bg-brand-soft/40")}>
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas text-brand"><Icon className="size-4" /></span>
                        <span className="flex-1 text-sm">
                          <span className="flex items-center justify-between gap-2">
                            <span className={clsx(!n.read ? "font-bold" : "font-semibold")}>{n.title}</span>
                            <span className="shrink-0 text-xs text-muted">{relativeTime(n.createdAt)}</span>
                          </span>
                          <span className="text-muted">{n.body}</span>
                        </span>
                        {!n.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
