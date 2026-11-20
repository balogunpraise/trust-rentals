"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, CircleCheck, Clock, ExternalLink, EyeOff, Lock, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import clsx from "clsx";
import { InlineAlert } from "@/components/ui";
import { api } from "@/lib/api-client";
import { maskPhone } from "@/lib/format";

type Step = "otp" | "profile" | "identity" | "handoff" | "result";
const ORDER: Step[] = ["otp", "profile", "identity", "handoff", "result"];
const PROFESSIONS = ["Production sound mixer", "Sound recordist", "Boom operator", "Live sound engineer", "Post-production engineer", "Podcast producer", "Filmmaker", "Musician", "Event organiser", "Other"];

function Progress({ step }: { step: Step }) {
  const labels = ["Phone", "Profile", "Identity"];
  const i = Math.min(ORDER.indexOf(step), 2);
  return (
    <ol className="mb-8 flex gap-2" aria-label="Setup progress">
      {labels.map((l, j) => (
        <li key={l} className="flex-1">
          <div className={clsx("h-1.5 rounded-full", j <= i ? "bg-brand" : "bg-line")} />
          <span className={clsx("mt-1.5 block text-xs", j === i ? "font-semibold text-ink" : "text-muted")}>{l}</span>
        </li>
      ))}
    </ol>
  );
}

