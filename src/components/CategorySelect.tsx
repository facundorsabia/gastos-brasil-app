"use client";

import { Category } from "@/lib/types";

interface CategorySelectProps {
    value: string;
    onChange: (val: string) => void;
    existingCategories?: Category[];
}

export function CategorySelect({ value, onChange, existingCategories = [] }: CategorySelectProps) {
    // If editing an expense with an old category name that was deleted, show it anyway so we don't clear it silently
    const missingValue = value && !existingCategories.some(c => c.name === value);

    return (
        <select
            className="rounded-xl px-4 py-2.5 w-full bg-[#120f0d] border border-[#ffd4b820] text-[#fff0e5] focus:outline-none focus:border-[#f4a261] cursor-pointer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="" disabled>Seleccionar categoría...</option>
            {existingCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
            {missingValue && (
                <option value={value} className="text-red-400">
                    {value} (Eliminada)
                </option>
            )}
        </select>
    );
}
