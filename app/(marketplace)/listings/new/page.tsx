import { PageHeader } from "@/components/ui";
import { ListingWizard } from "@/features/listings/listing-wizard";
import { api } from "@/lib/api-client";

export const metadata = { title: "List equipment" };

export default async function NewListingPage() {
  const categories = await api.categories.list();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader eyebrow="New listing" title="List your equipment" description="A complete, honest listing gets more requests and fewer disputes." />
      <ListingWizard categories={categories} />
    </div>
  );
}
