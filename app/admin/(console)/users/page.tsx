import { Avatar } from "@/components/avatar";
import { IdentityBadges } from "@/components/identity-badge";
import { Badge, PageHeader } from "@/components/ui";
import { ReasonedAction } from "@/features/admin/reasoned-action";
import { AdminTable, td } from "@/features/admin/table";
import { api } from "@/lib/api-client";

export const metadata = { title: "Users" };

export default async function AdminUsers() {
  const users = await api.users.all();
  return (
    <>
      <PageHeader title="Users" description="Contact details are masked. Identity payload access is a separate, audited permission." />
      <input className="input mb-4 max-w-md" placeholder="Search by internal ID, name, email or phone…" aria-label="Search users" />
      <AdminTable head={["User", "Contact", "Verification", "Rentals", "Status", "Actions"]}>
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-canvas">
            <td className={td}>
              <div className="flex items-center gap-3">
                <Avatar user={u} size="sm" />
                <div><p className="font-medium">{u.displayName}</p><p className="font-mono text-xs text-muted">{u.id}</p></div>
              </div>
            </td>
            <td className={`${td} text-xs text-muted`}>{u.displayName[0].toLowerCase()}•••@example.com<br />+234 ••• ••• {String(40 + u.id.charCodeAt(1)).slice(-2)}</td>
            <td className={td}><IdentityBadges verification={u.verification} compact /></td>
            <td className={td}>{u.stats.completedRentals}</td>
            <td className={td}><Badge tone="success">Active</Badge></td>
            <td className={`${td} space-x-3 whitespace-nowrap`}>
              <ReasonedAction label="Restrict" title={`Restrict ${u.displayName}?`} consequences="The user won't be able to request rentals or publish listings until reactivated. They'll be notified with a non-accusatory explanation." tone="danger" />
              <ReasonedAction label="Request review" title="Request second review" consequences="Assigns this account to another officer for review." />
            </td>
          </tr>
        ))}
      </AdminTable>
      <p className="mt-3 text-xs text-muted">Never label a user as fraudulent based only on risk signals.</p>
    </>
  );
}
