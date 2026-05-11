import { RaffleWithStats } from "@/lib/types";
import { RaffleHero } from "@/components/raffle-hero";
import { Trophy } from "lucide-react";

// Mock data for preview / development without Supabase
const MOCK_RAFFLE: RaffleWithStats = {
  id: "preview-raffle-001",
  title: "iPhone 16 Pro Max 256GB",
  description:
    "El smartphone más potente de Apple. Natural Titanium, 256GB. Incluye caja y accesorios originales. ¡Participa y llévate el flagship del año!",
  image_url:
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90",
  ticket_price: 5.0,
  total_tickets: 500,
  draw_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days from now
  status: "active",
  code_prefix: "ELM",
  created_at: new Date().toISOString(),
  tickets_sold: 337,
  sold_percentage: 67.4,
};

async function getActiveRaffle(): Promise<RaffleWithStats | null> {
  // Preview mode: use mock data (no Supabase needed)
  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "true") {
    return MOCK_RAFFLE;
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const { data: raffles, error } = await supabase
      .from("raffles")
      .select(`*, purchases(total_tickets, payment_status)`)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !raffles || raffles.length === 0) return null;

    const r = raffles[0];
    const approved = (r.purchases ?? []).filter(
      (p: { payment_status: string }) => p.payment_status === "approved"
    );
    const ticketsSold = approved.reduce(
      (sum: number, p: { total_tickets: number }) => sum + p.total_tickets,
      0
    );
    const soldPercentage =
      r.total_tickets > 0
        ? Math.min(100, Number(((ticketsSold / r.total_tickets) * 100).toFixed(1)))
        : 0;

    const { purchases: _p, ...raffle } = r;
    return { ...raffle, tickets_sold: ticketsSold, sold_percentage: soldPercentage };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const raffle = await getActiveRaffle();

  if (!raffle) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen hero-gradient px-4">
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4 max-w-md text-center">
          <Trophy className="w-12 h-12 text-[#00F0FF]" />
          <h1 className="font-orbitron text-2xl font-bold text-[#F1F5F9]">
            Próximamente
          </h1>
          <p className="text-[#94A3B8]">
            Estamos preparando el próximo sorteo. ¡Vuelve pronto!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      <RaffleHero raffle={raffle} />
    </main>
  );
}
