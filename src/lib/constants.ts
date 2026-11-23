export const BUDGET_OPTIONS = [
  "Under ₹1 Lakh",
  "₹1 – 5 Lakh",
  "₹5 – 15 Lakh",
  "₹15 – 50 Lakh",
  "₹50 Lakh +",
  "Not sure yet",
] as const;

export const TIMELINE_OPTIONS = [
  "As soon as possible (under 1 month)",
  "1 – 3 months",
  "3 – 6 months",
  "6 months +",
  "Flexible",
] as const;

export const LEAD_STATUSES = ["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"] as const;
export const LEAD_STATUS_LABELS: Record<(typeof LEAD_STATUSES)[number], string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  PROPOSAL_SENT: "Proposal Sent",
  WON: "Won",
  LOST: "Lost",
};

export const APPLICATION_STATUSES = ["NEW", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"] as const;

export const CONSENT_VERSION = "2026-11";
export const CONSENT_COOKIE = "nv_consent";

/** Canonical list of the eight services (used for form validation; content lives in the database). */
export const SERVICE_SLUGS = [
  "software-development",
  "web-development",
  "mobile-app-development",
  "blockchain-solutions",
  "crypto-exchange-development",
  "ai-integration",
  "cybersecurity-audit",
  "data-analytics",
] as const;
