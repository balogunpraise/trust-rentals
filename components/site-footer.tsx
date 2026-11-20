import Link from "next/link";
import { Logo } from "./logo";

const cols = [
  { title: "Marketplace", links: [["Explore equipment", "/explore"], ["List your equipment", "/listings/new"], ["How it works", "/#how-it-works"], ["Saved listings", "/saved"]] },
  { title: "Trust & safety", links: [["Identity verification", "/verify"], ["Rental protection", "/#protection"], ["Report a listing", "/help"], ["Disputes", "/help#disputes"]] },
  { title: "Company", links: [["Help centre", "/help"], ["Privacy notice", "/help#privacy"], ["Terms", "/help#terms"], ["Admin", "/admin"]] },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink pb-24 text-slate-300 lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm text-slate-400">Verified people. Protected rentals. Professional audio equipment from verified owners across Lagos.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold text-white">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-slate-500 sm:px-6">
          © 2026 TrustRent (working name). TrustRent is not a bank, wallet, insurer or law-enforcement service. Payments are processed by a licensed payment provider; identity checks by an approved verification provider.
        </p>
      </div>
    </footer>
  );
}
