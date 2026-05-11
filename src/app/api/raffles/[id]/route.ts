import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (process.env.NEXT_PUBLIC_PREVIEW_MODE === "true") {
    return NextResponse.json(
      { error: "Preview mode: conecta Supabase para editar sorteos reales" },
      { status: 503 }
    );
  }

  const body = await request.json();

  // Only allow safe fields — code_prefix is excluded to protect existing ticket codes
  const allowed = ["title", "description", "image_url", "ticket_price", "total_tickets", "draw_date", "status"] as const;
  const updates: Record<string, unknown> = {};
  for (const field of allowed) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("raffles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ raffle: data });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
