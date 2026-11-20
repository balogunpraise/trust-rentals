import Link from "next/link";
import { SignUpForm } from "@/features/auth/sign-up-form";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 mb-8 text-muted">Rent, buy and sell equipment with confidence.</p>
      <SignUpForm />
      <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link href="/sign-in" className="font-semibold text-brand hover:underline">Sign in</Link></p>
    </>
  );
}
