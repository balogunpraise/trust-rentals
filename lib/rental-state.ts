import type { DisputeState, Rental, RentalState } from "./types";

/** Happy-path order (spec 4.1). The server owns transitions; this is presentation only. */
export const RENTAL_FLOW: RentalState[] = [
  "REQUESTED",
  "ACCEPTED",
  "AGREEMENT_PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "HANDOVER_PENDING",
  "ACTIVE",
  "RETURN_PENDING",
  "INSPECTION_PENDING",
  "COMPLETED",
];

export const TIMELINE_STEPS: { label: string; states: RentalState[] }[] = [
  { label: "Requested", states: ["REQUESTED"] },
  { label: "Accepted", states: ["ACCEPTED"] },
  { label: "Agreement", states: ["AGREEMENT_PENDING"] },
  { label: "Payment", states: ["PAYMENT_PENDING", "PAID"] },
  { label: "Handover", states: ["HANDOVER_PENDING"] },
  { label: "Active", states: ["ACTIVE"] },
  { label: "Return", states: ["RETURN_PENDING", "INSPECTION_PENDING"] },
  { label: "Completed", states: ["COMPLETED"] },
];

export const TERMINAL: RentalState[] = ["DECLINED", "CANCELLED", "EXPIRED", "COMPLETED"];

export const STATE_LABEL: Record<RentalState, string> = {
  REQUESTED: "Awaiting owner",
  ACCEPTED: "Accepted",
  AGREEMENT_PENDING: "Agreement pending",
  PAYMENT_PENDING: "Payment pending",
  PAID: "Paid",
  HANDOVER_PENDING: "Handover pending",
  ACTIVE: "Active",
  RETURN_PENDING: "Return pending",
  INSPECTION_PENDING: "Inspection pending",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  DISPUTED: "In dispute",
};

export type Tone = "neutral" | "info" | "warning" | "success" | "danger";

export function stateTone(state: RentalState): Tone {
  if (state === "COMPLETED") return "success";
  if (state === "DISPUTED") return "danger";
  if (["DECLINED", "CANCELLED", "EXPIRED"].includes(state)) return "neutral";
  if (state === "ACTIVE" || state === "PAID") return "info";
  return "warning";
}

export function timelineIndex(state: RentalState) {
  return TIMELINE_STEPS.findIndex((s) => s.states.includes(state));
}

export const DISPUTE_FLOW: DisputeState[] = ["OPENED", "EVIDENCE_REQUESTED", "UNDER_REVIEW", "DECISION_RECORDED", "RESOLVED"];
export const DISPUTE_LABEL: Record<DisputeState, string> = {
  OPENED: "Opened",
  EVIDENCE_REQUESTED: "Evidence requested",
  UNDER_REVIEW: "Under review",
  DECISION_RECORDED: "Decision recorded",
  RESOLVED: "Resolved",
  ESCALATED: "Escalated",
};

/** What the current viewer needs to do next, by role. */
export function nextAction(rental: Rental, viewerId: string): { label: string; who: "you" | "other" | "none"; description: string } {
  const isOwner = rental.ownerId === viewerId;
  switch (rental.state) {
    case "REQUESTED":
      return isOwner
        ? { label: "Accept or decline", who: "you", description: "Review the renter's verification facts and dates, then respond before the request expires." }
        : { label: "Waiting for owner", who: "other", description: "The owner has 24 hours to respond. Dates are not reserved until accepted." };
    case "ACCEPTED":
    case "AGREEMENT_PENDING": {
      const mine = isOwner ? rental.agreement.ownerAcceptedAt : rental.agreement.renterAcceptedAt;
      return mine
        ? { label: "Waiting for the other party", who: "other", description: "You've accepted the agreement. The other party must accept the same version." }
        : { label: "Review & accept agreement", who: "you", description: "Both parties accept the same agreement version before payment." };
    }
    case "PAYMENT_PENDING":
      return isOwner
        ? { label: "Waiting for payment", who: "other", description: "The renter is completing checkout with the payment provider." }
        : { label: "Pay securely", who: "you", description: "Payment is handled by a licensed provider. We confirm it only after the provider verifies it." };
    case "PAID":
    case "HANDOVER_PENDING":
      return { label: "Complete handover checklist", who: "you", description: "Photograph the item and accessories. Both parties confirm before the rental becomes active." };
    case "ACTIVE":
      return isOwner
        ? { label: "Rental in progress", who: "other", description: "The renter has the equipment. You'll be prompted to inspect on return." }
        : { label: "Start return", who: "you", description: "Document return condition with photos and confirm the accessories." };
    case "RETURN_PENDING":
    case "INSPECTION_PENDING":
      return isOwner
        ? { label: "Inspect & confirm return", who: "you", description: "Confirm the condition matches handover, or open a dispute." }
        : { label: "Waiting for owner inspection", who: "other", description: "The owner is checking the returned equipment." };
    case "COMPLETED":
      return { label: "Leave a review", who: "you", description: "Reviews are linked to this completed transaction." };
    case "DISPUTED":
      return { label: "View dispute", who: "you", description: "Normal progression is paused while the dispute is reviewed." };
    default:
      return { label: "No action needed", who: "none", description: "This rental is closed." };
  }
}
