import { Lock } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui";
import { DisputeReview } from "@/features/admin/dispute-review";
import { api } from "@/lib/api-client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { DISPUTE_LABEL } from "@/lib/rental-state";

export const metadata = { title: "Disputes" };

export default async function AdminDisputes() {
  const [disputes, rentals, users, items] = await Promise.all([api.disputes.all(), api.rentals.all(), api.users.all(), api.admin.listings()]);
  const d = disputes[0];
  const r = rentals.find((x) => x.id === d?.rentalId);
  const name = (id?: string) => users.find((u) => u.id === id)?.displayName;
  const eq = items.find((e) => e.id === r?.equipmentId);
  if (!d || !r) return <PageHeader title="Disputes" description="No open disputes." />;
  return (
    <>
      <PageHeader title={`Dispute ${d.reference}`} eyebrow="Dispute review" description={`Rental ${r.reference} · ${eq?.brand} ${eq?.model}`} actions={<Badge tone="danger">{DISPUTE_LABEL[d.state]}</Badge>} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h3 className="font-semibold">Case summary</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Opened by</dt><dd>{name(d.openedBy)} (owner) · {formatDateTime(d.createdAt)}</dd></div>
              <div><dt className="text-muted">Other party</dt><dd>{name(r.renterId)} (renter)</dd></div>
              <div><dt className="text-muted">Reason</dt><dd>{d.reason.replace("_", " ")}</dd></div>
              <div><dt className="text-muted">Deposit held</dt><dd>{formatMoney(r.price.depositMinor)} · {r.payment.providerReference}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Statement</dt><dd>{d.description}</dd></div>
              <div><dt className="text-muted">Assigned</dt><dd>{d.assignedOfficer}</dd></div>
              <div><dt className="text-muted">Agreement</dt><dd className="font-mono text-xs">v{r.agreement.version} · {r.agreement.contentHash}</dd></div>
            </dl>
          </section>
          <section className="card p-5">
            <h3 className="font-semibold">Evidence & timeline</h3>
            <ol className="mt-3 space-y-3 border-l border-line pl-4 text-sm">
              {r.history.map((h, i) => (
                <li key={i}><p className="font-medium">{h.state}</p><p className="text-xs text-muted">{formatDateTime(h.at)}{h.note ? ` · ${h.note}` : ""}</p></li>
              ))}
            </ol>
            <ul className="mt-5 space-y-2">
              {d.evidence.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line p-3 text-sm">
                  <span>
                    <span className="font-medium">{e.caption}</span>
                    <span className="block text-xs text-muted">by {name(e.uploaderId)} · captured {formatDateTime(e.capturedAt)} · {e.checksum}</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted"><Lock className="size-3.5" /> signed URL</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Evidence is append-only. Viewing evidence is recorded in the audit log.</p>
          </section>
        </div>
        <DisputeReview />
      </div>
    </>
  );
}
