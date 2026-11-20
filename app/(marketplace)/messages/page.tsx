import { MessageSquare } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";
import { Inbox, type InboxThread } from "@/features/messages/inbox";
import { api, CURRENT_USER_ID } from "@/lib/api-client";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const [convos, users, rentals, equipment, mine] = await Promise.all([
    api.messaging.conversations(),
    api.users.all(),
    api.rentals.list(),
    api.equipment.list(),
    api.equipment.mine(),
  ]);
  const eqMap = new Map([...equipment, ...mine].map((e) => [e.id, e]));
  const threads: InboxThread[] = await Promise.all(
    convos
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
      .map(async (c) => ({
        convo: c,
        other: users.find((u) => u.id === c.participantIds.find((p) => p !== CURRENT_USER_ID))!,
        equipment: c.equipmentId ? eqMap.get(c.equipmentId) : undefined,
        rental: rentals.find((r) => r.id === c.rentalId),
        messages: await api.messaging.messages(c.id),
      })),
  );
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader title="Messages" />
      {threads.length === 0 ? (
        <EmptyState icon={<MessageSquare className="size-6" />} title="No conversations yet" body="Message an owner from any listing to ask questions before you request." action={{ label: "Explore equipment", href: "/explore" }} />
      ) : (
        <Inbox threads={threads} me={CURRENT_USER_ID} />
      )}
    </div>
  );
}
