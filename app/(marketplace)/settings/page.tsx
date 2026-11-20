import Link from "next/link";
import { BadgeCheck, Laptop, Mail, Phone, Smartphone } from "lucide-react";
import { Badge, InlineAlert, PageHeader } from "@/components/ui";
import { api } from "@/lib/api-client";
import { maskEmail, maskPhone } from "@/lib/format";

export const metadata = { title: "Verification & security" };

export default async function SettingsPage() {
  const me = await api.users.me();
  const sessions = [
    { icon: Laptop, device: "Chrome on macOS", where: "Lagos, NG", when: "Current session", current: true },
    { icon: Smartphone, device: "TrustRent iOS app", where: "Lagos, NG", when: "Active 2h ago" },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title="Verification & security" description="Manage what's verified on your account and how you sign in." />

      <section className="card p-6">
        <h2 className="font-semibold">Verification</h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          <li className="flex items-center justify-between py-3">
            <span className="flex items-center gap-3"><Phone className="size-4 text-muted" /> Phone {maskPhone("+2348031234567")}</span>
            <Badge tone="success">Verified</Badge>
          </li>
          <li className="flex items-center justify-between py-3">
            <span className="flex items-center gap-3"><Mail className="size-4 text-muted" /> Email {maskEmail("tunde.bakare@example.com")}</span>
            <Badge tone="success">Verified</Badge>
          </li>
          <li className="flex items-center justify-between py-3">
            <span className="flex items-center gap-3">
              <BadgeCheck className="size-4 text-muted" />
              <span>Identity <span className="block text-xs text-muted">Approved provider · ref NIA-SBX-12AB</span></span>
            </span>
            {me.verification.identity === "verified" ? <Badge tone="success">Verified</Badge> : <Link href="/verify?step=identity" className="btn-primary py-1.5">Verify now</Link>}
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted">We never display or store your NIN or provider tokens. Only the verification result and a reference are kept.</p>
      </section>

      <section className="card mt-6 p-6">
        <h2 className="font-semibold">Sign-in</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Password <span className="block text-xs text-muted">Last changed 3 months ago</span></span>
            <button className="btn-secondary py-1.5">Change</button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Two-step verification <span className="block text-xs text-muted">Authenticator app or SMS code</span></span>
            <button className="btn-secondary py-1.5">Set up</button>
          </div>
        </div>
        <div className="mt-4"><InlineAlert tone="info">Changing your phone number or password may require re-verification, and we&apos;ll notify you by email.</InlineAlert></div>
      </section>

      <section className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Active sessions</h2>
          <button className="btn-ghost py-1.5 text-danger">Sign out all devices</button>
        </div>
        <ul className="mt-3 divide-y divide-line text-sm">
          {sessions.map((s) => (
            <li key={s.device} className="flex items-center justify-between py-3">
              <span className="flex items-center gap-3"><s.icon className="size-5 text-muted" /><span>{s.device}<span className="block text-xs text-muted">{s.where} · {s.when}</span></span></span>
              {s.current ? <Badge tone="info">This device</Badge> : <button className="text-sm font-medium text-danger">Revoke</button>}
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-6 p-6">
        <h2 className="font-semibold">Recent security activity</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          <li>17 Nov, 21:14 — New sign-in from Chrome on macOS, Lagos</li>
          <li>02 Nov, 09:30 — Password changed</li>
          <li>04 Mar, 11:02 — Identity verified via approved provider</li>
        </ul>
      </section>
    </div>
  );
}
