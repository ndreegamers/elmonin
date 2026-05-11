import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateBonus } from "@/lib/constants";
import { MAX_RECEIPT_SIZE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const raffle_id = formData.get("raffle_id") as string;
    const dni = formData.get("dni") as string;
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const phone = (formData.get("phone") as string) || null;
    const tickets_paid = parseInt(formData.get("tickets_paid") as string, 10);
    const payment_method = formData.get("payment_method") as string;
    const receipt = formData.get("receipt") as File | null;

    // Validations
    if (!raffle_id || !dni || !first_name || !last_name || !tickets_paid || !payment_method) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (!/^\d{8}$/.test(dni)) {
      return NextResponse.json({ error: "DNI inválido" }, { status: 400 });
    }

    if (!["yape", "plin"].includes(payment_method)) {
      return NextResponse.json({ error: "Método de pago inválido" }, { status: 400 });
    }

    if (!receipt || receipt.size === 0) {
      return NextResponse.json({ error: "Debes subir tu comprobante de pago" }, { status: 400 });
    }

    if (receipt.size > MAX_RECEIPT_SIZE * 3) {
      return NextResponse.json({ error: "El archivo es muy grande (máx 6MB)" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify raffle exists and is active
    const { data: raffle, error: raffleError } = await supabase
      .from("raffles")
      .select("id, ticket_price, status")
      .eq("id", raffle_id)
      .eq("status", "active")
      .maybeSingle();

    if (raffleError || !raffle) {
      return NextResponse.json({ error: "Sorteo no encontrado o inactivo" }, { status: 404 });
    }

    // Upsert participant
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .upsert(
        { dni, first_name, last_name, phone },
        { onConflict: "dni", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: "Error al registrar participante" }, { status: 500 });
    }

    // Upload receipt to Supabase Storage
    const receiptBuffer = Buffer.from(await receipt.arrayBuffer());
    const ext = receipt.type === "image/png" ? "png" : "jpg";
    const receiptPath = `${raffle_id}/${participant.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(receiptPath, receiptBuffer, {
        contentType: receipt.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Error al subir comprobante" }, { status: 500 });
    }

    // Calculate totals
    const tickets_bonus = calculateBonus(tickets_paid);
    const total_tickets = tickets_paid + tickets_bonus;
    const total_amount = tickets_paid * raffle.ticket_price;

    // Insert purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        raffle_id,
        participant_id: participant.id,
        tickets_paid,
        tickets_bonus,
        total_tickets,
        total_amount,
        payment_method,
        receipt_url: receiptPath,
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (purchaseError || !purchase) {
      // Rollback: delete uploaded receipt
      await supabase.storage.from("receipts").remove([receiptPath]);
      return NextResponse.json({ error: "Error al registrar compra" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        purchase_id: purchase.id,
        tickets_paid,
        tickets_bonus,
        total_tickets,
        total_amount,
        payment_method,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/tickets error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
