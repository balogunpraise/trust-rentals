import { Badge, PageHeader } from "@/components/ui";
import { ReasonedAction } from "@/features/admin/reasoned-action";
import { AdminTable, td } from "@/features/admin/table";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Reports" };

export default async function AdminReports() {
  const reports = await api.admin.reports();
  return (
    <>
      <PageHeader title="Reports" description="User and listing reports. A report is an allegation, not a finding." />
      <AdminTable head={["Reference", "Target", "Reason", "Status", "Received", "Actions"]}>
        {reports.map((r) => (
          <tr key={r.id} className="hover:bg-canvas">
            <td className={`${td} font-mono text-xs`}>{r.reference}</td>
            <td className={td}>{r.targetType} <span className="font-mono text-xs text-muted">{r.targetId}</span></td>
            <td className={td}>{r.reason.replace("_", " ")}</td>
            <td className={td}><Badge tone={r.status === "resolved" ? "success" : r.status === "open" ? "warning" : "info"}>{r.status}</Badge></td>
            <td className={`${td} text-muted`}>{formatDateTime(r.createdAt)}</td>
            <td className={`${td} space-x-3 whitespace-nowrap`}>
              {r.status !== "resolved" && <>
                <ReasonedAction label="Assign to me" title="Assign report" consequences="You become the owner of this report." />
                <ReasonedAction label="Resolve" title="Resolve report" consequences="Closes the report. The reporter is told it was reviewed (not the outcome details)." />
              </>}
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
