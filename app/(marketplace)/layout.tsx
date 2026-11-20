import { Suspense } from "react";
import { BottomNav, BottomNavView } from "@/components/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderLive } from "@/components/site-header";
import { api } from "@/lib/api-client";

async function HeaderWithCounts() {
  const [convos, notes] = await Promise.all([api.messaging.conversations(), api.notifications.list()]);
  const counts = { unread: convos.reduce((a, c) => a + c.unread, 0), notifications: notes.filter((n) => !n.read).length };
  return (
    <Suspense fallback={<SiteHeader {...counts} />}>
      <SiteHeaderLive {...counts} />
    </Suspense>
  );
}

export default function MarketplaceLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Suspense fallback={<SiteHeader />}>
        <HeaderWithCounts />
      </Suspense>
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <SiteFooter />
      <Suspense fallback={<BottomNavView pathname="" />}>
        <BottomNav />
      </Suspense>
    </>
  );
}
