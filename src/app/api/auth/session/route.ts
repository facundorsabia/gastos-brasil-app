import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mapeamos el email (facu@brasil2026.app -> facu)
  const username = user.email ? user.email.split("@")[0].toUpperCase() : "UNKNOWN";

  return NextResponse.json({ user: { username, name: username } });
}
