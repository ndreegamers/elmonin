/* ── Promo tiers ── */
export interface PromoTier {
  minTickets: number;
  bonusTickets: number;
  label: string;
  badge: string;
  color: string;
}

export const PROMO_TIERS: PromoTier[] = [
  {
    minTickets: 10,
    bonusTickets: 3,
    label: "Lleva 10, obtén 3 GRATIS",
    badge: "+3 GRATIS",
    color: "#FF3E9A",
  },
  {
    minTickets: 5,
    bonusTickets: 1,
    label: "Lleva 5, obtén 1 GRATIS",
    badge: "+1 GRATIS",
    color: "#8B5CF6",
  },
];

export function calculateBonus(ticketsPaid: number): number {
  for (const tier of PROMO_TIERS) {
    if (ticketsPaid >= tier.minTickets) return tier.bonusTickets;
  }
  return 0;
}

export function getActivePromo(ticketsPaid: number): PromoTier | null {
  return PROMO_TIERS.find((t) => ticketsPaid >= t.minTickets) ?? null;
}

/* ── Quick pick options ── */
export const QUICK_PICKS = [1, 2, 3, 5, 10];

/* ── Gaming ticket code ── */
export function generateTicketCode(
  prefix: string,
  ticketNumber: number,
  ticketId: string
): string {
  const paddedNumber = ticketNumber.toString().padStart(4, "0");
  // Use characters 0-2 of the UUID (after removing hyphens), uppercased
  const hash = ticketId.replace(/-/g, "").slice(0, 3).toUpperCase();
  return `${prefix.toUpperCase()}-${paddedNumber}-${hash}`;
}

/* ── FOMO thresholds ── */
export const FOMO_URGENT_THRESHOLD = 30; // % remaining triggers urgency message
export const FOMO_HOT_THRESHOLD = 80;   // % sold triggers hot animation

/* ── Max receipt size (bytes) before client-side compression ── */
export const MAX_RECEIPT_SIZE = 2 * 1024 * 1024; // 2 MB
export const TARGET_RECEIPT_WIDTH = 1200;
export const TARGET_RECEIPT_QUALITY = 0.75;
