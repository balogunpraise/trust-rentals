import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Flag, MapPin, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { EquipmentCard } from "@/components/equipment-card";
import { IdentityBadges } from "@/components/identity-badge";
import { Skeleton, Stars } from "@/components/ui";
import { api } from "@/lib/api-client";
import { formatDate, formatMonthYear } from "@/lib/format";

async function Profile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await api.users.get(id);
  if (!user) notFound();
  const [listings, reviews, all] = await Promise.all([api.equipment.byOwner(id), api.users.reviews(id), api.users.all()]);
  const byId = new Map(all.map((u) => [u.id, u]));
  const s = user.stats;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_1fr]">
      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <Avatar user={user} size="xl" />
        <h1 className="mt-4 text-2xl font-bold">{user.displayName}</h1>
        <p className="text-muted">{user.profession}</p>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted"><MapPin className="size-4" /> {user.area}, {user.city}</p>
        <p className="text-sm text-muted">Member since {formatMonthYear(user.memberSince)}</p>
        <div className="mt-4"><IdentityBadges verification={user.verification} /></div>
        {user.bio && <p className="mt-4 text-sm text-ink-soft">{user.bio}</p>}
        <div className="mt-6 flex gap-2">
          <Link href="/messages" className="btn-primary flex-1"><MessageSquare className="size-4" /> Message</Link>
          <Link href="/help?report=user" className="btn-secondary" aria-label="Report user"><Flag className="size-4" /></Link>
        </div>
      </aside>

      <div className="min-w-0">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Completed rentals", s.completedRentals, "Rentals that reached Completed on TrustRent"],
            ["Completed sales", s.completedSales, "Sales recorded on the platform"],
            ["On-time returns", s.onTimeReturns, "As renter, returned by the agreed time"],
            ["Late returns", s.lateReturns, "As renter, returned after the agreed time"],
          ].map(([label, value, def]) => (
            <div key={label as string} className="card p-4" title={def as string}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-bold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-muted">Counts come from completed on-platform transactions only. They describe past activity and are not a safety rating.</p>

        <section className="mt-10">
          <h2 className="mb-5 text-xl font-semibold">Active listings ({listings.length})</h2>
          {listings.length === 0 ? (
            <p className="text-sm text-muted">No active listings.</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((e) => <EquipmentCard key={e.id} item={e} />)}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="flex items-center gap-3 text-xl font-semibold">
            Reviews {s.rating && <Stars rating={s.rating} size="md" />} <span className="text-base font-normal text-muted">({reviews.length})</span>
          </h2>
          <ul className="mt-5 divide-y divide-line">
            {reviews.map((r) => {
              const reviewer = byId.get(r.reviewerId);
              return (
                <li key={r.id} className="flex gap-3 py-5">
                  {reviewer && <Avatar user={reviewer} size="md" />}
                  <div>
                    <p className="flex items-center gap-2 font-semibold">{reviewer?.displayName} <Stars rating={r.rating} /></p>
                    <p className="text-xs text-muted">{formatDate(r.createdAt)} · Linked to a completed rental</p>
                    <p className="mt-1.5 text-sm text-ink-soft">{r.comment}</p>
                    <p className="mt-2 flex gap-4 text-xs text-muted">
                      <span>Communication {r.communication}/5</span><span>Punctuality {r.punctuality}/5</span><span>Accuracy {r.accuracy}/5</span>
                    </p>
                  </div>
                </li>
              );
            })}
            {reviews.length === 0 && <li className="py-5 text-sm text-muted">No reviews yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default function UserPage({ params }: PageProps<"/users/[id]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Profile params={params} />
      </Suspense>
    </div>
  );
}
