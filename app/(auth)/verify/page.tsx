import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { VerifyFlow } from "@/features/auth/verify-flow";

export const metadata = { title: "Verify your account" };

const STEPS = ["otp", "profile", "identity", "handoff", "result"] as const;

async function Inner({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const step = STEPS.find((s) => s === sp.step) ?? "otp";
  return <VerifyFlow initialStep={step} phone={String(sp.phone ?? "+2348031234567")} />;
}

export default function VerifyPage({ searchParams }: PageProps<"/verify">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Inner searchParams={searchParams} />
    </Suspense>
  );
}
