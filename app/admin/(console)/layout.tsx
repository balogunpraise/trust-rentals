import { Logo } from "@/components/logo";
import { Suspense } from "react";
import { AdminNav, AdminNavView } from "@/features/admin/admin-nav";

export const metadata = { title: { default: "Admin", template: "%s · TrustRent Admin" } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="shrink-0 bg-ink p-4 text-white lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:p-5">
        <div className="mb-4 flex items-center justify-between lg:mb-8 lg:block">
          <Logo href="/admin" tone="light" />
          <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-sky-200 uppercase lg:mt-3 lg:inline-block">Operations console</span>
        </div>
        <Suspense fallback={<AdminNavView pathname="" />}>
          <AdminNav />
        </Suspense>
        <div className="mt-8 hidden rounded-[var(--radius-control)] bg-white/5 p-3 text-xs text-slate-400 lg:block">
          Signed in as <span className="text-white">o.lawal</span> · Ops lead<br />MFA verified · session expires in 28 min
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-canvas p-4 sm:p-8">{children}</main>
    </div>
  );
}
