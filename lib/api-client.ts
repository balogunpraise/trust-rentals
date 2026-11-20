/**
 * TrustRent API client.
 *
 * - When NEXT_PUBLIC_TRUST_RENTALS_API_URL is set, every call goes to the external REST API
 *   at `${base}/api/v1/...` and unwraps the `{ data, meta }` envelope (spec section 8).
 * - When it is not set, calls resolve against the seeded mock data in lib/mock-data.ts.
 *
 * Pages and components should only talk to the backend through this module.
 */
import * as mock from "./mock-data";
import { estimatePrice, daysBetween } from "./pricing";
import type {
  ApiEnvelope,
  ApiError,
  AppNotification,
  AuditEvent,
  Category,
  Conversation,
  Dispute,
  Equipment,
  EquipmentFilters,
  Message,
  PublicUser,
  Rental,
  Report,
  Review,
  VerificationCase,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_TRUST_RENTALS_API_URL?.replace(/\/$/, "");
export const USING_MOCK = !BASE;

export class ApiRequestError extends Error {
  constructor(public code: string, message: string, public requestId?: string, public status?: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit & { idempotencyKey?: string }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) headers.set("Content-Type", "application/json");
  if (init?.idempotencyKey) headers.set("Idempotency-Key", init.idempotencyKey);
  const res = await fetch(`${BASE}/api/v1${path}`, { ...init, headers, credentials: "include" });
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | ApiError | null;
  if (!res.ok || !json || "error" in json) {
    const err = json && "error" in json ? json.error : { code: "NETWORK_ERROR", message: `Request failed (${res.status})` };
    throw new ApiRequestError(err.code, err.message, "requestId" in err ? err.requestId : undefined, res.status);
  }
  return json.data;
}

const qs = (params: Record<string, string | number | boolean | undefined>) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && v !== false && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
};

const clone = <T>(v: T): T => structuredClone(v);
const ok = <T>(v: T) => Promise.resolve(clone(v));
const mockRef = (prefix: string) => `${prefix}-2026-${String(Math.floor(100000 + Math.random() * 899999)).padStart(6, "0")}`;

// ---------- Catalog ----------

function filterEquipment(f: EquipmentFilters): Equipment[] {
  const q = f.q?.trim().toLowerCase();
  let list = mock.equipment.filter((e) => e.status === "active");
  if (q) list = list.filter((e) => `${e.title} ${e.brand} ${e.model} ${e.category} ${e.description}`.toLowerCase().includes(q));
  if (f.category) list = list.filter((e) => e.category === f.category);
  if (f.type && f.type !== "both") list = list.filter((e) => e.listingType === f.type || e.listingType === "both");
  if (f.condition) list = list.filter((e) => e.condition === f.condition);
  if (f.area) list = list.filter((e) => e.area === f.area);
  if (f.minPrice != null) list = list.filter((e) => e.dailyRateMinor >= f.minPrice! * 100);
  if (f.maxPrice != null) list = list.filter((e) => e.dailyRateMinor <= f.maxPrice! * 100);
  if (f.verifiedOnly) list = list.filter((e) => mock.users.find((u) => u.id === e.ownerId)?.verification.identity === "verified");
  switch (f.sort) {
    case "price_asc": list = [...list].sort((a, b) => a.dailyRateMinor - b.dailyRateMinor); break;
    case "price_desc": list = [...list].sort((a, b) => b.dailyRateMinor - a.dailyRateMinor); break;
    case "newest": list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
  }
  return list;
}

