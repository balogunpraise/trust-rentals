"use client";

import Link from "next/link";
import { createContext, use, useMemo, useState } from "react";
import {
  AlertTriangle, Check, CircleCheck, Clock, CreditCard, FileText, Gavel, Lock, MessageSquare, Package, RefreshCw, Send, ShieldCheck, Star, Undo2,
} from "lucide-react";
import clsx from "clsx";
import { Avatar } from "@/components/avatar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EvidenceUploader } from "@/components/evidence-uploader";
import { GearImage } from "@/components/gear-image";
import { IdentityBadges } from "@/components/identity-badge";
import { PriceBreakdown } from "@/components/price-breakdown";
import { StatusTimeline } from "@/components/status-timeline";
import { UserSummary } from "@/components/user-summary";
import { Badge, InlineAlert } from "@/components/ui";
import { api } from "@/lib/api-client";
import { formatDate, formatDateTime, formatMoney, formatRange } from "@/lib/format";
import { DISPUTE_FLOW, DISPUTE_LABEL, nextAction, STATE_LABEL, stateTone } from "@/lib/rental-state";
import type { Dispute, DisputeReason, Equipment, Message, PublicUser, Rental, RentalState } from "@/lib/types";

type Ws = {
  rental: Rental;
  setRental: React.Dispatch<React.SetStateAction<Rental>>;
  dispute: Dispute | null;
  setDispute: (d: Dispute | null) => void;
  viewerId: string;
  isOwner: boolean;
  other: PublicUser;
  owner: PublicUser;
  renter: PublicUser;
  eq: Equipment;
  items: string[];
  busy: boolean;
  transition: (to: RentalState, patch?: Partial<Rental>, note?: string, apiAction?: Parameters<typeof api.rentals.transition>[1]) => Promise<void>;
  flash: (msg: string) => void;
  now: string;
  showDispute: boolean;
  setShowDispute: (v: boolean) => void;
};
const WsContext = createContext<Ws | null>(null);
const useWs = () => use(WsContext)!;

type Props = {
  initial: Rental;
  equipment: Equipment;
  owner: PublicUser;
  renter: PublicUser;
  currentUserId: string;
  initialDispute: Dispute | null;
  initialMessages: Message[];
  conversationId?: string;
  now: string;
};

const DISPUTE_REASONS: [DisputeReason, string][] = [
  ["non_return", "Equipment not returned"],
  ["damage", "Damage"],
  ["missing_accessory", "Missing accessory"],
  ["late_return", "Late return"],
  ["payment_issue", "Payment issue"],
  ["misrepresentation", "Equipment not as described"],
  ["other", "Other"],
];

function Panel({ title, icon: Icon, children, tone = "default" }: { title: string; icon: React.ElementType; children: React.ReactNode; tone?: "default" | "danger" }) {
  return (
    <section className={clsx("card p-6", tone === "danger" && "border-danger/30")}>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Icon className={clsx("size-5", tone === "danger" ? "text-danger" : "text-brand")} /> {title}
      </h2>
      {children}
    </section>
  );
}

function Checklist({ items, checked, onToggle }: { items: string[]; checked: Set<string>; onToggle: (i: string) => void }) {
  return (
    <ul className="space-y-1.5">
      {items.map((i) => (
        <li key={i}>
          <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border border-line p-2.5 text-sm has-[:checked]:border-success/40 has-[:checked]:bg-success-soft/50">
            <input type="checkbox" className="size-4 accent-[#18794e]" checked={checked.has(i)} onChange={() => onToggle(i)} />
            <Package className="size-4 text-muted" /> {i}
          </label>
        </li>
      ))}
    </ul>
  );
}

