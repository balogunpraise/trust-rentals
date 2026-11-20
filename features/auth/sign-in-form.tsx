"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const identifier = String(f.get("identifier") ?? "").trim();
        const password = String(f.get("password") ?? "");
        if (!identifier || !password) return setError("Enter your email or phone and password.");
        setBusy(true);
        setError(null);
        try {
          await api.auth.login({ identifier, password });
          router.push("/");
        } catch {
          // Generic message to avoid account enumeration.
          setError("Those details don't match an account. Check them and try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <label className="label" htmlFor="identifier">Email or phone</label>
        <input id="identifier" name="identifier" className="input" autoComplete="username" placeholder="you@example.com or +234…" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="password">Password</label>
          <Link href="/help" className="mb-1.5 text-xs font-medium text-brand hover:underline">Forgot password?</Link>
        </div>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" />
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <button className="btn-primary w-full py-3" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
