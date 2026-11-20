# TrustRent — web

Next.js marketplace for renting, buying and selling professional audio equipment in Lagos, built from the *TrustRent UI/UX + Technical Architecture v1.0* spec. Verified people. Protected rentals.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Data: mock now, external API later

All data access goes through `lib/api-client.ts`.

- **No env var set** → resolves against seeded synthetic data in `lib/mock-data.ts` (signed in as Tunde Bakare, `u1`).
- **`NEXT_PUBLIC_TRUST_RENTALS_API_URL` set** → calls `${URL}/api/v1/...`, unwraps the `{ data, meta }` envelope and throws `ApiRequestError` on `{ error }` (spec §8). Payment intents send an `Idempotency-Key` header.

Response shapes are defined in `lib/types.ts`; money is integer kobo (`amountMinor`) + currency.

## Screens (spec IDs)

| Route | Screens |
|---|---|
| `/` | S10 Home: search hero, categories, popular/recent, how it works, protection |
| `/explore` | S11/S12 search, filters (validated), removable chips, sort |
| `/equipment/[id]`, `/report` | S13 detail, availability calendar, booking widget · S16 report |
| `/users/[id]` | S14 public profile |
| `/saved` | S15 |
| `/listings`, `/listings/new` | S17 my equipment · S18–S20 8-step wizard |
| `/rentals/new` | S21/S22 cost summary + request |
| `/rentals/[id]` | S22–S31 full lifecycle workspace (decision → agreement → payment → handover → active → return/inspection → completion/review, disputes) |
| `/messages` | S32 · `/profile` S33 · `/settings` S34 · `/notifications` S35 · `/help` S36 |
| `/sign-in`, `/sign-up`, `/verify` | S03–S09 (OTP, profile, identity handoff/result) |
| `/admin/*` | A01–A08 operations console |

The rental workspace has a **Demo mode** toggle (view as renter/owner) and "simulate" links so the whole flow can be walked through on mock data. In production the server owns every state transition.

## Structure

```
app/(marketplace)  public + signed-in pages (header, footer, mobile bottom nav)
app/(auth)         sign-in / sign-up / verify
app/admin          operations console
components/        shared UI (IdentityBadges, EquipmentCard, PriceBreakdown, StatusTimeline, EvidenceUploader, ConfirmDialog, …)
features/          feature-scoped client components
lib/               api-client, types, mock-data, pricing, rental-state, format
```

Next.js 16 with Cache Components: pages read `params`/`searchParams` inside `<Suspense>`.