export function RentalWorkspace(props: Props) {
  const { equipment: eq, owner, renter, currentUserId, now } = props;
  const [rental, setRental] = useState(props.initial);
  const [dispute, setDispute] = useState<Dispute | null>(props.initialDispute);
  const [viewerId, setViewerId] = useState(currentUserId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isOwner = viewerId === rental.ownerId;
  const other = isOwner ? renter : owner;
  const action = nextAction(rental, viewerId);
  const items = useMemo(() => [`${eq.brand} ${eq.model} (main unit)`, ...eq.accessories], [eq]);
  const lastHealthy = [...rental.history].reverse().find((h) => h.state !== "DISPUTED")?.state;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function transition(to: RentalState, patch: Partial<Rental> = {}, note?: string, apiAction?: Parameters<typeof api.rentals.transition>[1]) {
    setBusy(true);
    setError(null);
    try {
      if (apiAction) await api.rentals.transition(rental.id, apiAction);
      setRental((r) => ({ ...r, ...patch, state: to, history: [...r.history, { state: to, at: new Date().toISOString(), by: viewerId, note }] }));
    } catch {
      setError("That action couldn't be completed. Nothing has changed — please retry.");
    } finally {
      setBusy(false);
    }
  }

  const [showDispute, setShowDispute] = useState(false);
  const ctx: Ws = { rental, setRental, dispute, setDispute, viewerId, isOwner, other, owner, renter, eq, items, busy, transition, flash, now, showDispute, setShowDispute };

  return (
    <WsContext value={ctx}>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-6">
        {/* Header */}
        <div className="card p-5">
          <div className="flex flex-wrap items-start gap-4">
            <GearImage src={eq.images[0]} category={eq.category} alt="" iconSize="size-8" className="size-20 shrink-0 rounded-[10px]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-muted">{rental.reference}</span>
                <Badge tone={stateTone(rental.state)}>{STATE_LABEL[rental.state]}</Badge>
              </div>
              <h1 className="mt-1 text-xl font-bold">
                <Link href={`/equipment/${eq.id}`} className="hover:text-brand">{eq.brand} {eq.model}</Link>
              </h1>
              <p className="text-sm text-muted">{formatRange(rental.startDate, rental.endDate)} · {rental.price.days} days · {eq.area}</p>
            </div>
          </div>
          <div className="mt-6"><StatusTimeline state={rental.state} lastHealthyState={lastHealthy} /></div>
          {action.who !== "none" && (
            <div className={clsx("mt-5 rounded-[var(--radius-control)] p-3.5 text-sm", action.who === "you" ? "bg-brand-soft" : "bg-canvas")}>
              <p className="font-semibold">{action.who === "you" ? "Your next step: " : ""}{action.label}</p>
              <p className="text-ink-soft">{action.description}</p>
            </div>
          )}
        </div>

        {error && <InlineAlert tone="danger">{error}</InlineAlert>}
        <StepPanel />

        {/* Chat */}
        <ChatPanel conversationId={props.conversationId} initial={props.initialMessages} me={viewerId} owner={owner} renter={renter} reference={rental.reference} state={rental.state} />
      </div>

      <aside className="space-y-4">
        <div className="card border-dashed border-brand/40 bg-brand-soft/40 p-4 text-sm">
          <p className="font-semibold">Demo mode</p>
          <p className="text-xs text-muted">Mock data — switch sides to walk through the full flow. In production, the server enforces roles.</p>
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-[var(--radius-control)] bg-surface p-1">
            {[[renter.id, "Renter"], [owner.id, "Owner"]].map(([id, l]) => (
              <button key={id} onClick={() => setViewerId(id)} className={clsx("rounded-md py-1.5 text-xs font-semibold", viewerId === id ? "bg-brand text-white" : "text-muted")}>
                View as {l}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="eyebrow mb-3">Parties</p>
          {[[owner, "Owner"], [renter, "Renter"]].map(([u, role]) => (
            <Link key={role as string} href={`/users/${(u as PublicUser).id}`} className="mb-3 flex items-center gap-3 last:mb-0">
              <Avatar user={u as PublicUser} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{(u as PublicUser).displayName} {(u as PublicUser).id === viewerId && <span className="font-normal text-muted">(you)</span>}</span>
                <span className="text-xs text-muted">{role as string}</span>
              </span>
            </Link>
          ))}
          <div className="mt-3"><IdentityBadges verification={other.verification} compact /></div>
        </div>

        <div className="card p-5">
          <p className="eyebrow mb-3">Payment</p>
          <PriceBreakdown price={rental.price} />
          <div className="mt-4 flex items-center justify-between rounded-[var(--radius-control)] bg-canvas p-3 text-sm">
            <span className="text-muted">Status</span>
            {rental.payment.status === "SUCCEEDED" ? (
              <Badge tone="success"><ShieldCheck className="size-3" /> Provider confirmed</Badge>
            ) : rental.payment.status === "FAILED" ? (
              <Badge tone="danger">Failed</Badge>
            ) : (
              <Badge>Not paid</Badge>
            )}
          </div>
          {rental.payment.providerReference && <p className="mt-2 font-mono text-xs text-muted">Provider ref: {rental.payment.providerReference}</p>}
        </div>

        <div className="card p-5 text-sm">
          <p className="eyebrow mb-3">Agreement</p>
          <p>Version {rental.agreement.version} · <span className="font-mono text-xs">{rental.agreement.contentHash}</span></p>
          <p className="mt-1 text-muted">Owner: {rental.agreement.ownerAcceptedAt ? `accepted ${formatDateTime(rental.agreement.ownerAcceptedAt)}` : "pending"}</p>
          <p className="text-muted">Renter: {rental.agreement.renterAcceptedAt ? `accepted ${formatDateTime(rental.agreement.renterAcceptedAt)}` : "pending"}</p>
        </div>

        <div className="card p-5">
          <p className="eyebrow mb-3">Activity</p>
          <ol className="space-y-3 border-l border-line pl-4 text-sm">
            {[...rental.history].reverse().map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-surface bg-brand" />
                <p className="font-medium">{STATE_LABEL[h.state]}</p>
                <p className="text-xs text-muted">{formatDateTime(h.at)}{h.note ? ` · ${h.note}` : ""}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          {!["DISPUTED", "COMPLETED", "DECLINED", "CANCELLED", "EXPIRED", "REQUESTED"].includes(rental.state) && !showDispute && (
            <button className="btn-ghost justify-start text-danger" onClick={() => setShowDispute(true)}><Gavel className="size-4" /> Open a dispute</button>
          )}
          <Link href="/help" className="btn-ghost justify-start">Contact support about {rental.reference}</Link>
        </div>
      </aside>

      {toast && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-[var(--radius-control)] bg-ink px-4 py-3 text-sm text-white shadow-[var(--shadow-pop)] lg:bottom-6">
          {toast}
        </div>
      )}
    </div>
    </WsContext>
  );
}

// ---------- step panels ----------

function OwnerDecision() {
  const { rental, isOwner, owner, renter, busy, transition } = useWs();
  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!isOwner) {
    return (
      <Panel title="Waiting for the owner" icon={Clock}>
        <p className="text-sm text-muted">
          {owner.displayName.split(" ")[0]} usually responds {owner.stats.responseTime}.{" "}
          {rental.expiresAt && <>This request expires {formatDateTime(rental.expiresAt)} if there&apos;s no response.</>} Dates aren&apos;t reserved until the owner accepts.
        </p>
        <CancelButton />
      </Panel>
    );
  }
  return (
    <Panel title="New rental request" icon={Clock}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <UserSummary user={renter} heading="Renter" />
        <div className="space-y-3 text-sm">
          <p className="eyebrow">Request</p>
          <p><span className="text-muted">Dates:</span> {formatRange(rental.startDate, rental.endDate)} ({rental.price.days} days)</p>
          <p><span className="text-muted">You receive (rental fee):</span> <strong>{formatMoney(rental.price.rentalFeeMinor)}</strong></p>
          <p><span className="text-muted">Deposit held by provider:</span> {formatMoney(rental.price.depositMinor)}</p>
          {rental.expiresAt && <p className="text-warning">Respond by {formatDateTime(rental.expiresAt)}</p>}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button className="btn-primary" disabled={busy} onClick={() => transition("AGREEMENT_PENDING", { agreement: { ...rental.agreement, ownerAcceptedAt: undefined } }, "Owner accepted", "accept")}>
          <Check className="size-4" /> Accept request
        </button>
        <button className="btn-secondary" onClick={() => setDeclineOpen(true)}>Decline</button>
        <a href="#chat" className="btn-ghost"><MessageSquare className="size-4" /> Ask a question</a>
      </div>
      <ConfirmDialog
        open={declineOpen}
        title="Decline this request?"
        consequences="The renter will be notified and the dates will stay open for others. This can't be undone."
        confirmLabel="Decline request"
        tone="danger"
        onCancel={() => setDeclineOpen(false)}
        onConfirm={() => {
          setDeclineOpen(false);
          transition("DECLINED", {}, reason || "Declined by owner", "decline");
        }}
      >
        <label className="label" htmlFor="decline-reason">Reason (optional, shared with renter)</label>
        <select id="decline-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Prefer not to say</option>
          <option>Equipment not available on these dates</option>
          <option>Equipment needs maintenance</option>
          <option>Requested use doesn&apos;t fit this equipment</option>
        </select>
      </ConfirmDialog>
    </Panel>
  );
}

function CancelButton() {
  const { transition } = useWs();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn-secondary mt-4" onClick={() => setOpen(true)}>Cancel request</button>
      <ConfirmDialog
        open={open}
        title="Cancel this request?"
        consequences="The owner will be notified. You haven't been charged, so there's nothing to refund."
        confirmLabel="Cancel request"
        tone="danger"
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          transition("CANCELLED", {}, "Cancelled by renter", "cancel");
        }}
      />
    </>
  );
}

