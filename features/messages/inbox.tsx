"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Flag, ImagePlus, Send } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "@/components/avatar";
import { IdentityBadges } from "@/components/identity-badge";
import { Badge } from "@/components/ui";
import { api } from "@/lib/api-client";
import { formatDateTime, relativeTime } from "@/lib/format";
import { STATE_LABEL, stateTone } from "@/lib/rental-state";
import type { Conversation, Equipment, Message, PublicUser, Rental } from "@/lib/types";

export type InboxThread = { convo: Conversation; other: PublicUser; equipment?: Equipment; rental?: Rental; messages: Message[] };

export function Inbox({ threads, me }: { threads: InboxThread[]; me: string }) {
  const [activeId, setActiveId] = useState<string | null>(threads[0]?.convo.id ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [state, setState] = useState(() => Object.fromEntries(threads.map((t) => [t.convo.id, t.messages])));
  const [read, setRead] = useState<Set<string>>(new Set());
  const [text, setText] = useState("");
  const active = threads.find((t) => t.convo.id === activeId);

  return (
    <div className="card grid h-[calc(100dvh-12rem)] min-h-[520px] overflow-hidden md:grid-cols-[320px_1fr]">
      <ul className={clsx("overflow-y-auto border-r border-line", mobileOpen && "hidden md:block")}>
        {threads.map((t) => {
          const last = state[t.convo.id]?.at(-1);
          const unread = read.has(t.convo.id) ? 0 : t.convo.unread;
          return (
            <li key={t.convo.id}>
              <button
                onClick={() => { setActiveId(t.convo.id); setMobileOpen(true); setRead((r) => new Set(r).add(t.convo.id)); }}
                className={clsx("flex w-full gap-3 border-b border-line p-4 text-left hover:bg-canvas", t.convo.id === activeId && "bg-brand-soft/50")}
              >
                <Avatar user={t.other} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={clsx("truncate text-sm", unread ? "font-bold" : "font-semibold")}>{t.other.displayName}</span>
                    <span className="shrink-0 text-xs text-muted">{last && relativeTime(last.createdAt)}</span>
                  </span>
                  <span className="block truncate text-xs text-muted">{t.rental ? t.rental.reference : "Enquiry"} · {t.equipment?.brand} {t.equipment?.model}</span>
                  <span className={clsx("mt-0.5 block truncate text-sm", unread ? "text-ink" : "text-muted")}>{last?.body}</span>
                </span>
                {unread > 0 && <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">{unread}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {active ? (
        <div className={clsx("flex min-h-0 flex-col", !mobileOpen && "hidden md:flex")}>
          <div className="flex items-center gap-3 border-b border-line p-4">
            <button className="btn-ghost p-1.5 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Back"><ChevronLeft className="size-5" /></button>
            <Avatar user={active.other} />
            <div className="min-w-0 flex-1">
              <Link href={`/users/${active.other.id}`} className="font-semibold hover:underline">{active.other.displayName}</Link>
              <IdentityBadges verification={active.other.verification} compact />
            </div>
            <button className="btn-ghost p-2" aria-label="Report or block"><Flag className="size-4" /></button>
          </div>
          {active.rental && (
            <Link href={`/rentals/${active.rental.id}`} className="flex items-center justify-between gap-2 border-b border-line bg-canvas px-4 py-2 text-sm hover:bg-brand-soft/40">
              <span className="truncate"><span className="font-mono text-xs">{active.rental.reference}</span> · {active.equipment?.brand} {active.equipment?.model}</span>
              <Badge tone={stateTone(active.rental.state)}>{STATE_LABEL[active.rental.state]}</Badge>
            </Link>
          )}
          {!active.rental && active.equipment && (
            <Link href={`/equipment/${active.equipment.id}`} className="border-b border-line bg-canvas px-4 py-2 text-sm hover:bg-brand-soft/40">
              About: <span className="font-medium">{active.equipment.title}</span>
            </Link>
          )}
          <ul className="flex-1 space-y-3 overflow-y-auto p-4">
            {state[active.convo.id].map((m) =>
              m.system ? (
                <li key={m.id} className="text-center text-xs text-muted">{m.body}</li>
              ) : (
                <li key={m.id} className={clsx("flex", m.senderId === me && "justify-end")}>
                  <div className={clsx("max-w-[78%] rounded-2xl px-3.5 py-2 text-sm", m.senderId === me ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm bg-canvas")}>
                    {m.body}
                    <span className={clsx("mt-0.5 block text-[10px]", m.senderId === me ? "text-sky-100" : "text-muted")}>{formatDateTime(m.createdAt)}</span>
                  </div>
                </li>
              ),
            )}
          </ul>
          <form
            className="flex items-center gap-2 border-t border-line p-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!text.trim()) return;
              const m = await api.messaging.send(active.convo.id, text.trim());
              setState((s) => ({ ...s, [active.convo.id]: [...s[active.convo.id], m] }));
              setText("");
            }}
          >
            <label className="btn-ghost cursor-pointer p-2" aria-label="Attach image">
              <ImagePlus className="size-5" />
              <input type="file" accept="image/*" className="sr-only" />
            </label>
            <input aria-label="Message" className="input" placeholder="Write a message…" value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} />
            <button className="btn-primary px-3" aria-label="Send"><Send className="size-4" /></button>
          </form>
          <p className="px-4 pb-3 text-[11px] text-muted">Keep payments and contact details on TrustRent. Rental messages are retained with the transaction record.</p>
        </div>
      ) : (
        <div className="hidden place-items-center text-sm text-muted md:grid">Select a conversation</div>
      )}
    </div>
  );
}
