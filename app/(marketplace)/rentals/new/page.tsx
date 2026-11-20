import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader, Skeleton } from "@/components/ui";
import { RequestForm } from "@/features/rentals/request-form";
import { api } from "@/lib/api-client";

async function Inner({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const id = String(sp.equipment ?? "");
  const item = await api.equipment.get(id);
  if (!item) notFound();
  const owner = await api.users.get(item.ownerId);
  if (!owner) notFound();
  return <RequestForm item={item} owner={owner} initialStart={String(sp.start ?? "")} initialEnd={String(sp.end ?? "")} />;
}

export default function NewRentalPage({ searchParams }: PageProps<"/rentals/new">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="Rental request" title="Review dates and cost" description="Check everything before sending. The owner will review your verification facts and respond." />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Inner searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
