"use client";

import { useMemo, useState } from "react";
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { ExpenseWithConversion } from "@/lib/types";
import { CATEGORY_COLORS, FALLBACK_COLORS } from "@/lib/constants";

// Extracted from page.tsx to represent the complete expense
type ExpenseChartProps = {
    expenses: ExpenseWithConversion[];
};

export function ExpenseCharts({ expenses }: ExpenseChartProps) {
    const [chartType, setChartType] = useState<"bar" | "pie">("bar");
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

    // Group by category and sum up the 'usd' converted value
    const data = useMemo(() => {
        const categoryTotals: Record<string, number> = {};

        expenses.forEach((expense) => {
            const cat = expense.category?.trim() || "Sin categoría";
            if (!categoryTotals[cat]) {
                categoryTotals[cat] = 0;
            }
            categoryTotals[cat] += expense.converted.usd;
        });

        const chartData = Object.keys(categoryTotals).map((key) => ({
            name: key,
            value: Number(categoryTotals[key].toFixed(2)),
        }));

        // Sort the data
        chartData.sort((a, b) => {
            if (sortOrder === "desc") return b.value - a.value;
            return a.value - b.value;
        });

        return chartData;
    }, [expenses, sortOrder]);

    if (expenses.length === 0) {
        return (
            <div className="cozy-panel rounded-2xl p-6 flex items-center justify-center min-h-[300px]">
                <p className="text-[#f0d9c7]">No hay datos para mostrar gráficos.</p>
            </div>
        );
    }

    const toggleChart = () => setChartType((prev) => (prev === "bar" ? "pie" : "bar"));
    const toggleSort = () => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));

    return (
        <div className="cozy-panel rounded-2xl p-5 border border-[#ffd4b810]">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-semibold text-[#fff0e5]">Gastos por Categoría (USD)</h2>
                <div className="flex gap-2">
                    <button
                        onClick={toggleSort}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-[#fff4eb10] hover:bg-[#fff4eb20] text-[#ffe9d7] transition-colors"
                        title={sortOrder === "desc" ? "Ordenar de menor a mayor" : "Ordenar de mayor a menor"}
                    >
                        {sortOrder === "desc" ? <ArrowDownWideNarrow size={16} /> : <ArrowUpNarrowWide size={16} />}
                        <span className="hidden sm:inline">Ordenar</span>
                    </button>
                    <button
                        onClick={toggleChart}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-[#fff4eb10] hover:bg-[#fff4eb20] text-[#ffe9d7] transition-colors"
                    >
                        {chartType === "bar" ? <PieChartIcon size={16} /> : <BarChart3 size={16} />}
                        <span className="hidden sm:inline">{chartType === "bar" ? "Ver Dona" : "Ver Barras"}</span>
                    </button>
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === "bar" ? (
                        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffd4b815" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#f0d9c7"
                                tick={{ fill: "#f0d9c7", fontSize: 12 }}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#f0d9c7"
                                tick={{ fill: "#f0d9c7", fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: "#ffd4b80a" }}
                                contentStyle={{ backgroundColor: "#1a1512", borderColor: "#ffd4b820", borderRadius: "12px", color: "#fff0e5" }}
                                itemStyle={{ color: "#fff0e5" }}
                                formatter={(value: any) => [`$${value}`, "Total"]}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {data.map((entry, index) => {
                                    const fillColor = CATEGORY_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                                })}
                            </Bar>
                        </RechartsBarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={120}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => {
                                    const fillColor = CATEGORY_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                                })}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1a1512", borderColor: "#ffd4b820", borderRadius: "12px", color: "#fff0e5" }}
                                itemStyle={{ color: "#fff0e5" }}
                                formatter={(value: any) => [`$${value}`, "Total"]}
                            />
                            <Legend
                                wrapperStyle={{ color: "#f0d9c7", fontSize: "12px" }}
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                            />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
