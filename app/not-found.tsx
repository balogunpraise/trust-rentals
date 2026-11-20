import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <Logo />
        <h1 className="mt-8 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted">This page doesn&apos;t exist, or you don&apos;t have access to it.</p>
        <Link href="/" className="btn-primary mt-6">Back to home</Link>
      </div>
    </div>
  );
}
