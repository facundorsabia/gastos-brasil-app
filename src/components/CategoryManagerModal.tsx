"use client";

import { useState, useEffect } from "react";
import { X, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Category } from "@/lib/types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onSuccess: () => void;
}

export function CategoryManagerModal({ isOpen, onClose, categories, onSuccess }: Props) {
    const [newCatName, setNewCatName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States for line-item editing
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    // States for deleting
    const [deletingCatName, setDeletingCatName] = useState<string | null>(null);
    const [deleteAction, setDeleteAction] = useState<"reassign" | "delete">("reassign");
    const [reassignCategory, setReassignCategory] = useState("");

    useEffect(() => {
        if (isOpen) {
            setNewCatName("");
            setEditingCatId(null);
            setDeletingCatName(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAdd = async () => {
        const trimmed = newCatName.trim();
        if (!trimmed) return;
        const cap = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: cap })
            });
            if (res.ok) {
                setNewCatName("");
                onSuccess();
            } else {
                const body = await res.json();
                alert(body.error || "Error al añadir categoría");
            }
        } catch {
            alert("Error de red");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRename = async (oldName: string) => {
        const trimmed = editValue.trim();
        if (!trimmed || trimmed === oldName) {
            setEditingCatId(null);
            return;
        }
        const cap = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/categories/manage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "RENAME", oldCategory: oldName, newCategory: cap })
            });
            if (res.ok) {
                setEditingCatId(null);
                onSuccess();
            } else {
                const body = await res.json();
                alert(body.error || "Error al renombrar categoría");
            }
        } catch {
            alert("Error de red");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingCatName) return;
        setIsSubmitting(true);
        try {
            const body = deleteAction === "reassign"
                ? { action: "REASSIGN", oldCategory: deletingCatName, newCategory: reassignCategory }
                : { action: "DELETE_EXPENSES", category: deletingCatName };

            const res = await fetch("/api/categories/manage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setDeletingCatName(null);
                onSuccess();
            } else {
                const body = await res.json();
                alert(body.error || "Error al procesar la eliminación");
            }
        } catch {
            alert("Error de red");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 pt-16 md:pt-24 overflow-y-auto">
            <div className="relative w-full max-w-lg bg-[#1c1714] border border-[#ffd4b820] rounded-2xl shadow-2xl cozy-shell mb-10 overflow-hidden">

                <header className="flex items-center justify-between p-5 border-b border-[#ffd4b810] bg-[#1f1a16]/50">
                    <h2 className="text-xl font-semibold text-[#fff0e5]">
                        Gestionar Categorías
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-[#f0d9c7] hover:bg-[#fff4eb10] rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </header>

                <section className="p-5 flex flex-col gap-4">

                    <div className="flex gap-2 mb-2">
                        <input
                            placeholder="Nueva categoría..."
                            className="flex-1 rounded-xl px-4 py-2.5 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] placeholder:text-[#f0d9c7]/40 focus:outline-none focus:border-[#f4a261]"
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAdd();
                                }
                            }}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={isSubmitting || !newCatName.trim()}
                            className="cozy-cta px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md active:scale-95"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            Añadir
                        </button>
                    </div>

                    <div className="bg-[#120f0d]/50 border border-[#ffd4b810] rounded-xl flex flex-col max-h-[50vh] overflow-y-auto">
                        {categories.map((cat) => (
                            <div key={cat.id} className="group flex flex-col border-b border-[#ffd4b810] last:border-0">
                                <div className="flex items-center justify-between p-3 px-4 hover:bg-[#1f1a16] transition-colors">
                                    {editingCatId === cat.id ? (
                                        <div className="flex-1 flex gap-2 mr-2">
                                            <input
                                                autoFocus
                                                className="flex-1 rounded-lg px-3 py-1.5 bg-[#1c1714] border border-[#f4a261]/50 text-[#fff0e5] text-sm focus:outline-none"
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleRename(cat.name);
                                                    if (e.key === "Escape") setEditingCatId(null);
                                                }}
                                            />
                                            <button
                                                onClick={() => handleRename(cat.name)}
                                                disabled={isSubmitting}
                                                className="text-xs px-3 py-1.5 bg-[#f4a261] text-[#1c1714] font-medium rounded-lg hover:bg-[#e76f51] disabled:opacity-50"
                                            >
                                                OK
                                            </button>
                                            <button
                                                onClick={() => setEditingCatId(null)}
                                                className="text-xs px-2 py-1.5 text-[#f0d9c7] hover:bg-white/5 rounded-lg"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-[#f0d9c7] text-sm font-medium">{cat.name}</p>
                                    )}

                                    {editingCatId !== cat.id && deletingCatName !== cat.name && (
                                        <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingCatId(cat.id); setEditValue(cat.name); setDeletingCatName(null); }}
                                                className="p-2 text-[#f0d9c7] hover:bg-[#fff4eb10] hover:text-[#fff0e5] rounded-xl transition-colors"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setDeletingCatName(cat.name); setEditingCatId(null); setReassignCategory(""); }}
                                                className="p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {deletingCatName === cat.name && (
                                    <div className="p-4 bg-[#281a17] border-t border-red-500/20 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-sm text-[#ffe9d7]">¿Eliminar "{cat.name}"?</p>
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-start gap-2 text-sm text-[#f0d9c7] cursor-pointer hover:text-white">
                                                <input type="radio" name="delActionModal" checked={deleteAction === "reassign"} onChange={() => setDeleteAction("reassign")} className="mt-1 accent-[#f4a261]" />
                                                <span className="flex flex-col gap-1">
                                                    Reasignar gastos a otra categoría
                                                    {deleteAction === "reassign" && (
                                                        <select
                                                            className="rounded-lg px-3 py-2 bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] text-sm mt-1 focus:outline-none w-full max-w-[200px]"
                                                            value={reassignCategory}
                                                            onChange={e => setReassignCategory(e.target.value)}
                                                        >
                                                            <option value="" disabled>Elegir destino...</option>
                                                            {categories.filter(c => c.name !== cat.name).map(c => (
                                                                <option key={c.id} value={c.name}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-2 text-sm text-red-300 cursor-pointer hover:text-red-200">
                                                <input type="radio" name="delActionModal" checked={deleteAction === "delete"} onChange={() => setDeleteAction("delete")} className="accent-red-500" />
                                                Eliminar permanentemente junto con TODOS sus gastos
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-red-500/10">
                                            <button type="button" onClick={() => setDeletingCatName(null)} disabled={isSubmitting} className="text-xs px-3 py-2 text-[#f0d9c7] hover:bg-white/5 rounded-lg transition-colors">Cancelar</button>
                                            <button type="button" onClick={handleConfirmDelete} disabled={isSubmitting || (deleteAction === "reassign" && !reassignCategory)} className="flex items-center gap-2 text-xs px-3 py-2 bg-red-600/90 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                                                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                                                Confirmar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <div className="p-6 text-center text-sm text-[#f0d9c7]/50">No hay categorías cargadas.</div>
                        )}
                    </div>

                </section>
            </div>
        </div>
    );
}
