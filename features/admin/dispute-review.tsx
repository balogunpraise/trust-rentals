"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { InlineAlert } from "@/components/ui";

const checklist = ["Handover evidence reviewed", "Return evidence reviewed", "Both parties given chance to respond", "Agreement terms checked", "No conflict of interest"];

export function DisputeReview() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>(["Renter says the clip was left in the pole bag. Requested bag interior photos from both."]);
  const [decision, setDecision] = useState("");
  const [rationale, setRationale] = useState("");
  const [recorded, setRecorded] = useState(false);
  return (
    <div className="space-y-6">
      <section className="card p-5">
        <h3 className="font-semibold">Policy checklist</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {checklist.map((c, i) => (
            <li key={c}>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4 accent-brand" checked={checked.has(i)} onChange={() => setChecked((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })} /> {c}
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section className="card border-warning/30 bg-warning-soft/30 p-5">
        <h3 className="flex items-center gap-2 font-semibold"><Lock className="size-4" /> Internal notes <span className="text-xs font-normal text-muted">— never visible to users</span></h3>
        <ul className="mt-3 space-y-2 text-sm">
          {notes.map((n, i) => <li key={i} className="rounded-md bg-surface p-2.5">{n}</li>)}
        </ul>
        <div className="mt-3 flex gap-2">
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal note…" aria-label="Internal note" />
          <button className="btn-secondary" onClick={() => { if (note.trim()) { setNotes((p) => [...p, note.trim()]); setNote(""); } }}>Add</button>
        </div>
      </section>
      <section className="card p-5">
        <h3 className="font-semibold">Record decision</h3>
        {recorded ? (
          <div className="mt-3"><InlineAlert tone="success" title="Decision recorded">Both parties have been notified with the public summary. Audit event created with your officer ID and rationale.</InlineAlert></div>
        ) : (
          <div className="mt-3 space-y-3">
            <select className="input" value={decision} onChange={(e) => setDecision(e.target.value)} aria-label="Decision">
              <option value="">Select outcome…</option>
              <option>Resolved in favour of owner — partial deposit retained</option>
              <option>Resolved in favour of renter — full deposit released</option>
              <option>Split outcome</option>
              <option>Escalate / refer externally</option>
            </select>
            <textarea rows={4} className="input" value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Rationale (required). Shared with parties as the public decision summary." aria-label="Rationale" />
            <div className="flex gap-2">
              <button className="btn-primary" disabled={!decision || rationale.trim().length < 20 || checked.size < checklist.length} onClick={() => setRecorded(true)}>Record decision</button>
              <button className="btn-secondary">Request evidence</button>
            </div>
            {checked.size < checklist.length && <p className="text-xs text-muted">Complete the policy checklist before recording a decision.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
