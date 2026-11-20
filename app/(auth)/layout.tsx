import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)]">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(23,105,170,0.6),transparent_60%)]" />
        <div className="relative"><Logo tone="light" /></div>
        <div className="relative mt-auto max-w-md">
          <p className="text-3xl leading-tight font-bold">Verified people.<br />Protected rentals.</p>
          <p className="mt-4 text-slate-300">Join sound recordists, live engineers and producers across Lagos renting professional audio equipment with clear agreements and documented handovers.</p>
        </div>
      </div>
      <div className="flex flex-col bg-surface">
        <div className="flex items-center justify-between p-6 lg:hidden"><Logo /></div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="p-6 text-center text-xs text-muted">
          <Link href="/help#privacy" className="hover:underline">Privacy</Link> · <Link href="/help#terms" className="hover:underline">Terms</Link> · <Link href="/help" className="hover:underline">Support</Link>
        </p>
      </div>
    </div>
  );
}
