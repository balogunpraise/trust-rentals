import { PageHeader } from "@/components/ui";
import { AdminTable, td } from "@/features/admin/table";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Audit log" };

export default async function AdminAudit() {
  const events = await api.admin.audit();
  return (
    <>
      <PageHeader title="Audit log" description="Append-only record of privileged and system actions." actions={<button className="btn-secondary" title="Requires export permission; the export itself is logged">Export</button>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <input className="input" placeholder="Actor" aria-label="Filter by actor" />
        <input className="input" placeholder="Action" aria-label="Filter by action" />
        <input className="input" placeholder="Entity" aria-label="Filter by entity" />
        <input className="input" type="date" aria-label="Filter by date" />
      </div>
      <AdminTable head={["Time", "Actor", "Action", "Entity", "Reason", "Request ID"]}>
        {events.map((a) => (
          <tr key={a.id}>
            <td className={`${td} whitespace-nowrap text-muted`}>{formatDateTime(a.at)}</td>
            <td className={`${td} font-mono text-xs`}>{a.actor}</td>
            <td className={`${td} font-mono text-xs`}>{a.action}</td>
            <td className={`${td} font-mono text-xs`}>{a.entity}</td>
            <td className={`${td} text-xs`}>{a.reason ?? "—"}</td>
            <td className={`${td} font-mono text-xs text-muted`}>{a.requestId}</td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
