import { Badge, PageHeader } from "@/components/ui";
import { ReasonedAction } from "@/features/admin/reasoned-action";
import { AdminTable, td } from "@/features/admin/table";
import { api } from "@/lib/api-client";
import { formatMoney, formatRange } from "@/lib/format";
import { STATE_LABEL, stateTone } from "@/lib/rental-state";

export const metadata = { title: "Rentals & payments" };

export default async function AdminRentals() {
  const [rentals, users, items] = await Promise.all([api.rentals.all(), api.users.all(), api.admin.listings()]);
  const u = new Map(users.map((x) => [x.id, x.displayName]));
  const eq = new Map(items.map((x) => [x.id, `${x.brand} ${x.model}`]));
  return (
    <>
      <PageHeader title="Rentals & payments" description="Payment status reflects provider-confirmed records. Ledger entries are never edited — corrections use compensating entries." />
      <AdminTable head={["Reference", "Equipment", "Parties", "Dates", "State", "Payment", "Agreement", "Actions"]}>
        {rentals.map((r) => (
          <tr key={r.id} className="hover:bg-canvas">
            <td className={`${td} font-mono text-xs`}>{r.reference}</td>
            <td className={td}>{eq.get(r.equipmentId)}</td>
            <td className={`${td} text-xs`}>Owner: {u.get(r.ownerId)}<br />Renter: {u.get(r.renterId)}</td>
            <td className={`${td} text-xs whitespace-nowrap`}>{formatRange(r.startDate, r.endDate)}</td>
            <td className={td}><Badge tone={stateTone(r.state)}>{STATE_LABEL[r.state]}</Badge></td>
            <td className={`${td} text-xs`}>
              <Badge tone={r.payment.status === "SUCCEEDED" ? "success" : r.payment.status === "FAILED" ? "danger" : "neutral"}>{r.payment.status}</Badge>
              <span className="mt-1 block">{formatMoney(r.price.totalMinor)}</span>
              {r.payment.providerReference && <span className="block font-mono text-muted">{r.payment.providerReference}</span>}
            </td>
            <td className={`${td} font-mono text-xs`}>v{r.agreement.version}<br /><span className="text-muted">{r.agreement.contentHash}</span></td>
            <td className={`${td} whitespace-nowrap`}>
              {r.payment.status === "SUCCEEDED" && <ReasonedAction label="Initiate refund" title="Initiate refund via provider" consequences="Creates a REFUND_REQUESTED ledger entry and calls the provider refund API. The refund isn't complete until the provider confirms." tone="danger" />}
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
