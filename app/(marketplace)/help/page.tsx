import { FileText, Gavel, LifeBuoy, Lock } from "lucide-react";
import { InlineAlert, PageHeader } from "@/components/ui";

export const metadata = { title: "Help, privacy & support" };

const faqs = [
  ["Does identity verification mean someone is safe?", "No. It confirms the member's identity through an approved provider. It reduces risk but doesn't guarantee behaviour. Always use the handover checklist."],
  ["Who holds my deposit?", "Deposits are processed by our licensed payment provider under its approved model. TrustRent is not a bank, wallet or escrow service."],
  ["What if the equipment is damaged?", "Open a dispute from the rental page. Handover and return evidence is preserved, and a dispute officer reviews both sides before any decision."],
  ["Can I pay the owner directly?", "Please don't. Agreement, payment and evidence protections only apply to rentals booked and paid on TrustRent."],
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader title="Help, privacy & support" description="Answers, policies, and a direct line to our team." />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold"><LifeBuoy className="size-5 text-brand" /> Common questions</h2>
            <div className="mt-3 divide-y divide-line">
              {faqs.map(([q, a]) => (
                <details key={q} className="group py-3">
                  <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">{q}</summary>
                  <p className="mt-2 text-sm text-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>
          <section id="disputes" className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold"><Gavel className="size-5 text-brand" /> Disputes</h2>
            <p className="mt-2 text-sm text-muted">Disputes move through: Opened → Evidence requested → Under review → Decision recorded → Resolved (or escalated). Every decision includes a written rationale. We don&apos;t promise a fixed resolution time during beta.</p>
          </section>
          <section id="privacy" className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold"><Lock className="size-5 text-brand" /> Privacy notice</h2>
            <p className="mt-2 text-sm text-muted">We collect the minimum needed to run the marketplace. Your NIN is never shown publicly or stored raw. Evidence photos are private to the rental&apos;s parties and authorised dispute staff.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-secondary py-1.5">Request my data</button>
              <button className="btn-secondary py-1.5">Correct my data</button>
              <button className="btn-secondary py-1.5">Request deletion</button>
            </div>
            <div className="mt-4"><InlineAlert tone="info">Deletion may be limited where we&apos;re legally required to retain records, or where data is evidence in an open dispute. We&apos;ll explain the outcome of every request.</InlineAlert></div>
          </section>
          <section id="terms" className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold"><FileText className="size-5 text-brand" /> Terms</h2>
            <p className="mt-2 text-sm text-muted">Terms of service are under legal review for the beta launch.</p>
          </section>
        </div>
        <aside>
          <form className="card sticky top-24 space-y-4 p-6">
            <h2 className="font-semibold">Contact support</h2>
            <div>
              <label className="label" htmlFor="topic">Topic</label>
              <select id="topic" className="input">
                <option>A rental</option><option>Payment</option><option>Identity verification</option><option>Report a user or listing</option><option>Account access</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="ref">Reference (optional)</label>
              <input id="ref" className="input" placeholder="TR-2026-000123" />
            </div>
            <div>
              <label className="label" htmlFor="msg">How can we help?</label>
              <textarea id="msg" rows={5} className="input" />
            </div>
            <button type="button" className="btn-primary w-full">Submit request</button>
            <p className="text-xs text-muted">Requests are tied to your account and tracked. You&apos;ll get a ticket reference by email.</p>
          </form>
        </aside>
      </div>
    </div>
  );
}
