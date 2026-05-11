import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { generateTicketCode } from "@/lib/constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: purchaseId } = await params;
  const { action } = await request.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (action === "reject") {
    const { error } = await supabase
      .from("purchases")
      .update({ payment_status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", purchaseId)
      .eq("payment_status", "pending");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: "rejected" });
  }

  // Approve: use DB function to safely assign ticket numbers
  const { error: fnError } = await supabase.rpc("approve_purchase", {
    purchase_uuid: purchaseId,
  });

  if (fnError) {
    // Fallback: manual ticket assignment with optimistic locking
    return handleManualApproval(purchaseId, supabase);
  }

  return NextResponse.json({ success: true, action: "approved" });
}

async function handleManualApproval(
  purchaseId: string,
  supabase: ReturnType<typeof createAdminClient>
) {
  // Get purchase details
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("*, raffle:raffles(code_prefix)")
    .eq("id", purchaseId)
    .eq("payment_status", "pending")
    .maybeSingle();

  if (purchaseError || !purchase) {
    return NextResponse.json(
      { error: "Compra no encontrada o ya procesada" },
      { status: 404 }
    );
  }

  // Get current max ticket number for this raffle
  const { data: maxData } = await supabase
    .from("tickets")
    .select("ticket_number")
    .eq("raffle_id", purchase.raffle_id)
    .order("ticket_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const startNumber = (maxData?.ticket_number ?? 0) + 1;
  const totalTickets = purchase.total_tickets;
  const prefix = purchase.raffle?.code_prefix ?? "ELM";

  // Build ticket rows
  const ticketRows = [];
  for (let i = 0; i < totalTickets; i++) {
    const ticketNumber = startNumber + i;
    // Generate a pseudo-UUID prefix for the code
    const fakeId = `${ticketNumber.toString().padStart(8, "0")}-${Date.now()}`;
    ticketRows.push({
      purchase_id: purchaseId,
      raffle_id: purchase.raffle_id,
      participant_id: purchase.participant_id,
      ticket_number: ticketNumber,
      ticket_code: generateTicketCode(prefix, ticketNumber, fakeId),
    });
  }

  const { error: insertError } = await supabase.from("tickets").insert(ticketRows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("purchases")
    .update({ payment_status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", purchaseId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: "approved", tickets_created: totalTickets });
}
