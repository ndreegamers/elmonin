export type RaffleStatus = "active" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "approved" | "rejected";
export type PaymentMethod = "yape" | "plin";

export interface Raffle {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  ticket_price: number;
  total_tickets: number;
  draw_date: string;
  status: RaffleStatus;
  code_prefix: string;
  created_at: string;
}

export interface RaffleWithStats extends Raffle {
  tickets_sold: number;
  sold_percentage: number;
}

export interface Participant {
  id: string;
  dni: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  raffle_id: string;
  participant_id: string;
  tickets_paid: number;
  tickets_bonus: number;
  total_tickets: number;
  total_amount: number;
  payment_method: PaymentMethod;
  receipt_url: string;
  payment_status: PaymentStatus;
  created_at: string;
  reviewed_at: string | null;
}

export interface PurchaseWithDetails extends Purchase {
  participant: Participant;
  raffle: Pick<Raffle, "id" | "title" | "code_prefix" | "ticket_price">;
}

export interface Ticket {
  id: string;
  purchase_id: string;
  raffle_id: string;
  participant_id: string;
  ticket_number: number;
  ticket_code: string;
  created_at: string;
}

export interface TicketWithRaffle extends Ticket {
  raffle: Pick<Raffle, "id" | "title" | "draw_date" | "image_url">;
}

export interface VerifyResult {
  participant: Participant | null;
  tickets: TicketWithRaffle[];
  pending_purchases: number;
  rejected_purchases: number;
}

/* ── DTOs ── */

export interface CreatePurchaseDTO {
  raffle_id: string;
  dni: string;
  first_name: string;
  last_name: string;
  phone?: string;
  tickets_paid: number;
  payment_method: PaymentMethod;
}

export interface DniLookupResult {
  success: boolean;
  dni?: string;
  first_name?: string;
  last_name?: string;
  error?: string;
}
