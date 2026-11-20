import { GearImage } from "@/components/gear-image";
import { Badge, PageHeader } from "@/components/ui";
import { ReasonedAction } from "@/features/admin/reasoned-action";
import { AdminTable, td } from "@/features/admin/table";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Listings" };

export default async function AdminListings() {
  const [items, users, reports] = await Promise.all([api.admin.listings(), api.users.all(), api.admin.reports()]);
  const byId = new Map(users.map((u) => [u.id, u]));
  return (
    <>
      <PageHeader title="Listings & equipment" description="Moderate listings and review ownership evidence. Every action needs a reason." />
      <AdminTable head={["Listing", "Owner", "Status", "Serial", "Ownership evidence", "Reports", "Actions"]}>
        {items.map((e) => {
          const reportCount = reports.filter((r) => r.targetId === e.id).length;
          return (
            <tr key={e.id} className="hover:bg-canvas">
              <td className={td}>
                <div className="flex items-center gap-3">
                  <GearImage category={e.category} alt="" iconSize="size-4" className="size-10 shrink-0 rounded-md" />
                  <div><p className="font-medium">{e.brand} {e.model}</p><p className="text-xs text-muted">{formatMoney(e.dailyRateMinor)}/day</p></div>
                </div>
              </td>
              <td className={td}>{byId.get(e.ownerId)?.displayName}</td>
              <td className={td}><Badge tone={e.status === "active" ? "success" : "neutral"}>{e.status}</Badge></td>
              <td className={`${td} font-mono text-xs`}>{e.serialMasked ?? "—"}</td>
              <td className={td}><Badge tone={e.ownershipEvidence === "reviewed" ? "success" : e.ownershipEvidence === "submitted" ? "warning" : "neutral"}>{e.ownershipEvidence}</Badge></td>
              <td className={td}>{reportCount > 0 ? <Badge tone="danger">{reportCount}</Badge> : "0"}</td>
              <td className={`${td} space-x-3 whitespace-nowrap`}>
                <ReasonedAction label="Hide" title="Hide listing?" consequences="The listing is removed from search. Active rentals are unaffected." tone="danger" />
                <ReasonedAction label="Request evidence" title="Request more evidence" consequences="The owner is asked to upload additional ownership evidence." />
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </>
  );
}