export const api = {
  categories: {
    list: (): Promise<Category[]> => (BASE ? request("/categories") : ok(mock.categories)),
  },

  equipment: {
    list: (filters: EquipmentFilters = {}): Promise<Equipment[]> =>
      BASE ? request(`/equipment${qs(filters as Record<string, string>)}`) : ok(filterEquipment(filters)),
    get: (id: string): Promise<Equipment | null> =>
      BASE ? request(`/equipment/${id}`) : ok(mock.equipment.find((e) => e.id === id) ?? null),
    mine: (): Promise<Equipment[]> =>
      BASE ? request(`/users/me/equipment`) : ok(mock.equipment.filter((e) => e.ownerId === mock.CURRENT_USER_ID)),
    byOwner: (ownerId: string): Promise<Equipment[]> =>
      BASE
        ? request(`/equipment${qs({ ownerId })}`)
        : ok(mock.equipment.filter((e) => e.ownerId === ownerId && e.status === "active")),
    create: (input: Partial<Equipment>): Promise<Equipment> =>
      BASE
        ? request(`/equipment`, { method: "POST", body: JSON.stringify(input) })
        : ok({ ...(mock.equipment[0] as Equipment), ...input, id: `eq-new-${Date.now()}`, ownerId: mock.CURRENT_USER_ID, status: "pending_review" } as Equipment),
    report: (id: string, body: { reason: string; description: string }): Promise<Report> =>
      BASE
        ? request(`/reports/equipment`, { method: "POST", body: JSON.stringify({ equipmentId: id, ...body }) })
        : ok({ id: `rp-${Date.now()}`, reference: mockRef("RPT"), targetType: "listing", targetId: id, reason: body.reason as Report["reason"], status: "open", createdAt: new Date().toISOString() }),
  },

  users: {
    me: (): Promise<PublicUser> => (BASE ? request(`/users/me`) : ok(mock.users.find((u) => u.id === mock.CURRENT_USER_ID)!)),
    get: (id: string): Promise<PublicUser | null> =>
      BASE ? request(`/users/${id}/public`) : ok(mock.users.find((u) => u.id === id) ?? null),
    all: (): Promise<PublicUser[]> => (BASE ? request(`/admin/users`) : ok(mock.users)),
    reviews: (id: string): Promise<Review[]> =>
      BASE ? request(`/users/${id}/reviews`) : ok(mock.reviews.filter((r) => r.revieweeId === id)),
  },

  rentals: {
    list: (): Promise<Rental[]> =>
      BASE
        ? request(`/rentals`)
        : ok(mock.rentals.filter((r) => r.ownerId === mock.CURRENT_USER_ID || r.renterId === mock.CURRENT_USER_ID)),
    all: (): Promise<Rental[]> => (BASE ? request(`/admin/rentals`) : ok(mock.rentals)),
    get: (id: string): Promise<Rental | null> => (BASE ? request(`/rentals/${id}`) : ok(mock.rentals.find((r) => r.id === id) ?? null)),
    create: async (input: { equipmentId: string; startDate: string; endDate: string }): Promise<Rental> => {
      if (BASE) return request(`/rentals`, { method: "POST", body: JSON.stringify(input) });
      const eq = mock.equipment.find((e) => e.id === input.equipmentId)!;
      const now = new Date().toISOString();
      return {
        id: "r-new",
        reference: mockRef("TR"),
        equipmentId: eq.id,
        ownerId: eq.ownerId,
        renterId: mock.CURRENT_USER_ID,
        startDate: input.startDate,
        endDate: input.endDate,
        state: "REQUESTED",
        price: estimatePrice(eq, daysBetween(input.startDate, input.endDate)),
        agreement: { version: 1, contentHash: "sha256:pending…" },
        payment: { status: "CREATED" },
        history: [{ state: "REQUESTED", at: now, by: mock.CURRENT_USER_ID }],
        createdAt: now,
      };
    },
    /** Generic transition request — server validates role + state. */
    transition: (id: string, action: "accept" | "decline" | "cancel" | "agreement/accept" | "handover" | "return" | "inspect", body?: object) =>
      BASE ? request<Rental>(`/rentals/${id}/${action}`, { method: "POST", body: JSON.stringify(body ?? {}) }) : ok({ ok: true } as unknown as Rental),
    createPaymentIntent: (id: string, idempotencyKey: string): Promise<{ checkoutUrl: string; providerReference: string }> =>
      BASE
        ? request(`/rentals/${id}/payment-intents`, { method: "POST", idempotencyKey })
        : ok({ checkoutUrl: "#sandbox-checkout", providerReference: `PSP-SBX-${idempotencyKey.slice(0, 6).toUpperCase()}` }),
    openDispute: (id: string, body: { reason: string; description: string }): Promise<Dispute> =>
      BASE
        ? request(`/rentals/${id}/disputes`, { method: "POST", body: JSON.stringify(body) })
        : ok({ ...mock.disputes[0], id: "d-new", reference: mockRef("DSP"), rentalId: id, state: "OPENED", evidence: [], reason: body.reason as Dispute["reason"], description: body.description }),
    review: (rentalId: string, body: Omit<Review, "id" | "rentalId" | "reviewerId" | "revieweeId" | "createdAt">) =>
      BASE ? request(`/transactions/${rentalId}/reviews`, { method: "POST", body: JSON.stringify(body) }) : ok({ ok: true }),
  },

  disputes: {
    get: (id: string): Promise<Dispute | null> => (BASE ? request(`/disputes/${id}`) : ok(mock.disputes.find((d) => d.id === id) ?? null)),
    all: (): Promise<Dispute[]> => (BASE ? request(`/admin/disputes`) : ok(mock.disputes)),
  },

  messaging: {
    conversations: (): Promise<Conversation[]> => (BASE ? request(`/conversations`) : ok(mock.conversations)),
    messages: (conversationId: string): Promise<Message[]> =>
      BASE ? request(`/conversations/${conversationId}/messages`) : ok(mock.messages.filter((m) => m.conversationId === conversationId)),
    send: (conversationId: string, body: string): Promise<Message> =>
      BASE
        ? request(`/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ body }) })
        : ok({ id: `m-${Date.now()}`, conversationId, senderId: mock.CURRENT_USER_ID, body, createdAt: new Date().toISOString() }),
  },

  notifications: {
    list: (): Promise<AppNotification[]> => (BASE ? request(`/notifications`) : ok(mock.notifications)),
  },

  auth: {
    register: (body: { fullName: string; email: string; phone: string; password: string }) =>
      BASE ? request(`/auth/register`, { method: "POST", body: JSON.stringify(body) }) : ok({ ok: true }),
    login: (body: { identifier: string; password: string }) =>
      BASE ? request(`/auth/login`, { method: "POST", body: JSON.stringify(body) }) : ok({ ok: true }),
    verifyOtp: (code: string) =>
      BASE
        ? request(`/auth/otp/verify`, { method: "POST", body: JSON.stringify({ code }) })
        : code === "000000"
          ? Promise.reject(new ApiRequestError("OTP_INVALID", "That code is incorrect. You have 2 attempts left."))
          : ok({ ok: true }),
  },

  identity: {
    startSession: () =>
      BASE ? request<{ redirectUrl: string }>(`/identity/sessions`, { method: "POST" }) : ok({ redirectUrl: "/verify?step=identity-return" }),
    status: () => (BASE ? request<{ status: string; reference?: string }>(`/identity/status`) : ok({ status: "verified", reference: "NIA-SBX-12AB" })),
  },

  admin: {
    overview: () =>
      BASE
        ? request<Record<string, number>>(`/admin/overview`)
        : ok({ verifiedUsers: 1248, activeRentals: 63, overdueRentals: 4, openDisputes: 7, reportedListings: 12, failedPayments: 3 }),
    audit: (): Promise<AuditEvent[]> => (BASE ? request(`/admin/audit`) : ok(mock.auditEvents)),
    reports: (): Promise<Report[]> => (BASE ? request(`/admin/reports`) : ok(mock.reports)),
    verificationCases: (): Promise<VerificationCase[]> => (BASE ? request(`/admin/verification`) : ok(mock.verificationCases)),
    listings: (): Promise<Equipment[]> => (BASE ? request(`/admin/equipment`) : ok(mock.equipment)),
  },
};

/** Synchronous lookups for client components rendering mock relations. */
export const lookup = {
  user: (id: string) => mock.users.find((u) => u.id === id),
  equipment: (id: string) => mock.equipment.find((e) => e.id === id),
  category: (slug: string) => mock.categories.find((c) => c.slug === slug),
};

export const CURRENT_USER_ID = mock.CURRENT_USER_ID;
