"use client";

import { FormEvent, useEffect, useState } from "react";
import { Currency, PaidBy, Person, SessionUser, ExpenseWithConversion } from "@/lib/types";
import { X, Loader2 } from "lucide-react";

type ExpenseFormState = {
    title: string;
    category: string;
    date: string;
    amount: string;
    currency: Currency;
    createdBy: Person;
    paidBy: PaidBy;
    splitDetails: { TEFI: string; FACU: string };
};

const getInitialForm = (user: SessionUser | null): ExpenseFormState => ({
    title: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    currency: "BRL",
    createdBy: (user?.username?.toUpperCase() as Person) || "TEFI",
    paidBy: "TEFI",
    splitDetails: { TEFI: "0", FACU: "0" },
});

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: SessionUser | null;
    expenseToEdit?: ExpenseWithConversion | null;
}

export function ExpenseModal({ isOpen, onClose, onSuccess, user, expenseToEdit }: ExpenseModalProps) {
    const [form, setForm] = useState<ExpenseFormState>(getInitialForm(user));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (expenseToEdit) {
                setForm({
                    title: expenseToEdit.title,
                    category: expenseToEdit.category,
                    date: expenseToEdit.date,
                    amount: String(expenseToEdit.amount),
                    currency: expenseToEdit.currency,
                    createdBy: expenseToEdit.createdBy,
                    paidBy: expenseToEdit.paidBy,
                    splitDetails: expenseToEdit.splitDetails
                        ? { TEFI: String(expenseToEdit.splitDetails.TEFI), FACU: String(expenseToEdit.splitDetails.FACU) }
                        : { TEFI: "0", FACU: "0" },
                });
            } else {
                setForm(getInitialForm(user));
            }
            setError(null);
        }
    }, [isOpen, expenseToEdit, user]);

    if (!isOpen) return null;

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
                createdBy: user.username.toUpperCase() as Person,
                paidBy: form.paidBy,
                splitDetails: form.paidBy === "SHARED"
                    ? { TEFI: Number(form.splitDetails.TEFI), FACU: Number(form.splitDetails.FACU) }
                    : null,
            };

            const editingId = expenseToEdit?.id;
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

            onSuccess();
            onClose();
        } catch {
            setError("Error guardando el gasto");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pt-16 md:pt-24 pb-16">
            <div className="relative w-full max-w-2xl bg-[#1c1714] border border-[#ffd4b820] rounded-2xl shadow-xl cozy-shell">

                <header className="flex items-center justify-between p-5 border-b border-[#ffd4b810]">
                    <h2 className="text-xl font-semibold text-[#fff0e5]">
                        {expenseToEdit ? "Editar Gasto" : "Cargar Nuevo Gasto"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-[#f0d9c7] hover:bg-[#fff4eb10] rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </header>

                <section className="p-5">
                    <form className="grid gap-4 md:grid-cols-2" onSubmit={saveExpense}>

                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-sm text-[#f0d9c7] ml-1">Título</label>
                            <input
                                required
                                placeholder="Ej: Cena en restaurante"
                                className="rounded-xl px-4 py-2.5 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] placeholder:text-[#f0d9c7]/40 focus:outline-none focus:border-[#f4a261]"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-[#f0d9c7] ml-1">Categoría</label>
                            <input
                                placeholder="Ej: Comida, Transporte"
                                className="rounded-xl px-4 py-2.5 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] placeholder:text-[#f0d9c7]/40 focus:outline-none focus:border-[#f4a261]"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-[#f0d9c7] ml-1">Fecha</label>
                            <input
                                required
                                type="date"
                                className="rounded-xl px-4 py-2.5 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] focus:outline-none focus:border-[#f4a261]"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-[#f0d9c7] ml-1">Monto</label>
                            <div className="flex shadow-sm rounded-xl">
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="w-full rounded-l-xl px-4 py-2.5 bg-[#120f0d] border border-r-0 border-[#ffd4b820] text-[#fff0e5] focus:outline-none focus:border-[#f4a261]"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                />
                                <select
                                    className="rounded-r-xl px-3 py-2.5 bg-[#1f1a16] border border-[#ffd4b820] text-[#f0d9c7] cursor-pointer focus:outline-none focus:border-[#f4a261]"
                                    value={form.currency}
                                    onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
                                >
                                    <option value="USD">USD</option>
                                    <option value="BRL">BRL</option>
                                    <option value="ARS">ARS</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-[#f0d9c7] ml-1">¿Quién pagó?</label>
                            <select
                                className="rounded-xl px-4 py-2.5 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] focus:outline-none focus:border-[#f4a261] cursor-pointer"
                                value={form.paidBy}
                                onChange={(e) => {
                                    const val = e.target.value as PaidBy;
                                    setForm((current) => {
                                        const newState = { ...current, paidBy: val };
                                        if (val === "SHARED" && current.amount) {
                                            const half = (Number(current.amount) / 2).toFixed(2);
                                            newState.splitDetails = { TEFI: half, FACU: half };
                                        }
                                        return newState;
                                    });
                                }}
                            >
                                <option value="TEFI">Pagó Tefi</option>
                                <option value="FACU">Pagó Facu</option>
                                <option value="SHARED">Compartido</option>
                            </select>
                        </div>

                        {form.paidBy === "SHARED" && (
                            <div className="md:col-span-2 grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#fff4eb08] border border-[#ffd4b815] mt-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-[#f0d9c7]">Puso Tefi</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="rounded-xl px-3 py-2 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5]"
                                        value={form.splitDetails.TEFI}
                                        onChange={(e) => {
                                            const tefiVal = e.target.value;
                                            const total = Number(form.amount) || 0;
                                            const facuVal = Math.max(0, total - Number(tefiVal)).toFixed(2);
                                            setForm({ ...form, splitDetails: { TEFI: tefiVal, FACU: facuVal } });
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-[#f0d9c7]">Puso Facu</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="rounded-xl px-3 py-2 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5]"
                                        value={form.splitDetails.FACU}
                                        onChange={(e) => {
                                            const facuVal = e.target.value;
                                            const total = Number(form.amount) || 0;
                                            const tefiVal = Math.max(0, total - Number(facuVal)).toFixed(2);
                                            setForm({ ...form, splitDetails: { TEFI: tefiVal, FACU: facuVal } });
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="md:col-span-2 mt-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        <div className="md:col-span-2 flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#ffd4b810]">
                            <button
                                type="button"
                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#f0d9c7] hover:bg-[#fff4eb10] transition-colors"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={saving}
                                type="submit"
                                className="cozy-cta flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium disabled:opacity-70 transition-transform active:scale-95 shadow-lg shadow-[#f4a261]/20"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : expenseToEdit ? (
                                    "Actualizar Gasto"
                                ) : (
                                    "Guardar Gasto"
                                )}
                            </button>
                        </div>

                    </form>
                </section>
            </div>
        </div>
    );
}
