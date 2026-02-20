import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { username?: string; password?: string };
    if (!payload.username || !payload.password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const supabase = await createClient();

    // En Supabase el login requiere email, pero la UI manda username.
    // Vamos a forzar un sufijo de dominio para que actúe como email.
    // ej: facu -> facu@brasil2026.app
    const email = `${payload.username.trim().toLowerCase()}@brasil2026.app`;

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password: payload.password,
    });

    if (error || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, user });
    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
