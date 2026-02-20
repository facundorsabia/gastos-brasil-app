"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError("Credenciales inválidas o usuario no autorizado.");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("No se pudo iniciar sesión. Reintentá.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cozy-shell flex min-h-screen w-full max-w-md items-center p-6">
      <section className="cozy-panel w-full rounded-3xl p-7 text-[#fff6ee] shadow-2xl">
        <p className="cozy-pill inline-flex rounded-full px-3 py-1 text-xs tracking-[0.18em] text-[#ffd8b6]">VACACIONES BRASIL</p>
        <h1 className="mt-3 text-4xl font-semibold">Hola amor! Agendita de gastos Brasil 2026</h1>
        <p className="mt-2 text-sm text-[#f4dcc8]">Acceso privado con usuario y contraseña.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-[#ffe4d0]">Usuario</span>
            <input
              required
              type="text"
              className="w-full rounded-xl px-3 py-2.5"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-[#ffe4d0]">Contraseña</span>
            <input
              required
              type="password"
              className="w-full rounded-xl px-3 py-2.5"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="rounded-xl bg-red-950/40 px-3 py-2 text-sm text-red-100">{error}</p> : null}

          <button
            disabled={loading}
            type="submit"
            className="cozy-cta w-full rounded-xl px-3 py-2.5 font-semibold disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}
