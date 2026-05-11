import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path requerido" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from("receipts")
    .createSignedUrl(path, 60 * 60); // 1 hour

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "No se pudo generar URL" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
