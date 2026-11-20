import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { RentalWorkspace } from "@/features/rentals/rental-workspace";
import { api, CURRENT_USER_ID } from "@/lib/api-client";

async function Inner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rental = await api.rentals.get(id);
  // Object-level authorization: only the two parties may view a rental.
  if (!rental || (rental.ownerId !== CURRENT_USER_ID && rental.renterId !== CURRENT_USER_ID)) notFound();
  const [equipment, owner, renter, dispute, conversations] = await Promise.all([
    api.equipment.get(rental.equipmentId),
    api.users.get(rental.ownerId),
    api.users.get(rental.renterId),
    rental.disputeId ? api.disputes.get(rental.disputeId) : Promise.resolve(null),
    api.messaging.conversations(),
  ]);
  if (!equipment || !owner || !renter) notFound();
  const convo = conversations.find((c) => c.rentalId === rental.id);
  const messages = convo ? await api.messaging.messages(convo.id) : [];
  return (
    <RentalWorkspace
      key={rental.id}
      initial={rental}
      equipment={equipment}
      owner={owner}
      renter={renter}
      currentUserId={CURRENT_USER_ID}
      initialDispute={dispute}
      initialMessages={messages}
      conversationId={convo?.id}
      now="2026-11-20T12:00:00Z"
    />
  );
}

export default function RentalPage({ params }: PageProps<"/rentals/[id]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Suspense fallback={<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]"><Skeleton className="h-[600px]" /><Skeleton className="h-[600px]" /></div>}>
        <Inner params={params} />
      </Suspense>
    </div>
  );
}
