import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata = { title: "Admin sign-in" };

export default function AdminSignIn() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-surface p-8">
        <Logo href="/admin/sign-in" />
        <h1 className="mt-6 text-xl font-bold">Operations console</h1>
        <p className="text-sm text-muted">Authorised staff only. No public sign-up.</p>
        <form className="mt-6 space-y-4">
          <div><label className="label" htmlFor="ae">Staff email</label><input id="ae" type="email" className="input" autoComplete="username" /></div>
          <div><label className="label" htmlFor="ap">Password</label><input id="ap" type="password" className="input" autoComplete="current-password" /></div>
          <div><label className="label" htmlFor="am">Authenticator code</label><input id="am" inputMode="numeric" maxLength={6} className="input" autoComplete="one-time-code" /></div>
          <Link href="/admin" className="btn-primary w-full">Sign in</Link>
        </form>
        <p className="mt-6 flex gap-2 text-xs text-muted"><ShieldAlert className="size-4 shrink-0" /> All sign-in attempts, successful or failed, are logged. Privileged sessions expire after 30 minutes.</p>
      </div>
    </div>
  );
}