function Otp({ phone, onDone }: { phone: string; onDone: () => void }) {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(code = digits.join("")) {
    if (code.length !== 6) return setError("Enter the 6-digit code.");
    setBusy(true);
    setError(null);
    try {
      await api.auth.verifyOtp(code);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That code didn't work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Verify your phone</h1>
      <p className="mt-1 text-muted">We sent a 6-digit code to <span className="font-medium text-ink">{maskPhone(phone)}</span>.</p>
      <form className="mt-8" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <fieldset className="flex justify-between gap-2" aria-label="One-time code">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1}`}
              maxLength={1}
              aria-invalid={!!error}
              className="input h-14 w-12 text-center text-xl font-semibold"
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                const next = [...digits];
                next[i] = v.slice(-1);
                setDigits(next);
                if (v && i < 5) refs.current[i + 1]?.focus();
              }}
              onKeyDown={(e) => { if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }}
              onPaste={(e) => {
                const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                if (v.length === 6) {
                  e.preventDefault();
                  setDigits(v.split(""));
                  submit(v);
                }
              }}
            />
          ))}
        </fieldset>
        {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
        <button className="btn-primary mt-6 w-full py-3" disabled={busy}>{busy ? "Verifying…" : "Verify"}</button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <button className="font-medium text-brand disabled:text-muted" disabled={cooldown > 0} onClick={() => setCooldown(60)}>
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <Link href="/sign-up" className="font-medium text-brand">Change number</Link>
      </div>
      <p className="mt-6 text-xs text-muted">Demo: any 6 digits work except 000000, which simulates a wrong code.</p>
    </>
  );
}

function Profile({ onDone }: { onDone: () => void }) {
  const [profession, setProfession] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <h1 className="text-2xl font-bold">Set up your profile</h1>
      <p className="mt-1 text-muted">This is what other members see. You can change it later.</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!profession) return setError("Choose your profession.");
          onDone();
        }}
      >
        <div>
          <label className="label" htmlFor="photo">Profile photo <span className="font-normal text-muted">(optional)</span></label>
          <input id="photo" type="file" accept="image/*" className="block w-full text-sm file:mr-3 file:rounded-[var(--radius-control)] file:border-0 file:bg-brand-soft file:px-3 file:py-2 file:font-semibold file:text-brand" />
        </div>
        <div>
          <label className="label" htmlFor="profession">Profession</label>
          <select id="profession" className="input" value={profession} onChange={(e) => setProfession(e.target.value)} aria-invalid={!!error}>
            <option value="">Select…</option>
            {PROFESSIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="city">City</label>
            <input id="city" className="input" defaultValue="Lagos" />
          </div>
          <div>
            <label className="label" htmlFor="state">State</label>
            <input id="state" className="input" defaultValue="Lagos" />
          </div>
        </div>
        <p className="text-xs text-muted">We only show your city or area publicly — never your home address.</p>
        <div>
          <label className="label" htmlFor="bio">Short bio <span className="font-normal text-muted">(optional)</span></label>
          <textarea id="bio" rows={3} className="input" maxLength={280} />
        </div>
        <div className="flex gap-2">
          <button className="btn-primary flex-1 py-3">Continue</button>
          <button type="button" className="btn-ghost" onClick={onDone}>Skip for now</button>
        </div>
      </form>
    </>
  );
}

function IdentityIntro({ onStart }: { onStart: () => void }) {
  return (
    <>
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand"><ShieldCheck className="size-7" /></div>
      <h1 className="text-2xl font-bold">Verify your identity</h1>
      <p className="mt-2 text-muted">Identity verification helps other members know they&apos;re dealing with a real, verified person. It&apos;s required before you can rent or list equipment.</p>
      <ul className="mt-6 space-y-3 text-sm">
        <li className="flex gap-3"><EyeOff className="size-5 shrink-0 text-brand" /> <span><strong>Your government ID details are never shown publicly.</strong> Others only see &ldquo;Identity verified&rdquo;.</span></li>
        <li className="flex gap-3"><ExternalLink className="size-5 shrink-0 text-brand" /> <span>You&apos;ll complete the check with our approved verification provider in a secure window.</span></li>
        <li className="flex gap-3"><Lock className="size-5 shrink-0 text-brand" /> <span>We store only the result and a reference — not your NIN or provider tokens.</span></li>
      </ul>
      <div className="mt-6"><InlineAlert tone="info">Verification reduces risk but doesn&apos;t prevent all fraud. Always use the handover checklist.</InlineAlert></div>
      <label className="mt-6 flex items-start gap-2 text-sm">
        <input type="checkbox" defaultChecked className="mt-0.5 size-4 accent-brand" /> I consent to TrustRent requesting verification of my identity from the approved provider.
      </label>
      <button className="btn-primary mt-6 w-full py-3" onClick={onStart}>Start verification</button>
      <Link href="/" className="btn-ghost mt-2 w-full">Not now — browse only</Link>
      <p className="mt-2 text-center text-xs text-muted">Without verification you can browse and save listings, but can&apos;t request rentals or publish listings.</p>
    </>
  );
}

function Handoff({ onResult }: { onResult: (r: "verified" | "pending" | "failed") => void }) {
  const [phase, setPhase] = useState<"leaving" | "provider" | "checking">("leaving");
  useEffect(() => {
    const a = setTimeout(() => setPhase("provider"), 1200);
    return () => clearTimeout(a);
  }, []);
  return (
    <div className="text-center">
      <RefreshCw className={clsx("mx-auto size-10 text-brand", phase !== "provider" && "animate-spin")} />
      {phase === "leaving" && <><h1 className="mt-5 text-xl font-bold">Opening secure verification…</h1><p className="mt-2 text-sm text-muted">You&apos;re being handed to our approved identity provider. Keep this tab open.</p></>}
      {phase === "provider" && (
        <>
          <h1 className="mt-5 text-xl font-bold">Sandbox identity provider</h1>
          <p className="mt-2 text-sm text-muted">Demo: choose the outcome the provider returns. In production the backend validates the callback and exchanges tokens server-side.</p>
          <div className="mt-6 grid gap-2">
            <button className="btn-primary" onClick={() => { setPhase("checking"); setTimeout(() => onResult("verified"), 1200); }}>Complete successfully</button>
            <button className="btn-secondary" onClick={() => onResult("pending")}>Manual review needed</button>
            <button className="btn-secondary" onClick={() => onResult("failed")}>Could not verify</button>
          </div>
        </>
      )}
      {phase === "checking" && <><h1 className="mt-5 text-xl font-bold">Confirming result…</h1><p className="mt-2 text-sm text-muted">Waiting for TrustRent&apos;s servers to confirm the result with the provider.</p></>}
    </div>
  );
}

function Result({ result, onRetry }: { result: "verified" | "pending" | "failed"; onRetry: () => void }) {
  if (result === "verified")
    return (
      <div className="text-center">
        <CircleCheck className="mx-auto size-16 text-success" />
        <h1 className="mt-4 text-2xl font-bold">Identity verified</h1>
        <p className="mt-2 text-muted">Your profile now shows <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success"><BadgeCheck className="size-3" /> Identity verified</span>. Your ID details stay private.</p>
        <p className="mt-3 font-mono text-xs text-muted">Reference: NIA-SBX-12AB</p>
        <Link href="/" className="btn-primary mt-8 w-full py-3">Start exploring</Link>
      </div>
    );
  if (result === "pending")
    return (
      <div className="text-center">
        <Clock className="mx-auto size-16 text-warning" />
        <h1 className="mt-4 text-2xl font-bold">Verification pending</h1>
        <p className="mt-2 text-muted">The provider needs a bit more time to review. We&apos;ll notify you when there&apos;s a result.</p>
        <div className="mt-6 text-left"><InlineAlert tone="warning" title="Until then you can't">request rentals, publish listings, or accept rental requests. You can still browse, save and message.</InlineAlert></div>
        <Link href="/" className="btn-primary mt-8 w-full py-3">Continue browsing</Link>
      </div>
    );
  return (
    <div className="text-center">
      <XCircle className="mx-auto size-16 text-danger" />
      <h1 className="mt-4 text-2xl font-bold">We couldn&apos;t verify your identity</h1>
      <p className="mt-2 text-muted">The details couldn&apos;t be confirmed with the provider. This sometimes happens with typos or provider outages.</p>
      <button className="btn-primary mt-8 w-full py-3" onClick={onRetry}>Try again</button>
      <Link href="/help" className="btn-ghost mt-2 w-full">Contact support</Link>
    </div>
  );
}

export function VerifyFlow({ initialStep, phone }: { initialStep: Step; phone: string }) {
  const [step, setStep] = useState<Step>(initialStep);
  const [result, setResult] = useState<"verified" | "pending" | "failed">("verified");
  return (
    <>
      {step !== "result" && step !== "handoff" && <Progress step={step} />}
      {step === "otp" && <Otp phone={phone} onDone={() => setStep("profile")} />}
      {step === "profile" && <Profile onDone={() => setStep("identity")} />}
      {step === "identity" && <IdentityIntro onStart={async () => { await api.identity.startSession(); setStep("handoff"); }} />}
      {step === "handoff" && <Handoff onResult={(r) => { setResult(r); setStep("result"); }} />}
      {step === "result" && <Result result={result} onRetry={() => setStep("identity")} />}
    </>
  );
}
