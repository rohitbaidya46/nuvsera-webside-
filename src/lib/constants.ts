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
  PROPOSAL_SENT: "Quoted",
  WON: "Won",
  LOST: "Lost",
};

export const APPLICATION_STATUSES = ["NEW", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"] as const;

export const CONSENT_VERSION = "2026-11";
export const CONSENT_COOKIE = "nv_consent";

/** The services seeded by default (content lives in the database and can be extended in the admin panel). */
export const SERVICE_SLUGS = [
  "custom-software-development",
  "blockchain-crypto-exchange-development",
  "smart-contracts-wallets",
  "cybersecurity",
  "fintech-platforms",
  "coin-listing",
  "coin-audit",
  "smart-contract-audit",
] as const;

/** Earlier service URLs (before the five-service structure), redirected permanently to their closest successor. */
export const LEGACY_SERVICE_REDIRECTS: Record<string, string> = {
  "software-development": "custom-software-development",
  "web-development": "custom-software-development",
  "mobile-app-development": "custom-software-development",
  "ai-integration": "custom-software-development",
  "data-analytics": "custom-software-development",
  "blockchain-solutions": "smart-contracts-wallets",
  "crypto-exchange-development": "blockchain-crypto-exchange-development",
  "cybersecurity-audit": "cybersecurity",
};

/** Blockchains offered on audit / listing request forms. */
export const AUDIT_CHAINS = ["Ethereum", "BNB Chain", "Polygon", "Arbitrum", "Base", "Avalanche C-Chain", "Tron (TRC-20)", "Solana", "Other"] as const;
/** Services whose request form asks for a contract address. */
export const CONTRACT_SERVICES = ["coin-audit", "smart-contract-audit", "coin-listing"];