function Agreement() {
  const { rental, isOwner, other, owner, renter, eq, busy, transition } = useWs();
  const [read, setRead] = useState(false);
  const mine = isOwner ? rental.agreement.ownerAcceptedAt : rental.agreement.renterAcceptedAt;
  const theirs = isOwner ? rental.agreement.renterAcceptedAt : rental.agreement.ownerAcceptedAt;
  return (
    <Panel title={`Rental agreement · v${rental.agreement.version}`} icon={FileText}>
      <div id="agreement" className="max-h-80 overflow-y-auto rounded-[var(--radius-control)] border border-line bg-canvas p-4 text-sm leading-relaxed text-ink-soft">
        <p className="font-semibold text-ink">Equipment rental agreement — {rental.reference}</p>
        <p className="mt-2"><strong>Parties.</strong> {owner.displayName} (&ldquo;Owner&rdquo;) and {renter.displayName} (&ldquo;Renter&rdquo;).</p>
        <p className="mt-2"><strong>Equipment.</strong> {eq.brand} {eq.model}, condition &ldquo;{eq.condition}&rdquo;, with: {eq.accessories.join(", ")}.</p>
        <p className="mt-2"><strong>Period.</strong> Pickup {formatDate(rental.startDate)}; return by {formatDate(rental.endDate)} at the agreed time.</p>
        <p className="mt-2"><strong>Price.</strong> Rental fee {formatMoney(rental.price.rentalFeeMinor)}; platform fee {formatMoney(rental.price.platformFeeMinor)}; refundable security deposit {formatMoney(rental.price.depositMinor)} held via the licensed payment provider.</p>
        <p className="mt-2"><strong>Handover & return.</strong> Both parties complete a photo checklist at handover and return. The rental becomes active only when both confirm.</p>
        <p className="mt-2"><strong>Late return.</strong> Each started 24-hour period beyond the return time is charged at the daily rate.</p>
        <p className="mt-2"><strong>Damage & missing items.</strong> Disagreements are handled via the TrustRent dispute process using the recorded evidence. TrustRent does not decide fault automatically.</p>
        <p className="mt-2"><strong>Cancellation.</strong> As shown at request time. Material changes create a new agreement version requiring re-acceptance.</p>
        <p className="mt-3 text-xs text-muted">Version {rental.agreement.version} · content hash {rental.agreement.contentHash}. This summary is subject to legal review before launch.</p>
      </div>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {[[owner, rental.agreement.ownerAcceptedAt, "Owner"], [renter, rental.agreement.renterAcceptedAt, "Renter"]].map(([u, at, role]) => (
          <li key={role as string} className="flex items-center gap-2 rounded-[var(--radius-control)] border border-line p-3">
            {at ? <CircleCheck className="size-5 text-success" /> : <Clock className="size-5 text-warning" />}
            <span>
              <span className="font-medium">{role as string}: {(u as PublicUser).displayName}</span>
              <span className="block text-xs text-muted">{at ? `Accepted ${formatDateTime(at as string)}` : "Not yet accepted"}</span>
            </span>
          </li>
        ))}
      </ul>
      {!mine ? (
        <div className="mt-4">
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={read} onChange={(e) => setRead(e.target.checked)} className="mt-0.5 size-4 accent-brand" />
            I&apos;ve read and accept version {rental.agreement.version} of this agreement.
          </label>
          <button
            className="btn-primary mt-3"
            disabled={!read || busy}
            onClick={() => {
              const at = new Date().toISOString();
              const agreement = { ...rental.agreement, [isOwner ? "ownerAcceptedAt" : "renterAcceptedAt"]: at };
              const both = agreement.ownerAcceptedAt && agreement.renterAcceptedAt;
              transition(both ? "PAYMENT_PENDING" : "AGREEMENT_PENDING", { agreement }, `${isOwner ? "Owner" : "Renter"} accepted agreement v${rental.agreement.version}`, "agreement/accept");
            }}
          >
            Accept agreement
          </button>
        </div>
      ) : !theirs ? (
        <InlineAlert tone="info">You&apos;ve accepted. Waiting for {other.displayName.split(" ")[0]} to accept the same version.</InlineAlert>
      ) : null}
    </Panel>
  );
}

