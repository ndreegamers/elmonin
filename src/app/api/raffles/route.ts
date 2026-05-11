import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MOCK_RAFFLES = [
  {
    id: "preview-raffle-001",
    title: "iPhone 16 Pro Max 256GB",
    description: "El smartphone más potente de Apple. Natural Titanium, 256GB. Incluye caja y accesorios originales.",
    image_url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90",
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

export async function GET() {
  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "true") {
    return NextResponse.json({ raffles: MOCK_RAFFLES });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("raffles")
      .select(`*, tickets_sold:purchases(total_tickets)`)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const raffles = (data ?? []).map((r: {
      purchases?: Array<{ total_tickets: number; payment_status?: string }>;
      total_tickets: number;
      [key: string]: unknown;
    }) => {
      const approvedPurchases = (r.purchases ?? []).filter(
        (p: { payment_status?: string }) => p.payment_status === "approved"
      );
      const ticketsSold = approvedPurchases.reduce(
        (sum: number, p: { total_tickets: number }) => sum + (p.total_tickets || 0),
        0
      );
      const soldPercentage =
        r.total_tickets > 0
          ? Math.min(100, (ticketsSold / r.total_tickets) * 100)
          : 0;

      const { purchases: _p, ...raffle } = r;
      return { ...raffle, tickets_sold: ticketsSold, sold_percentage: Number(soldPercentage.toFixed(1)) };
    });

    return NextResponse.json({ raffles });
  } catch {
    return NextResponse.json({ raffles: [] });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, image_url, ticket_price, total_tickets, draw_date, code_prefix } = body;

  if (!title || !image_url || !ticket_price || !total_tickets || !draw_date || !code_prefix) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "true") {
    return NextResponse.json({ error: "Preview mode: conecta Supabase para crear sorteos reales" }, { status: 503 });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("raffles")
      .insert({
        title, description, image_url, ticket_price, total_tickets, draw_date,
        code_prefix: code_prefix.toUpperCase().slice(0, 3),
        status: "active",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ raffle: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
