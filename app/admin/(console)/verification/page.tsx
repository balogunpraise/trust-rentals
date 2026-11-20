import { Badge, PageHeader } from "@/components/ui";
import { ReasonedAction } from "@/features/admin/reasoned-action";
import { AdminTable, td } from "@/features/admin/table";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Verification queue" };

export default async function AdminVerification() {
  const [cases, users] = await Promise.all([api.admin.verificationCases(), api.users.all()]);
  return (
    <>
      <PageHeader title="Verification queue" description="Minimal data only. Raw credentials and identity payloads are never shown here." />
      <AdminTable head={["User", "Provider", "Reference", "Status", "Updated", "Actions"]}>
        {cases.map((c) => (
          <tr key={c.id} className="hover:bg-canvas">
            <td className={td}>{users.find((u) => u.id === c.userId)?.displayName} <span className="font-mono text-xs text-muted">{c.userId}</span></td>
            <td className={td}>{c.provider}</td>
            <td className={`${td} font-mono text-xs`}>{c.providerReference}</td>
            <td className={td}><Badge tone={c.status === "failed" || c.status === "provider_unavailable" ? "danger" : "warning"}>{c.status.replace("_", " ")}</Badge></td>
            <td className={`${td} text-muted`}>{formatDateTime(c.updatedAt)}</td>
            <td className={`${td} space-x-3 whitespace-nowrap`}>
              <ReasonedAction label="Retry" title="Retry verification" consequences="Asks the provider for an updated status on this reference." />
              <ReasonedAction label="Escalate to provider" title="Escalate to provider" consequences="Opens a provider support case with the reference only." />
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
