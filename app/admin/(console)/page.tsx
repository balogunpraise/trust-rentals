import Link from "next/link";
import { AlertTriangle, BadgeCheck, CalendarClock, CreditCard, Flag, Gavel } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui";
import { AdminTable, td } from "@/features/admin/table";
import { api } from "@/lib/api-client";
import { formatDateTime, relativeTime } from "@/lib/format";

export default async function AdminOverview() {
  const [o, audit, disputes, reports, cases] = await Promise.all([api.admin.overview(), api.admin.audit(), api.disputes.all(), api.admin.reports(), api.admin.verificationCases()]);
  const cards = [
    { label: "Verified users", value: o.verifiedUsers, icon: BadgeCheck, tone: "text-success" },
    { label: "Active rentals", value: o.activeRentals, icon: CalendarClock, tone: "text-brand" },
    { label: "Overdue rentals", value: o.overdueRentals, icon: AlertTriangle, tone: "text-warning" },
    { label: "Open disputes", value: o.openDisputes, icon: Gavel, tone: "text-danger" },
    { label: "Reported listings", value: o.reportedListings, icon: Flag, tone: "text-warning" },
    { label: "Failed payments (24h)", value: o.failedPayments, icon: CreditCard, tone: "text-danger" },
  ];
  const queue = [
    ...disputes.map((d) => ({ ref: d.reference, type: "Dispute", status: d.state, at: d.updatedAt, href: "/admin/disputes", priority: "High" })),
    ...reports.filter((r) => r.status !== "resolved").map((r) => ({ ref: r.reference, type: `Report · ${r.targetType}`, status: r.status, at: r.createdAt, href: "/admin/reports", priority: r.reason === "suspected_fraud" ? "High" : "Normal" })),
    ...cases.filter((c) => c.status !== "verified").map((c) => ({ ref: c.providerReference, type: "Verification", status: c.status, at: c.updatedAt, href: "/admin/verification", priority: "Normal" })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <>
      <PageHeader title="Operations overview" description="Metrics from database and provider-confirmed records only." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <c.icon className={`size-5 ${c.tone}`} />
            <p className="mt-3 text-2xl font-bold">{c.value.toLocaleString()}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 mb-3 font-semibold">Queue — oldest first</h2>
      <AdminTable head={["Reference", "Type", "Status", "Priority", "Waiting", ""]}>
        {queue.map((q) => (
          <tr key={q.ref} className="hover:bg-canvas">
            <td className={`${td} font-mono text-xs`}>{q.ref}</td>
            <td className={td}>{q.type}</td>
            <td className={td}><Badge tone="warning">{q.status.replace(/_/g, " ").toLowerCase()}</Badge></td>
            <td className={td}><Badge tone={q.priority === "High" ? "danger" : "neutral"}>{q.priority}</Badge></td>
            <td className={`${td} text-muted`}>{relativeTime(q.at)}</td>
            <td className={`${td} text-right`}><Link href={q.href} className="text-xs font-semibold text-brand hover:underline">Open</Link></td>
          </tr>
        ))}
      </AdminTable>
      <h2 className="mt-10 mb-3 font-semibold">Recent audit events</h2>
      <AdminTable head={["Time", "Actor", "Action", "Entity"]}>
        {audit.slice(0, 5).map((a) => (
          <tr key={a.id}>
            <td className={`${td} text-muted`}>{formatDateTime(a.at)}</td>
            <td className={`${td} font-mono text-xs`}>{a.actor}</td>
            <td className={`${td} font-mono text-xs`}>{a.action}</td>
            <td className={`${td} font-mono text-xs`}>{a.entity}</td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
