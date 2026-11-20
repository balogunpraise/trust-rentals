/**
 * Shared contracts for TrustRent web.
 * These mirror the API envelope + entities described in the spec (section 7/8).
 * When the external API is wired up, its responses must conform to these types.
 */

export type ApiEnvelope<T> = { data: T; meta?: { requestId?: string; total?: number; page?: number } };
export type ApiError = { error: { code: string; message: string; requestId?: string } };

export type IdentityStatus = "unverified" | "pending" | "verified" | "failed" | "manual_review";

export type Verification = {
  phone: boolean;
  identity: IdentityStatus;
  professionalReviewed: boolean;
};

export type PublicUser = {
  id: string;
  displayName: string;
  initials: string;
  avatarUrl?: string;
  profession: string;
  city: string;
  area: string;
  bio?: string;
  memberSince: string; // ISO date
  verification: Verification;
  stats: {
    completedRentals: number;
    completedSales: number;
    onTimeReturns: number;
    lateReturns: number;
    rating: number | null;
    reviewCount: number;
    responseTime: string;
  };
};

export type CategorySlug =
  | "microphones"
  | "wireless"
  | "recorders-mixers"
  | "boom"
  | "ifb-comms"
  | "monitoring"
  | "pa"
  | "accessories";

export type Category = { slug: CategorySlug; name: string; description: string };

export type Condition = "new" | "excellent" | "good" | "fair";
export type ListingType = "rent" | "buy" | "both";
export type ListingStatus = "active" | "draft" | "paused" | "pending_review" | "archived" | "sold";

/** Money is always integer minor units (kobo) + currency code. */
export type Money = { amountMinor: number; currency: "NGN" };

export type Equipment = {
  id: string;
  ownerId: string;
  category: CategorySlug;
  brand: string;
  model: string;
  title: string;
  description: string;
  condition: Condition;
  conditionNotes?: string;
  accessories: string[];
  images: string[]; // URLs (signed in production); empty => placeholder art
  listingType: ListingType;
  status: ListingStatus;
  dailyRateMinor: number;
  weeklyRateMinor?: number;
  salePriceMinor?: number;
  depositMinor: number;
  currency: "NGN";
  city: string;
  area: string;
  serialRegistered: boolean;
  serialMasked?: string; // e.g. "•••• 4821" — never the full serial
  ownershipEvidence: "none" | "submitted" | "reviewed";
  blockedDates: string[]; // ISO yyyy-mm-dd
  createdAt: string;
  views: number;
  requests: number;
  instantBook?: boolean;
};

export type RentalState =
  | "REQUESTED"
  | "ACCEPTED"
  | "AGREEMENT_PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "HANDOVER_PENDING"
  | "ACTIVE"
  | "RETURN_PENDING"
  | "INSPECTION_PENDING"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED"
  | "EXPIRED"
  | "DISPUTED";

export type PaymentStatus =
  | "CREATED"
  | "PENDING_PROVIDER"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export type PriceBreakdown = {
  days: number;
  rentalFeeMinor: number;
  platformFeeMinor: number;
  depositMinor: number;
  otherFeesMinor: number;
  totalMinor: number;
  currency: "NGN";
};

export type RentalEvent = { state: RentalState; at: string; by?: string; note?: string };

export type Rental = {
  id: string;
  reference: string; // TR-2026-000123
  equipmentId: string;
  ownerId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  state: RentalState;
  overdue?: boolean;
  price: PriceBreakdown; // snapshot at request time
  agreement: {
    version: number;
    contentHash: string;
    ownerAcceptedAt?: string;
    renterAcceptedAt?: string;
  };
  payment: { status: PaymentStatus; providerReference?: string; provider?: string };
  history: RentalEvent[];
  disputeId?: string;
  createdAt: string;
  expiresAt?: string;
};

export type DisputeState =
  | "OPENED"
  | "EVIDENCE_REQUESTED"
  | "UNDER_REVIEW"
  | "DECISION_RECORDED"
  | "RESOLVED"
  | "ESCALATED";

export type DisputeReason =
  | "non_return"
  | "damage"
  | "missing_accessory"
  | "late_return"
  | "payment_issue"
  | "misrepresentation"
  | "other";

export type EvidenceItem = {
  id: string;
  uploaderId: string;
  type: "photo" | "document";
  caption: string;
  capturedAt: string;
  uploadedAt: string;
  checksum: string;
};

export type Dispute = {
  id: string;
  reference: string;
  rentalId: string;
  openedBy: string;
  reason: DisputeReason;
  description: string;
  state: DisputeState;
  evidence: EvidenceItem[];
  decisionSummary?: string;
  createdAt: string;
  updatedAt: string;
  assignedOfficer?: string;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  equipmentId?: string;
  rentalId?: string;
  lastMessageAt: string;
  unread: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  system?: boolean;
};

export type Review = {
  id: string;
  rentalId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  communication: number;
  punctuality: number;
  accuracy: number;
  comment: string;
  createdAt: string;
};

export type NotificationGroup = "rentals" | "payments" | "account" | "disputes" | "marketplace";
export type AppNotification = {
  id: string;
  group: NotificationGroup;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
};

export type ReportReason =
  | "suspected_fraud"
  | "stolen_item"
  | "misleading"
  | "duplicate"
  | "prohibited"
  | "other";

export type Report = {
  id: string;
  reference: string;
  targetType: "listing" | "user";
  targetId: string;
  reason: ReportReason;
  status: "open" | "assigned" | "resolved" | "escalated";
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  at: string;
  requestId: string;
  reason?: string;
};

export type VerificationCase = {
  id: string;
  userId: string;
  provider: string;
  providerReference: string;
  status: IdentityStatus | "provider_unavailable";
  updatedAt: string;
};

export type EquipmentFilters = {
  q?: string;
  category?: CategorySlug;
  type?: ListingType;
  minPrice?: number; // naira (UI units)
  maxPrice?: number;
  verifiedOnly?: boolean;
  condition?: Condition;
  area?: string;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
};
