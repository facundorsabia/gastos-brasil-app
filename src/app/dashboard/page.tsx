"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, List as ListIcon } from "lucide-react";
import { ExpenseWithConversion, SessionUser } from "@/lib/types";
import { KpiCards } from "@/components/KpiCards";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { ExpenseModal } from "@/components/ExpenseModal";

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [sessionResponse, expensesResponse] = await Promise.all([
        fetch("/api/auth/session", { cache: "no-store" }),
        fetch("/api/expenses", { cache: "no-store" }),
      ]);

      if (!sessionResponse.ok) {
        window.location.href = "/login";
        return;
      }

      const sessionPayload = (await sessionResponse.json()) as { user: SessionUser };
      setUser(sessionPayload.user);

      if (!expensesResponse.ok) {
        setError("No se pudieron cargar los gastos");
        return;
      }

      const expensesPayload = (await expensesResponse.json()) as { expenses: ExpenseWithConversion[] };
      setExpenses(expensesPayload.expenses);
    } catch {
      setError("Error de red cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const summary = useMemo(() => {
    return expenses.reduce(
      (acc, expense) => {
        acc.total.usd += expense.converted.usd;
        acc.total.brl += expense.converted.brl;
        acc.total.ars += expense.converted.ars;

        if (expense.paidBy === "SHARED" && expense.splitDetails) {
          const totalOriginal = expense.amount;
          const ratioTefi = expense.splitDetails.TEFI / totalOriginal;
          const ratioFacu = expense.splitDetails.FACU / totalOriginal;

          acc.contributions.TEFI.usd += expense.converted.usd * ratioTefi;
          acc.contributions.TEFI.brl += expense.converted.brl * ratioTefi;
          acc.contributions.TEFI.ars += expense.converted.ars * ratioTefi;

          acc.contributions.FACU.usd += expense.converted.usd * ratioFacu;
          acc.contributions.FACU.brl += expense.converted.brl * ratioFacu;
          acc.contributions.FACU.ars += expense.converted.ars * ratioFacu;
        } else {
          // If paid by someone specific and not shared
          // Wait, lib/types says PaidBy is Person | "SHARED", where Person = "TEFI" | "FACU"
          // So if not SHARED, it is TEFI or FACU.
          acc.contributions[expense.paidBy as keyof typeof acc.contributions].usd += expense.converted.usd;
          acc.contributions[expense.paidBy as keyof typeof acc.contributions].brl += expense.converted.brl;
          acc.contributions[expense.paidBy as keyof typeof acc.contributions].ars += expense.converted.ars;
        }
        return acc;
      },
      {
        total: { usd: 0, brl: 0, ars: 0 },
        contributions: {
          TEFI: { usd: 0, brl: 0, ars: 0 },
          FACU: { usd: 0, brl: 0, ars: 0 },
          SHARED: { usd: 0, brl: 0, ars: 0 },
        },
      },
    );
  }, [expenses]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (loading) {
    return <main className="cozy-shell flex items-center justify-center min-h-screen text-[#fff0e5]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#f4a261] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium tracking-wide">Cargando...</p>
      </div>
    </main>;
  }

  return (
    <main className="cozy-shell p-4 text-[#fff0e5] md:p-6 min-h-screen">
      <header className="stagger-1 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="cozy-pill inline-flex rounded-full px-3 py-1 text-xs tracking-[0.2em] text-[#ffd8b6]">TRIP TRACKER</p>
          <h1 className="mt-2 text-4xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-[#f3ddcc]">Hola, {user?.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/expenses"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium bg-[#1a1512] border border-[#ffd4b820] hover:bg-[#231d19] transition-colors text-[#f0d9c7]"
          >
            <ListIcon size={16} />
            Ver Detalles
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="cozy-cta flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-lg shadow-[#f4a261]/20 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} />
            Cargar nuevo gasto
          </button>
          <button onClick={logout} className="ml-auto md:ml-2 rounded-xl px-4 py-2.5 text-sm text-[#ffe9d7] hover:bg-[#ffd9bd1f] transition-colors">
            Salir
          </button>
        </div>
      </header>

      {error && <p className="mb-6 rounded-xl bg-red-950/40 border border-red-500/20 px-4 py-3 text-sm text-red-100">{error}</p>}

      <div className="flex flex-col gap-6 items-stretch">
        <section className="stagger-2">
          <KpiCards summary={summary} />
        </section>

        <section className="stagger-3 w-full">
          <ExpenseCharts expenses={expenses} />
        </section>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        user={user}
      />
    </main>
  );
}
