"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { EvidenceUploader } from "@/components/evidence-uploader";
import { InlineAlert } from "@/components/ui";
import { api } from "@/lib/api-client";

const reasons = [
  ["suspected_fraud", "Suspected fraud"],
  ["stolen_item", "Stolen item concern"],
  ["misleading", "Misleading description"],
  ["duplicate", "Duplicate listing"],
  ["prohibited", "Prohibited item"],
  ["other", "Other"],
] as const;

export function ReportForm({ equipmentId, title }: { equipmentId: string; title: string }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  if (reference) {
    return (
      <div className="card p-8 text-center">
        <CircleCheck className="mx-auto size-12 text-success" />
        <h2 className="mt-4 text-xl font-semibold">Report received</h2>
        <p className="mt-2 text-muted">
          Thank you. An authorised reviewer will look at this report. Receiving a report doesn&apos;t mean misconduct has been proven, and the listing owner won&apos;t see who reported it.
        </p>
        <p className="mt-4 font-mono text-sm">Reference: {reference}</p>
        <Link href={`/equipment/${equipmentId}`} className="btn-primary mt-6">Back to listing</Link>
      </div>
    );
  }

  return (
    <form
      className="card space-y-5 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!reason) return setError("Choose a reason for the report.");
        if (description.trim().length < 20) return setError("Please describe the issue in at least 20 characters.");
        setError(null);
        setSubmitting(true);
        try {
          const r = await api.equipment.report(equipmentId, { reason, description });
          setReference(r.reference);
        } catch {
          setError("We couldn't submit your report. Check your connection and try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <p className="text-sm text-muted">Reporting: <span className="font-medium text-ink">{title}</span></p>
      <fieldset>
        <legend className="label">Reason</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {reasons.map(([v, l]) => (
            <label key={v} className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border border-line p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
              <input type="radio" name="reason" value={v} checked={reason === v} onChange={() => setReason(v)} className="accent-brand" /> {l}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="desc" className="label">What happened?</label>
        <textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Describe what you noticed. Stick to facts — reports are reviewed privately." />
      </div>
      <EvidenceUploader label="Supporting evidence (optional)" />
      <InlineAlert tone="info">Only authorised TrustRent reviewers see report details. Please don&apos;t post accusations publicly or in reviews.</InlineAlert>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-2">
        <Link href={`/equipment/${equipmentId}`} className="btn-secondary">Cancel</Link>
        <button className="btn-primary" disabled={submitting}>{submitting ? "Submitting…" : "Submit report"}</button>
      </div>
    </form>
  );
}
