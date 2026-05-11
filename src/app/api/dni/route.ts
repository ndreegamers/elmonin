import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Simple in-memory cache to avoid burning DNI API quota
const dniCache = new Map<string, { first_name: string; last_name: string; cachedAt: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dni = searchParams.get("dni")?.trim();

  if (!dni || !/^\d{8}$/.test(dni)) {
    return NextResponse.json(
      { error: "DNI debe tener exactamente 8 dígitos numéricos" },
      { status: 400 }
    );
  }

  // 1. Check in-memory cache
  const cached = dniCache.get(dni);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return NextResponse.json({
      success: true,
      dni,
      first_name: cached.first_name,
      last_name: cached.last_name,
    });
  }

  // 2. Check Supabase participants table (DNI already registered)
  try {
    const supabase = createAdminClient();
    const { data: participant } = await supabase
      .from("participants")
      .select("first_name, last_name")
      .eq("dni", dni)
      .maybeSingle();

    if (participant) {
      dniCache.set(dni, {
        first_name: participant.first_name,
        last_name: participant.last_name,
        cachedAt: Date.now(),
      });
      return NextResponse.json({
        success: true,
        dni,
        first_name: participant.first_name,
        last_name: participant.last_name,
      });
    }
  } catch {
    // Continue to API call
  }

  // 3. Call external DNI API
  const apiUrl = process.env.DNI_API_URL;
  const apiToken = process.env.DNI_API_TOKEN;

  console.log("[DNI] apiUrl present:", !!apiUrl, "| apiToken present:", !!apiToken);

  if (!apiUrl || !apiToken) {
    console.error("[DNI] Missing env vars. Keys available:", Object.keys(process.env).filter(k => k.startsWith("DNI")));
    return NextResponse.json(
      { error: "Servicio de consulta DNI no configurado" },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${apiUrl}/${dni}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "No se encontró información para ese DNI" },
        { status: 404 }
      );
    }

    const apiData = await response.json();

    // apiperu.dev response shape: { data: { nombre, apellido_paterno, apellido_materno } }
    const raw = apiData?.data ?? apiData;
    const first_name: string =
      raw?.nombre ?? raw?.nombres ?? raw?.first_name ?? "";
    const composed = `${raw?.apellido_paterno ?? ""} ${raw?.apellido_materno ?? ""}`.trim();
    const last_name: string = composed || (raw?.apellidos ?? raw?.last_name ?? "");

    if (!first_name && !last_name) {
      return NextResponse.json(
        { error: "No se encontró información para ese DNI" },
        { status: 404 }
      );
    }

    dniCache.set(dni, { first_name, last_name, cachedAt: Date.now() });

    return NextResponse.json({ success: true, dni, first_name, last_name });
  } catch {
    return NextResponse.json(
      { error: "Error al consultar el DNI. Intenta nuevamente." },
      { status: 502 }
    );
  }
}
