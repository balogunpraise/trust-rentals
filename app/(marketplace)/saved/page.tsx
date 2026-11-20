import { Heart } from "lucide-react";
import { EquipmentCard } from "@/components/equipment-card";
import { EmptyState, InlineAlert, PageHeader } from "@/components/ui";
import { api } from "@/lib/api-client";

export const metadata = { title: "Saved listings" };

export default async function SavedPage() {
  const [all, users] = await Promise.all([api.equipment.list(), api.users.all()]);
  const owners = new Map(users.map((u) => [u.id, u]));
  const saved = all.filter((e) => ["eq-ewdp", "eq-sm7b", "eq-genelec"].includes(e.id));
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Saved listings" description="Your shortlist of equipment." />
      <div className="mb-6"><InlineAlert tone="info">Saving doesn&apos;t reserve equipment. Recheck dates on the listing before you plan a shoot.</InlineAlert></div>
      {saved.length === 0 ? (
        <EmptyState icon={<Heart className="size-6" />} title="Nothing saved yet" body="Tap the heart on any listing to keep it here." action={{ label: "Explore equipment", href: "/explore" }} />
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((e) => <EquipmentCard key={e.id} item={e} owner={owners.get(e.ownerId)} />)}
        </div>
      )}
    </div>
  );
}
