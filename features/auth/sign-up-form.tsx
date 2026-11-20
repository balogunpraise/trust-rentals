"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";

type Errors = Partial<Record<"fullName" | "email" | "phone" | "password" | "terms" | "form", string>>;

export function SignUpForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const fullName = String(f.get("fullName") ?? "").trim();
        const email = String(f.get("email") ?? "").trim();
        const rawPhone = String(f.get("phone") ?? "").replace(/\D/g, "");
        const password = String(f.get("password") ?? "");
        const err: Errors = {};
        if (!fullName) err.fullName = "Enter your full name.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = "Enter a valid email address.";
        const local = rawPhone.replace(/^234/, "").replace(/^0/, "");
        if (local.length !== 10) err.phone = "Enter a valid Nigerian mobile number.";
        if (password.length < 10 || !/\d/.test(password) || !/[A-Za-z]/.test(password)) err.password = "Use at least 10 characters with letters and numbers.";
        if (!f.get("terms")) err.terms = "Please accept the Terms and Privacy notice.";
        setErrors(err);
        if (Object.keys(err).length) return;
        setBusy(true);
        try {
          await api.auth.register({ fullName, email, phone: `+234${local}`, password });
          router.push(`/verify?phone=${encodeURIComponent(`+234${local}`)}`);
        } catch {
          setErrors({ form: "We couldn't create your account. If you already have one, sign in instead." });
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <label className="label" htmlFor="fullName">Full name</label>
        <input id="fullName" name="fullName" className="input" autoComplete="name" aria-invalid={!!errors.fullName} />
        {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName}</p>}
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" aria-invalid={!!errors.email} />
        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-[var(--radius-control)] border border-r-0 border-line-strong bg-canvas px-3 text-sm text-muted">🇳🇬 +234</span>
          <input id="phone" name="phone" type="tel" inputMode="tel" className="input rounded-l-none" placeholder="803 123 4567" autoComplete="tel-national" aria-invalid={!!errors.phone} />
        </div>
        {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone}</p>}
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" autoComplete="new-password" aria-invalid={!!errors.password} aria-describedby="pw-help" />
        <p id="pw-help" className={`mt-1 text-xs ${errors.password ? "text-danger" : "text-muted"}`}>{errors.password ?? "At least 10 characters, with letters and numbers."}</p>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="terms" className="mt-0.5 size-4 accent-brand" />
        <span>I agree to the <a href="/help#terms" className="text-brand underline">Terms</a> and have read the <a href="/help#privacy" className="text-brand underline">Privacy notice</a>.</span>
      </label>
      {errors.terms && <p className="text-xs text-danger">{errors.terms}</p>}
      {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
      <button className="btn-primary w-full py-3" disabled={busy}>{busy ? "Creating account…" : "Continue"}</button>
    </form>
  );
}
