import Link from "next/link";
import { SignInForm } from "@/features/auth/sign-in-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 mb-8 text-muted">Sign in to manage your rentals and listings.</p>
      <SignInForm />
      <p className="mt-6 text-center text-sm text-muted">New to TrustRent? <Link href="/sign-up" className="font-semibold text-brand hover:underline">Create an account</Link></p>
    </>
  );
}
