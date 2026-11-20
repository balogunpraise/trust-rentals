import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BadgeCheck, ChevronRight, Flag, Info, MapPin, Package, ShieldCheck } from "lucide-react";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { GearImage } from "@/components/gear-image";
import { SaveButton } from "@/components/save-button";
import { UserSummary } from "@/components/user-summary";
import { Avatar } from "@/components/avatar";
import { Badge, Skeleton, Stars } from "@/components/ui";
import { BookingWidget } from "@/features/equipment/booking-widget";
import { api, CURRENT_USER_ID } from "@/lib/api-client";
import { formatDate } from "@/lib/format";

const conditionLabel = { new: "New", excellent: "Excellent", good: "Good", fair: "Fair" } as const;

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await api.equipment.get(id);
  if (!item || (item.status !== "active" && item.ownerId !== CURRENT_USER_ID)) notFound();
  const [owner, category, reviews, users] = await Promise.all([
    api.users.get(item.ownerId),
    api.categories.list().then((c) => c.find((x) => x.slug === item.category)),
    api.users.reviews(item.ownerId),
    api.users.all(),
  ]);
  const byId = new Map(users.map((u) => [u.id, u]));
  const isOwner = item.ownerId === CURRENT_USER_ID;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-sm text-muted">
        <Link href="/explore" className="hover:text-ink">Explore</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/explore?category=${item.category}`} className="hover:text-ink">{category?.name}</Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-ink">{item.brand} {item.model}</span>
      </nav>

      {/* Gallery */}
      <div className="grid gap-2 overflow-hidden rounded-[var(--radius-card)] md:h-[440px] md:grid-cols-4 md:grid-rows-2">
        <GearImage src={item.images[0]} category={item.category} alt={item.title} iconSize="size-24" className="aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto md:h-full" />
        {[1, 2, 3, 4].map((i) => (
          <GearImage key={i} src={item.images[i]} category={item.category} alt={`${item.title} photo ${i + 1}`} iconSize="size-10" className="hidden h-full md:grid" />
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge tone="info">{category?.name}</Badge>
                <Badge>Condition: {conditionLabel[item.condition]}</Badge>
                {item.listingType !== "rent" && <Badge tone="neutral">For sale</Badge>}
                {item.status !== "active" && <Badge tone="warning">{item.status.replace("_", " ")}</Badge>}
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{item.title}</h1>
              <p className="mt-1 flex items-center gap-1 text-muted"><MapPin className="size-4" /> {item.area}, {item.city} · exact pickup point shared after booking</p>
            </div>
            <div className="flex gap-2">
              <SaveButton equipmentId={item.id} variant="inline" />
              <Link href={`/equipment/${item.id}/report`} className="btn-ghost"><Flag className="size-4" /> Report</Link>
            </div>
          </div>

          <section className="mt-8 border-t border-line pt-8">
            <h2 className="text-lg font-semibold">About this equipment</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{item.description}</p>
            {item.conditionNotes && (
              <p className="mt-4 rounded-[var(--radius-control)] bg-canvas p-3 text-sm"><span className="font-semibold">Condition notes: </span>{item.conditionNotes}</p>
            )}
          </section>

          <section className="mt-8 border-t border-line pt-8">
            <h2 className="text-lg font-semibold">Included accessories</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {item.accessories.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm"><Package className="size-4 text-brand" /> {a}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Each accessory is confirmed on the handover checklist.</p>
          </section>

          <section className="mt-8 border-t border-line pt-8">
            <h2 className="text-lg font-semibold">Equipment checks</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {item.serialRegistered ? (
                <li className="flex items-center gap-2"><BadgeCheck className="size-4 text-success" /> Serial number registered ({item.serialMasked})</li>
              ) : (
                <li className="flex items-center gap-2 text-muted"><Info className="size-4" /> Serial number not registered</li>
              )}
              {item.ownershipEvidence === "reviewed" ? (
                <li className="flex items-center gap-2"><BadgeCheck className="size-4 text-success" /> Ownership evidence reviewed by TrustRent</li>
              ) : item.ownershipEvidence === "submitted" ? (
                <li className="flex items-center gap-2 text-warning"><Info className="size-4" /> Ownership evidence submitted, review pending</li>
              ) : (
                <li className="flex items-center gap-2 text-muted"><Info className="size-4" /> No ownership evidence submitted</li>
              )}
            </ul>
          </section>

          <section className="mt-8 border-t border-line pt-8">
            <h2 className="mb-4 text-lg font-semibold">Availability</h2>
            <AvailabilityCalendar blockedDates={item.blockedDates} />
          </section>

          {owner && (
            <section className="mt-8 border-t border-line pt-8">
              <div className="card p-5">
                <UserSummary user={owner} heading={item.listingType === "buy" ? "Seller" : "Owner"} />
                {owner.bio && <p className="mt-4 text-sm text-ink-soft">{owner.bio}</p>}
              </div>
            </section>
          )}

          <section className="mt-8 border-t border-line pt-8">
            <h2 className="text-lg font-semibold">
              Reviews of {owner?.displayName.split(" ")[0]} <span className="text-muted">({reviews.length})</span>
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No reviews yet. Reviews can only be left after a completed rental.</p>
            ) : (
              <ul className="mt-4 space-y-5">
                {reviews.map((r) => {
                  const reviewer = byId.get(r.reviewerId);
                  return (
                    <li key={r.id} className="flex gap-3">
                      {reviewer && <Avatar user={reviewer} size="sm" />}
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold">{reviewer?.displayName} <Stars rating={r.rating} /></p>
                        <p className="text-xs text-muted">{formatDate(r.createdAt)} · Verified rental</p>
                        <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside>
          <div className="sticky top-24 space-y-4">
            <BookingWidget item={item} isOwner={isOwner} />
            <div className="flex gap-3 rounded-[var(--radius-card)] bg-brand-soft p-4 text-sm">
              <ShieldCheck className="size-5 shrink-0 text-brand" />
              <p className="text-ink-soft">
                Agreement, payment and handover protections apply <strong>only</strong> to rentals booked and paid on TrustRent. Never pay outside the platform.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-[440px] w-full rounded-[var(--radius-card)]" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-24 w-full" /></div>
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}

export default function EquipmentPage({ params }: PageProps<"/equipment/[id]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Suspense fallback={<DetailSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}
