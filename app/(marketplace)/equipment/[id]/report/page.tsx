import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader, Skeleton } from "@/components/ui";
import { ReportForm } from "@/features/reports/report-form";
import { api } from "@/lib/api-client";

async function Inner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await api.equipment.get(id);
  if (!item) notFound();
  return <ReportForm equipmentId={item.id} title={item.title} />;
}

export default function ReportListingPage({ params }: PageProps<"/equipment/[id]/report">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <PageHeader title="Report listing" description="Help us keep the marketplace honest. Reports are confidential." />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Inner params={params} />
      </Suspense>
    </div>
  );
}