function Checkout() {
  const { rental, setRental, isOwner, eq, flash } = useWs();
  const [method, setMethod] = useState("card");
  const [phase, setPhase] = useState<"idle" | "redirecting" | "verifying" | "failed">("idle");
  const [idempotencyKey] = useState(() => `${rental.id}-${crypto.randomUUID()}`);
  if (isOwner) {
    return (
      <Panel title="Waiting for payment" icon={CreditCard}>
        <p className="text-sm text-muted">The renter is completing checkout. We&apos;ll mark this rental paid only after the payment provider confirms it.</p>
      </Panel>
    );
  }
  async function pay(fail = false) {
    setPhase("redirecting");
    const intent = await api.rentals.createPaymentIntent(rental.id, idempotencyKey);
    setTimeout(() => setPhase("verifying"), 900);
    setTimeout(() => {
      if (fail) {
        setPhase("failed");
        setRental((r) => ({ ...r, payment: { ...r.payment, status: "FAILED", providerReference: intent.providerReference } }));
        return;
      }
      setRental((r) => ({
        ...r,
        state: "HANDOVER_PENDING",
        payment: { status: "SUCCEEDED", provider: "Sandbox PSP", providerReference: intent.providerReference },
        history: [...r.history, { state: "PAID", at: new Date().toISOString(), note: "Confirmed by provider webhook" }, { state: "HANDOVER_PENDING", at: new Date().toISOString() }],
      }));
      flash("Payment confirmed by the provider.");
    }, 2600);
  }
  return (
    <Panel title="Payment" icon={CreditCard}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="eyebrow mb-3">Order summary</p>
          <PriceBreakdown price={rental.price} dailyRateMinor={eq.dailyRateMinor} />
        </div>
        <div>
          <p className="eyebrow mb-3">Payment method</p>
          <div className="space-y-2">
            {[["card", "Debit / credit card"], ["transfer", "Bank transfer"], ["ussd", "USSD"]].map(([v, l]) => (
              <label key={v} className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border border-line p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                <input type="radio" name="method" checked={method === v} onChange={() => setMethod(v)} className="accent-brand" /> {l}
              </label>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted"><Lock className="mt-0.5 size-3 shrink-0" /> You&apos;ll complete payment on our licensed provider&apos;s secure page. TrustRent never sees or stores your card details.</p>
        </div>
      </div>
      {phase === "failed" && (
        <div className="mt-4"><InlineAlert tone="danger" title="Payment wasn't completed">The provider reported the payment as failed. You haven&apos;t been charged. You can retry safely — we won&apos;t create a duplicate payment.</InlineAlert></div>
      )}
      {phase === "verifying" && (
        <div className="mt-4"><InlineAlert tone="info" title="Confirming with the payment provider…">Please don&apos;t close this page. A redirect alone doesn&apos;t confirm payment — we wait for the provider&apos;s verified confirmation.</InlineAlert></div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="btn-primary px-6 py-3" disabled={phase === "redirecting" || phase === "verifying"} onClick={() => pay(false)}>
          {phase === "redirecting" ? "Opening secure checkout…" : phase === "verifying" ? <><RefreshCw className="size-4 animate-spin" /> Verifying…</> : phase === "failed" ? "Retry payment" : `Pay ${formatMoney(rental.price.totalMinor)}`}
        </button>
        {phase === "idle" && <button className="text-xs text-muted underline" onClick={() => pay(true)}>Demo: simulate failed payment</button>}
      </div>
    </Panel>
  );
}

function Handover() {
  const { isOwner, other, items, busy, transition, setShowDispute } = useWs();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState<{ owner?: string; renter?: string }>({});
  const mine = isOwner ? confirmed.owner : confirmed.renter;
  const theirs = isOwner ? confirmed.renter : confirmed.owner;
  const toggle = (i: string) => setChecked((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  const allChecked = checked.size === items.length;

  function finish(next: { owner?: string; renter?: string }) {
    setConfirmed(next);
    if (next.owner && next.renter) transition("ACTIVE", {}, "Both parties confirmed handover", "handover");
  }

  return (
    <Panel title="Handover checklist" icon={Package}>
      <p className="mb-4 text-sm text-muted">Check each item together at pickup and photograph its condition. The rental becomes active only when both of you confirm.</p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="label">Items & accessories ({checked.size}/{items.length})</p>
          <Checklist items={items} checked={checked} onToggle={toggle} />
          <label className="label mt-4" htmlFor="ho-notes">Condition notes</label>
          <textarea id="ho-notes" rows={3} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. light scuff on side panel, all inputs tested" />
        </div>
        <EvidenceUploader label="Handover photos" min={3} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        {!mine ? (
          <button className="btn-primary" disabled={!allChecked || busy} onClick={() => finish({ ...confirmed, [isOwner ? "owner" : "renter"]: new Date().toISOString() })}>
            <Check className="size-4" /> Confirm handover as {isOwner ? "owner" : "renter"}
          </button>
        ) : (
          <Badge tone="success"><CircleCheck className="size-3.5" /> You confirmed</Badge>
        )}
        {theirs ? <Badge tone="success">{other.displayName.split(" ")[0]} confirmed</Badge> : <Badge tone="warning">Waiting for {other.displayName.split(" ")[0]}</Badge>}
        {mine && !theirs && (
          <button className="text-xs text-muted underline" onClick={() => finish({ ...confirmed, [isOwner ? "renter" : "owner"]: new Date().toISOString() })}>
            Demo: simulate {other.displayName.split(" ")[0]}&apos;s confirmation
          </button>
        )}
        {!allChecked && !mine && <span className="text-xs text-muted">Tick every item to confirm.</span>}
      </div>
      <p className="mt-3 text-xs text-muted">Disagree about condition? Don&apos;t confirm — <button className="underline" onClick={() => setShowDispute(true)}>open a dispute</button> instead.</p>
    </Panel>
  );
}

function Active() {
  const { rental, isOwner, other, items, transition, now, setShowDispute } = useWs();
  const due = new Date(`${rental.endDate}T18:00:00+01:00`);
  const hours = Math.round((due.getTime() - new Date(now).getTime()) / 3_600_000);
  return (
    <Panel title="Rental in progress" icon={Clock}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[var(--radius-control)] bg-brand-soft p-4">
          <p className="text-xs text-brand-dark">Return due</p>
          <p className="text-lg font-semibold">{formatDate(rental.endDate)}, 6:00pm</p>
          <p className="text-sm text-brand-dark">{hours > 0 ? `in ${Math.floor(hours / 24)}d ${hours % 24}h` : "Overdue"}</p>
        </div>
        <div className="rounded-[var(--radius-control)] bg-canvas p-4 sm:col-span-2">
          <p className="text-xs text-muted">Handover record</p>
          <p className="text-sm">All {items.length} items confirmed by both parties · 6 photos · {formatDateTime(rental.history.find((h) => h.state === "ACTIVE")?.at ?? rental.startDate)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Due times and overdue status are calculated by TrustRent&apos;s servers, not your device clock. You&apos;ll get reminders before the due time.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {!isOwner && (
          <button className="btn-primary" onClick={() => transition("RETURN_PENDING", {}, "Renter started return")}>
            <Undo2 className="size-4" /> Start return
          </button>
        )}
        <a href="#chat" className="btn-secondary"><MessageSquare className="size-4" /> Message {other.displayName.split(" ")[0]}</a>
        <button className="btn-ghost text-danger" onClick={() => setShowDispute(true)}><AlertTriangle className="size-4" /> Report an issue</button>
      </div>
    </Panel>
  );
}

function Return() {
  const { rental, isOwner, owner, items, busy, transition, setShowDispute } = useWs();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [condition, setCondition] = useState<"unchanged" | "changed" | "missing">("unchanged");
  const toggle = (i: string) => setChecked((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  const inspecting = rental.state === "INSPECTION_PENDING";

  if (inspecting && !isOwner) {
    return (
      <Panel title="Waiting for owner inspection" icon={Clock}>
        <p className="text-sm text-muted">You&apos;ve submitted the return. {owner.displayName.split(" ")[0]} will check the equipment against the handover record.</p>
      </Panel>
    );
  }
  if (!inspecting && isOwner) {
    return (
      <Panel title="Return in progress" icon={Undo2}>
        <p className="text-sm text-muted">The renter is documenting the return. You&apos;ll be asked to inspect once they submit.</p>
      </Panel>
    );
  }
  return (
    <Panel title={inspecting ? "Inspect returned equipment" : "Return equipment"} icon={Undo2}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="label">Items returned ({checked.size}/{items.length})</p>
          <Checklist items={items} checked={checked} onToggle={toggle} />
          <fieldset className="mt-4">
            <legend className="label">Condition compared with handover</legend>
            <div className="grid gap-2">
              {[["unchanged", "Unchanged"], ["changed", "Condition changed / damage"], ["missing", "Missing item"]].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 rounded-[var(--radius-control)] border border-line p-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
                  <input type="radio" name="cond" checked={condition === v} onChange={() => setCondition(v as typeof condition)} className="accent-brand" /> {l}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <EvidenceUploader label="Return photos" min={3} />
      </div>
      {condition !== "unchanged" && (
        <div className="mt-4">
          <InlineAlert tone="warning" title="There's an issue with the return">Open a dispute so the evidence is preserved and a dispute officer can review it. This pauses completion.</InlineAlert>
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
        {condition === "unchanged" ? (
          <button
            className="btn-primary"
            disabled={checked.size !== items.length || busy}
            onClick={() =>
              inspecting
                ? transition("COMPLETED", {}, "Owner confirmed return condition; deposit release submitted to provider", "inspect")
                : transition("INSPECTION_PENDING", {}, "Renter submitted return", "return")
            }
          >
            <Check className="size-4" /> {inspecting ? "Confirm condition & complete" : "Submit return"}
          </button>
        ) : (
          <button className="btn-danger" onClick={() => setShowDispute(true)}><Gavel className="size-4" /> Open dispute</button>
        )}
      </div>
    </Panel>
  );
}

function Completion() {
  const { rental, isOwner, other } = useWs();
  const [scores, setScores] = useState({ communication: 0, punctuality: 0, accuracy: 0 });
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const rating = Math.round(((scores.communication + scores.punctuality + scores.accuracy) / 3) * 10) / 10;
  return (
    <Panel title="Rental completed" icon={CircleCheck}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-control)] bg-success-soft p-4 text-sm">
          <p className="font-semibold text-success">Completed {formatDateTime(rental.history.at(-1)!.at)}</p>
          <p className="text-ink-soft">Handover and return records are attached to {rental.reference}.</p>
        </div>
        <div className="rounded-[var(--radius-control)] bg-canvas p-4 text-sm">
          <p className="font-semibold">Deposit: release submitted</p>
          <p className="text-muted">Settlement status comes from the payment provider and may take 1–3 business days.</p>
        </div>
      </div>
      {done ? (
        <div className="mt-5"><InlineAlert tone="success" title="Review submitted">Thanks — your review is linked to this completed rental.</InlineAlert></div>
      ) : (
        <form
          className="mt-6 border-t border-line pt-5"
          onSubmit={async (e) => {
            e.preventDefault();
            await api.rentals.review(rental.id, { rating, ...scores, comment });
            setDone(true);
          }}
        >
          <p className="font-semibold">Review {other.displayName}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(["communication", "punctuality", "accuracy"] as const).map((k) => (
              <fieldset key={k}>
                <legend className="mb-1 text-sm capitalize text-muted">{k === "accuracy" ? (isOwner ? "Care of equipment" : "Condition & accuracy") : k}</legend>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setScores((s) => ({ ...s, [k]: n }))}>
                      <Star className={clsx("size-6", n <= scores[k] ? "fill-[#f5a524] text-[#f5a524]" : "text-line-strong")} />
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <textarea rows={3} className="input mt-4" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment. Stick to your experience on this rental." />
          <button className="btn-primary mt-3" disabled={!scores.communication || !scores.punctuality || !scores.accuracy}>Submit review</button>
        </form>
      )}
    </Panel>
  );
}

function DisputeView() {
  const { dispute, owner, renter } = useWs();
  if (!dispute) return null;
  const idx = DISPUTE_FLOW.indexOf(dispute.state);
  return (
    <Panel title={`Dispute ${dispute.reference}`} icon={Gavel} tone="danger">
      <ol className="mb-5 grid grid-cols-5 gap-1 text-center text-[11px]">
        {DISPUTE_FLOW.map((s, i) => (
          <li key={s}>
            <div className={clsx("h-1.5 rounded-full", i <= idx ? "bg-danger" : "bg-line")} />
            <span className={clsx("mt-1 block", i === idx ? "font-semibold text-ink" : "text-muted")}>{DISPUTE_LABEL[s]}</span>
          </li>
        ))}
      </ol>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-muted">Reason</dt><dd className="font-medium">{DISPUTE_REASONS.find(([r]) => r === dispute.reason)?.[1]}</dd></div>
        <div><dt className="text-muted">Opened</dt><dd>{formatDateTime(dispute.createdAt)} by {dispute.openedBy === owner.id ? owner.displayName : renter.displayName}</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted">Description</dt><dd>{dispute.description}</dd></div>
      </dl>
      {dispute.state === "EVIDENCE_REQUESTED" && (
        <div className="mt-4"><InlineAlert tone="warning" title="Evidence requested">The dispute officer asked both parties for any additional photos of the bag contents at handover and return.</InlineAlert></div>
      )}
      <p className="mt-5 mb-2 text-sm font-semibold">Evidence on file ({dispute.evidence.length})</p>
      <ul className="space-y-2">
        {dispute.evidence.map((ev) => (
          <li key={ev.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line p-3 text-sm">
            <span>
              <span className="font-medium">{ev.caption}</span>
              <span className="block text-xs text-muted">Captured {formatDateTime(ev.capturedAt)} · uploaded {formatDateTime(ev.uploadedAt)} · {ev.checksum}</span>
            </span>
            <Lock className="size-4 shrink-0 text-muted" aria-label="Private" />
          </li>
        ))}
        {dispute.evidence.length === 0 && <li className="text-sm text-muted">Handover and return evidence are automatically attached.</li>}
      </ul>
      <div className="mt-5"><EvidenceUploader label="Add evidence" /></div>
      <p className="mt-3 text-xs text-muted">Evidence can&apos;t be edited or deleted once submitted — corrections are added as new items. Internal notes from dispute staff aren&apos;t shown here. We don&apos;t decide fault automatically or seize funds without a recorded decision.</p>
    </Panel>
  );
}


function OpenDispute() {
  const { rental, setDispute, viewerId, transition, flash, setShowDispute } = useWs();
  const [reason, setReason] = useState<DisputeReason | "">("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <Panel title="Open a dispute" icon={Gavel} tone="danger">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!reason) return setErr("Choose a reason.");
          if (description.trim().length < 20) return setErr("Describe the issue in at least 20 characters.");
          const d = await api.rentals.openDispute(rental.id, { reason, description });
          setDispute({ ...d, openedBy: viewerId, createdAt: new Date().toISOString(), evidence: [] });
          setShowDispute(false);
          transition("DISPUTED", { disputeId: d.id }, `Dispute opened: ${reason}`);
          flash(`Dispute ${d.reference} opened. Both parties have been notified.`);
        }}
      >
        <div>
          <label className="label" htmlFor="d-reason">Reason</label>
          <select id="d-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value as DisputeReason)}>
            <option value="">Select a reason</option>
            {DISPUTE_REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="d-desc">What happened?</label>
          <textarea id="d-desc" rows={4} className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <EvidenceUploader label="Evidence" />
        <InlineAlert tone="info" title="What happens next">
          Normal progression of this rental pauses. Existing handover/return evidence is preserved, both parties are notified, and a dispute officer reviews the case. They may request more evidence before recording a decision.
        </InlineAlert>
        {err && <p role="alert" className="text-sm text-danger">{err}</p>}
        <div className="flex gap-2">
          <button className="btn-danger">Submit dispute</button>
          <button type="button" className="btn-secondary" onClick={() => setShowDispute(false)}>Cancel</button>
        </div>
      </form>
    </Panel>
  );
}

function Closed() {
  const { rental } = useWs();
  return (
    <Panel title={`Rental ${STATE_LABEL[rental.state].toLowerCase()}`} icon={FileText}>
      <p className="text-sm text-muted">
        This rental is closed. {rental.state === "DECLINED" && "The owner declined the request — no payment was taken."}
        {rental.state === "CANCELLED" && "It was cancelled before payment, so there's nothing to refund."}
        {rental.state === "EXPIRED" && "The owner didn't respond in time and the dates were released."}
      </p>
      <Link href="/explore" className="btn-primary mt-4">Find other equipment</Link>
    </Panel>
  );
}

function StepPanel() {
  const { rental, showDispute } = useWs();
  if (showDispute && rental.state !== "DISPUTED") return <OpenDispute />;
  switch (rental.state) {
    case "REQUESTED": return <OwnerDecision />;
    case "ACCEPTED":
    case "AGREEMENT_PENDING": return <Agreement />;
    case "PAYMENT_PENDING": return <Checkout />;
    case "PAID":
    case "HANDOVER_PENDING": return <Handover />;
    case "ACTIVE": return <Active />;
    case "RETURN_PENDING":
    case "INSPECTION_PENDING": return <Return />;
    case "COMPLETED": return <Completion />;
    case "DISPUTED": return <DisputeView />;
    default: return <Closed />;
  }
}


function ChatPanel({ conversationId, initial, me, owner, renter, reference, state }: { conversationId?: string; initial: Message[]; me: string; owner: PublicUser; renter: PublicUser; reference: string; state: RentalState }) {
  const [msgs, setMsgs] = useState(initial);
  const [text, setText] = useState("");
  const byId: Record<string, PublicUser> = { [owner.id]: owner, [renter.id]: renter };
  return (
    <section id="chat" className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-canvas px-5 py-3">
        <p className="flex items-center gap-2 font-semibold"><MessageSquare className="size-4 text-brand" /> Rental chat</p>
        <span className="font-mono text-xs text-muted">{reference} · {STATE_LABEL[state]}</span>
      </div>
      <ul className="max-h-80 space-y-3 overflow-y-auto p-5">
        {msgs.length === 0 && <li className="text-center text-sm text-muted">No messages yet. Questions about this rental go here and are kept with the transaction record.</li>}
        {msgs.map((m) =>
          m.system ? (
            <li key={m.id} className="text-center text-xs text-muted">{m.body}</li>
          ) : (
            <li key={m.id} className={clsx("flex gap-2", m.senderId === me && "flex-row-reverse")}>
              {byId[m.senderId] && <Avatar user={byId[m.senderId]} size="sm" />}
              <div className={clsx("max-w-[75%] rounded-2xl px-3.5 py-2 text-sm", m.senderId === me ? "rounded-tr-sm bg-brand text-white" : "rounded-tl-sm bg-canvas")}>
                {m.body}
                <span className={clsx("mt-0.5 block text-[10px]", m.senderId === me ? "text-sky-100" : "text-muted")}>{formatDateTime(m.createdAt)}</span>
              </div>
            </li>
          ),
        )}
      </ul>
      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          const m = await api.messaging.send(conversationId ?? "new", text.trim());
          setMsgs((p) => [...p, { ...m, senderId: me }]);
          setText("");
        }}
      >
        <input aria-label="Message" className="input" placeholder="Write a message…" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} />
        <button className="btn-primary px-3" aria-label="Send"><Send className="size-4" /></button>
      </form>
    </section>
  );
}
