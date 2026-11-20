"use client";

import { Camera, Lock, RefreshCw, X } from "lucide-react";
import { useId, useState } from "react";

type Item = { id: string; name: string; caption: string; type: string; preview: string; progress: number; failed?: boolean; at: string };

const TYPES = ["Item overview", "Condition / existing damage", "Serial evidence (private)", "Accessories", "Packaging", "Other"];

/**
 * Collects evidence photos. In production each file goes to POST /evidence/upload-intents
 * for a signed upload URL; the server records uploader, timestamp and checksum.
 */
export function EvidenceUploader({ label = "Evidence photos", min = 0 }: { label?: string; min?: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const inputId = useId();

  function simulateUpload(id: string) {
    let p = 0;
    const tick = setInterval(() => {
      p += 20 + Math.random() * 25;
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, progress: Math.min(100, p) } : it)));
      if (p >= 100) clearInterval(tick);
    }, 180);
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/") || f.type === "application/pdf")
      .map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        caption: "",
        type: TYPES[0],
        preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
        progress: 0,
        at: new Date().toISOString(),
      }));
    setItems((prev) => [...prev, ...next]);
    next.forEach((n) => simulateUpload(n.id));
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="label">{label}</p>
        {min > 0 && <span className="text-xs text-muted">{items.length}/{min} minimum</span>}
      </div>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center rounded-[var(--radius-card)] border-2 border-dashed border-line-strong bg-canvas px-4 py-6 text-center transition hover:border-brand hover:bg-brand-soft/40"
      >
        <Camera className="size-6 text-brand" />
        <span className="mt-2 text-sm font-semibold">Take or upload photos</span>
        <span className="text-xs text-muted">JPG, PNG or PDF · up to 15MB each</span>
        <input id={inputId} type="file" accept="image/*,application/pdf" capture="environment" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
      </label>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
        <Lock className="size-3" /> Evidence is stored privately and only visible to the two parties and authorised dispute staff.
      </p>
      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex gap-3 rounded-[var(--radius-control)] border border-line bg-surface p-2.5">
              {it.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.preview} alt="" className="size-16 shrink-0 rounded-md object-cover" />
              ) : (
                <div className="grid size-16 shrink-0 place-items-center rounded-md bg-canvas text-xs text-muted">PDF</div>
              )}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Evidence type"
                    className="input py-1 text-xs"
                    value={it.type}
                    onChange={(e) => setItems((p) => p.map((x) => (x.id === it.id ? { ...x, type: e.target.value } : x)))}
                  >
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <button type="button" aria-label="Remove" className="btn-ghost p-1.5" onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))}>
                    <X className="size-4" />
                  </button>
                </div>
                <input
                  aria-label="Caption"
                  className="input py-1 text-xs"
                  placeholder="Caption (e.g. scratch on left side)"
                  value={it.caption}
                  onChange={(e) => setItems((p) => p.map((x) => (x.id === it.id ? { ...x, caption: e.target.value } : x)))}
                />
                {it.failed ? (
                  <button type="button" className="flex items-center gap-1 text-xs font-medium text-danger" onClick={() => simulateUpload(it.id)}>
                    <RefreshCw className="size-3" /> Upload failed — retry
                  </button>
                ) : (
                  <div className="h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(it.progress)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-brand transition-all" style={{ width: `${it.progress}%` }} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
