"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Currency = "USD" | "BRL" | "ARS";
type Person = "TEFI" | "FACU";
type PaidBy = Person | "SHARED";

type Expense = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  currency: Currency;
  createdBy: Person;
  paidBy: PaidBy;
  converted: { usd: number; brl: number; ars: number };
};

type SessionUser = {
  name: string;
  username: string;
};

type Filters = {
  person: "ALL" | Person;
  category: string;
  startDate: string;
  endDate: string;
};

type ExpenseForm = {
  title: string;
  category: string;
  date: string;
  amount: string;
  currency: Currency;
  createdBy: Person;
  paidBy: PaidBy;
};

const initialForm: ExpenseForm = {
  title: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  amount: "",
  currency: "BRL",
  createdBy: "TEFI",
  paidBy: "SHARED",
};

const format = (amount: number, currency: Currency) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(amount);

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<Filters>({ person: "ALL", category: "", startDate: "", endDate: "" });
  const [form, setForm] = useState<ExpenseForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const expensesPayload = (await expensesResponse.json()) as { expenses: Expense[] };
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

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (filters.person !== "ALL" && expense.createdBy !== filters.person) return false;
      if (filters.category && !expense.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
      if (filters.startDate && expense.date < filters.startDate) return false;
      if (filters.endDate && expense.date > filters.endDate) return false;
      return true;
    });
  }, [expenses, filters]);

  const summary = useMemo(() => {
    return filteredExpenses.reduce(
      (acc, expense) => {
        acc.total.usd += expense.converted.usd;
        acc.total.brl += expense.converted.brl;
        acc.total.ars += expense.converted.ars;

        acc.contributions[expense.paidBy].usd += expense.converted.usd;
        acc.contributions[expense.paidBy].brl += expense.converted.brl;
        acc.contributions[expense.paidBy].ars += expense.converted.ars;
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
  }, [filteredExpenses]);

  const saveExpense = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const body = {
        title: form.title,
        category: form.category,
        date: form.date,
        amount: Number(form.amount),
        currency: form.currency,
        createdBy: form.createdBy,
        paidBy: form.paidBy,
      };

      const url = editingId ? `/api/expenses/${editingId}` : "/api/expenses";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        setError("No se pudo guardar el gasto. Revisá los datos.");
        return;
      }

      setForm(initialForm);
      setEditingId(null);
      await loadData();
    } catch {
      setError("Error guardando el gasto");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      category: expense.category,
      date: expense.date,
      amount: String(expense.amount),
      currency: expense.currency,
      createdBy: expense.createdBy,
      paidBy: expense.paidBy,
    });
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este gasto?")) return;

    const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (response.ok) {
      await loadData();
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (loading) {
    return <main className="cozy-shell p-6 text-[#fff0e5]">Cargando...</main>;
  }

  return (
    <main className="cozy-shell p-4 text-[#fff0e5] md:p-6">
      <header className="stagger-1 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="cozy-pill inline-flex rounded-full px-3 py-1 text-xs tracking-[0.2em] text-[#ffd8b6]">TRIP TRACKER</p>
          <h1 className="mt-3 text-4xl font-semibold">Dashboard de gastos</h1>
          <p className="mt-1 text-sm text-[#f3ddcc]">Usuario: {user?.name}</p>
        </div>
        <button onClick={logout} className="cozy-pill rounded-xl px-3 py-2 text-sm text-[#ffe9d7] hover:bg-[#ffd9bd1f]">
          Cerrar sesión
        </button>
      </header>

      <section className="stagger-2 grid gap-3 md:grid-cols-3">
        <article className="cozy-panel rounded-2xl p-4">
          <p className="text-xs text-[#f0d9c7]">Total USD</p>
          <p className="text-xl font-semibold">{format(summary.total.usd, "USD")}</p>
        </article>
        <article className="cozy-panel rounded-2xl p-4">
          <p className="text-xs text-[#f0d9c7]">Total BRL</p>
          <p className="text-xl font-semibold">{format(summary.total.brl, "BRL")}</p>
        </article>
        <article className="cozy-panel rounded-2xl p-4">
          <p className="text-xs text-[#f0d9c7]">Total ARS</p>
          <p className="text-xl font-semibold">{format(summary.total.ars, "ARS")}</p>
        </article>
      </section>

      <section className="stagger-2 mt-4 grid gap-3 md:grid-cols-3">
        <article className="cozy-panel rounded-2xl p-4">
          <p className="text-xs text-[#f0d9c7]">Aportado por Tefi (USD)</p>
          <p className="text-lg font-semibold">{format(summary.contributions.TEFI.usd, "USD")}</p>
        </article>
        <article className="cozy-panel rounded-2xl p-4">
          <p className="text-xs text-[#f0d9c7]">Aportado por Facu (USD)</p>
          <p className="text-lg font-semibold">{format(summary.contributions.FACU.usd, "USD")}</p>
        </article>
        <article className="cozy-panel rounded-2xl p-4">
          <p className="text-xs text-[#f0d9c7]">Compartido (USD)</p>
          <p className="text-lg font-semibold">{format(summary.contributions.SHARED.usd, "USD")}</p>
        </article>
      </section>

      <section className="stagger-3 mt-6 rounded-2xl cozy-panel p-4 md:p-5">
        <h2 className="mb-4 text-lg font-semibold">{editingId ? "Editar gasto" : "Nuevo gasto"}</h2>

        <form className="grid gap-3 md:grid-cols-3" onSubmit={saveExpense}>
          <input
            required
            placeholder="Título"
            className="rounded-xl px-3 py-2"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />

          <input
            placeholder="Categoría"
            className="rounded-xl px-3 py-2"
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
          />

          <input
            required
            type="date"
            className="rounded-xl px-3 py-2"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
          />

          <input
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="Monto"
            className="rounded-xl px-3 py-2"
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
          />

          <select
            className="rounded-xl px-3 py-2"
            value={form.currency}
            onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value as Currency }))}
          >
            <option value="USD">USD</option>
            <option value="BRL">BRL</option>
            <option value="ARS">ARS</option>
          </select>

          <select
            className="rounded-xl px-3 py-2"
            value={form.createdBy}
            onChange={(event) => setForm((current) => ({ ...current, createdBy: event.target.value as Person }))}
          >
            <option value="TEFI">Tefi</option>
            <option value="FACU">Facu</option>
          </select>

          <select
            className="rounded-xl px-3 py-2"
            value={form.paidBy}
            onChange={(event) => setForm((current) => ({ ...current, paidBy: event.target.value as PaidBy }))}
          >
            <option value="TEFI">Pagó Tefi</option>
            <option value="FACU">Pagó Facu</option>
            <option value="SHARED">Compartido</option>
          </select>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              disabled={saving}
              type="submit"
              className="cozy-cta rounded-xl px-3 py-2 disabled:opacity-60"
            >
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="cozy-pill rounded-xl px-3 py-2 text-[#ffe9d7]"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>

        {error ? <p className="mt-3 rounded-xl bg-red-950/40 px-3 py-2 text-sm text-red-100">{error}</p> : null}
      </section>

      <section className="stagger-3 mt-6 rounded-2xl cozy-panel p-4 md:p-5">
        <h2 className="mb-4 text-lg font-semibold">Filtros</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={filters.person}
            className="rounded-xl px-3 py-2"
            onChange={(event) => setFilters((current) => ({ ...current, person: event.target.value as Filters["person"] }))}
          >
            <option value="ALL">Todos</option>
            <option value="TEFI">Tefi</option>
            <option value="FACU">Facu</option>
          </select>

          <input
            placeholder="Categoría"
            className="rounded-xl px-3 py-2"
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
          />

          <input
            type="date"
            className="rounded-xl px-3 py-2"
            value={filters.startDate}
            onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
          />

          <input
            type="date"
            className="rounded-xl px-3 py-2"
            value={filters.endDate}
            onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
          />
        </div>
      </section>

      <section className="stagger-3 mt-6 rounded-2xl cozy-panel p-4 md:p-5">
        <h2 className="mb-4 text-lg font-semibold">Gastos ({filteredExpenses.length})</h2>

        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <p className="text-sm text-[#f5dfce]">No hay gastos para los filtros actuales.</p>
          ) : (
            filteredExpenses.map((expense) => (
              <article key={expense.id} className="rounded-xl border border-[#ffd4b84a] bg-[#fff4eb12] p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{expense.title}</h3>
                    <p className="text-sm text-[#f5dfce]">
                      {expense.date} · {expense.category || "Sin categoría"} · Cargó {expense.createdBy}
                    </p>
                    <p className="mt-2 text-sm text-[#fff2e7]">
                      Original: {format(expense.amount, expense.currency)} · Pagó: {expense.paidBy}
                    </p>
                    <p className="text-sm text-[#f3d8c4]">
                      Eq: {format(expense.converted.usd, "USD")} | {format(expense.converted.brl, "BRL")} | {format(expense.converted.ars, "ARS")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="cozy-pill rounded-lg px-3 py-1 text-sm text-[#ffe9d7]" onClick={() => onEdit(expense)}>
                      Editar
                    </button>
                    <button className="cozy-danger rounded-lg px-3 py-1 text-sm" onClick={() => onDelete(expense.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
