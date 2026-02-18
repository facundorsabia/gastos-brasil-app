import { NextResponse } from "next/server";
import { authenticate, buildSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { username?: string; password?: string };
    if (!payload.username || !payload.password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = authenticate(payload.username, payload.password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true, user });
    setSessionCookie(response, buildSessionToken(user));
    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
