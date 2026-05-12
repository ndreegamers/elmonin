export const dynamic = "force-dynamic";

import { RaffleWithStats } from "@/lib/types";
import { RaffleHero } from "@/components/raffle-hero";
import { Trophy } from "lucide-react";

const MOCK_RAFFLES: RaffleWithStats[] = [
  {
    id: "preview-raffle-001",
    title: "iPhone 16 Pro Max 256GB",
    description:
      "El smartphone más potente de Apple. Natural Titanium, 256GB. Incluye caja y accesorios originales. ¡Participa y llévate el flagship del año!",
    image_url:
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90",
    ticket_price: 5.0,
    total_tickets: 500,
    draw_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    code_prefix: "ELM",
    created_at: new Date().toISOString(),
    tickets_sold: 337,
    sold_percentage: 67.4,
  },
];

async function getActiveRaffles(): Promise<RaffleWithStats[]> {
  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "true") {
    return MOCK_RAFFLES;
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const { data: raffles, error } = await supabase
      .from("raffles")
      .select(`*, purchases(total_tickets, payment_status)`)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !raffles) return [];

    return raffles.map((r) => {
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
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const raffles = await getActiveRaffles();

  if (raffles.length === 0) {
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
    <main className="flex-1 flex flex-col min-h-screen hero-gradient">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#8B5CF6]/6 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8">
        {/* Page title */}
        <h1 className="font-black text-3xl sm:text-4xl text-[#00F0FF] tracking-tight leading-tight text-center">
          LOS PREMIOS<br className="sm:hidden" /> DEL MONIN
        </h1>

        {/* Raffles — centered, max 3 per row */}
        <div className="flex flex-wrap justify-center gap-6">
          {raffles.map((raffle, i) => (
            <div
              key={raffle.id}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm"
            >
              <RaffleHero raffle={raffle} index={i} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#94A3B8]/50 mt-2">
          Pago via Yape / Plin · Verificación manual · Solo Perú
        </p>
      </div>
    </main>
  );
}
