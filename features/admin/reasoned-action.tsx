"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

/** Every high-impact admin action requires a reason and creates an audit event (spec A03/A04). */
export function ReasonedAction({ label, title, consequences, tone = "primary", className }: { label: string; title: string; consequences: string; tone?: "primary" | "danger"; className?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);
  if (done) return <span className="text-xs font-medium text-success">Recorded · audit logged</span>;
  return (
    <>
      <button type="button" className={className ?? (tone === "danger" ? "text-xs font-semibold text-danger hover:underline" : "text-xs font-semibold text-brand hover:underline")} onClick={() => setOpen(true)}>
        {label}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        consequences={consequences}
        confirmLabel={label}
        tone={tone}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (reason.trim().length < 10) return setErr(true);
          setOpen(false);
          setDone(true);
        }}
      >
        <label className="label" htmlFor="reason">Reason (required, stored in audit log)</label>
        <textarea id="reason" rows={3} className="input" value={reason} onChange={(e) => { setReason(e.target.value); setErr(false); }} aria-invalid={err} />
        {err && <p className="mt-1 text-xs text-danger">Give a reason of at least 10 characters.</p>}
      </ConfirmDialog>
    </>
  );
}
