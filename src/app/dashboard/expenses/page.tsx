"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { ExpenseWithConversion, SessionUser, Person, Category } from "@/lib/types";
import { ExpenseModal } from "@/components/ExpenseModal";

type Filters = {
    person: "ALL" | Person;
    category: string;
    startDate: string;
    endDate: string;
};

const format = (amount: number, currency: string) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "ARS" ? 0 : 2,
    }).format(amount);

export default function ExpensesPage() {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [expenses, setExpenses] = useState<ExpenseWithConversion[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<Filters>({ person: "ALL", category: "", startDate: "", endDate: "" });
    const [editingExpense, setEditingExpense] = useState<ExpenseWithConversion | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [sessionResponse, expensesResponse, categoriesResponse] = await Promise.all([
                fetch("/api/auth/session", { cache: "no-store" }),
                fetch("/api/expenses", { cache: "no-store" }),
                fetch("/api/categories", { cache: "no-store" }),
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
            // Sort expenses by date descending
            const sortedExpenses = expensesPayload.expenses.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setExpenses(sortedExpenses);

            if (categoriesResponse.ok) {
                const catPayload = await categoriesResponse.json();
                setCategories(catPayload.categories || []);
            }
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

    const onEdit = (expense: ExpenseWithConversion) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const onDelete = async (id: string, title: string) => {
        if (!window.confirm(`¿Seguro que quieres eliminar el gasto "${title}"?`)) return;

        try {
            const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (response.ok) {
                await loadData();
            } else {
                alert("Error al eliminar el gasto.");
            }
        } catch {
            alert("Error de red al intentar eliminar.");
        }
    };

    if (loading) {
        return (
            <main className="cozy-shell flex items-center justify-center min-h-screen text-[#fff0e5]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-[#f4a261] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium tracking-wide">Cargando...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="cozy-shell p-4 text-[#fff0e5] md:p-6 min-h-screen">
            <header className="stagger-1 mb-6 flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="p-2 rounded-xl bg-[#1a1512] border border-[#ffd4b820] hover:bg-[#231d19] transition-colors text-[#f0d9c7]"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold">Detalle de Gastos</h1>
                    <p className="text-sm text-[#f3ddcc] mt-1">Administra y filtra todos los registros</p>
                </div>
            </header>

            {error && <p className="mb-6 rounded-xl bg-red-950/40 border border-red-500/20 px-4 py-3 text-sm text-red-100">{error}</p>}

            <section className="stagger-2 mb-6 rounded-2xl cozy-panel p-4 md:p-5 border border-[#ffd4b810]">
                <h2 className="mb-4 text-sm font-medium text-[#f0d9c7] uppercase tracking-wide">Filtros</h2>
                <div className="grid gap-3 md:grid-cols-4">
                    <select
                        value={filters.person}
                        className="rounded-xl px-3 py-2.5 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] focus:outline-none focus:border-[#f4a261]"
                        onChange={(event) => setFilters((current) => ({ ...current, person: event.target.value as Filters["person"] }))}
                    >
                        <option value="ALL">Todas las personas</option>
                        <option value="TEFI">Tefi</option>
                        <option value="FACU">Facu</option>
                    </select>

                    <input
                        placeholder="Buscar por categoría..."
                        className="rounded-xl px-3 py-2.5 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] placeholder:text-[#f0d9c7]/40 focus:outline-none focus:border-[#f4a261]"
                        value={filters.category}
                        onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#f0d9c7] ml-1">Desde</label>
                        <input
                            type="date"
                            className="rounded-xl px-3 py-2 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] focus:outline-none focus:border-[#f4a261]"
                            value={filters.startDate}
                            onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#f0d9c7] ml-1">Hasta</label>
                        <input
                            type="date"
                            className="rounded-xl px-3 py-2 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] focus:outline-none focus:border-[#f4a261]"
                            value={filters.endDate}
                            onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
                        />
                    </div>
                </div>
            </section>

            <section className="stagger-3 rounded-2xl cozy-panel p-4 md:p-5 border border-[#ffd4b810] overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#fff0e5]">Resultados ({filteredExpenses.length})</h2>
                </div>

                {filteredExpenses.length === 0 ? (
                    <div className="py-12 text-center text-[#f0d9c7]">
                        <p className="text-lg">No se encontraron gastos</p>
                        <p className="text-sm opacity-70 mt-1">Prueba ajustar los filtros o registra uno nuevo.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                        <div className="inline-block min-w-full align-middle px-4 md:px-0">
                            <table className="min-w-full divide-y divide-[#ffd4b810]">
                                <thead>
                                    <tr>
                                        <th className="py-3 px-3 text-left text-xs font-medium text-[#f0d9c7] uppercase tracking-wider">Fecha</th>
                                        <th className="py-3 px-3 text-left text-xs font-medium text-[#f0d9c7] uppercase tracking-wider">Detalle</th>
                                        <th className="py-3 px-3 text-left text-xs font-medium text-[#f0d9c7] uppercase tracking-wider">Monto Original</th>
                                        <th className="py-3 px-3 text-left text-xs font-medium text-[#f0d9c7] uppercase tracking-wider hidden md:table-cell">Equiv. USD</th>
                                        <th className="py-3 px-3 text-left text-xs font-medium text-[#f0d9c7] uppercase tracking-wider">Pagó</th>
                                        <th className="py-3 px-3 relative"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#ffd4b80a]">
                                    {filteredExpenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-[#fff4eb08] transition-colors">
                                            <td className="py-4 px-3 whitespace-nowrap text-sm text-[#f5dfce]">
                                                {expense.date}
                                            </td>
                                            <td className="py-4 px-3 text-sm">
                                                <p className="font-medium text-[#ffe9d7]">{expense.title}</p>
                                                <p className="text-xs text-[#f0d9c7]/70 mt-0.5">{expense.category || "Sin categoría"}</p>
                                            </td>
                                            <td className="py-4 px-3 whitespace-nowrap text-sm font-medium text-[#ffe9d7]">
                                                {format(expense.amount, expense.currency)}
                                            </td>
                                            <td className="py-4 px-3 whitespace-nowrap text-sm text-[#f5dfce] hidden md:table-cell">
                                                {format(expense.converted.usd, "USD")}
                                            </td>
                                            <td className="py-4 px-3 whitespace-nowrap text-sm">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ffd4b815] text-[#f0d9c7]">
                                                    {expense.paidBy}
                                                </span>
                                                {expense.paidBy === "SHARED" && expense.splitDetails && (
                                                    <div className="text-[10px] text-[#f0d9c7]/60 mt-1">
                                                        T: {format(expense.splitDetails.TEFI, expense.currency)} | F: {format(expense.splitDetails.FACU, expense.currency)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-3 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => onEdit(expense)}
                                                        className="p-1.5 rounded-lg text-[#f0d9c7] hover:bg-[#fff4eb15] transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(expense.id, expense.title)}
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingExpense(null);
                }}
                onSuccess={loadData}
                user={user}
                expenseToEdit={editingExpense}
                existingCategories={categories}
            />
        </main>
    );
}
