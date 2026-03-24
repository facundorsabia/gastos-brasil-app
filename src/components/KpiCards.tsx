"use client";

type Currency = "USD" | "BRL" | "ARS";

type SummaryData = {
    total: { usd: number; brl: number; ars: number };
    contributions: {
        TEFI: { usd: number; brl: number; ars: number };
        FACU: { usd: number; brl: number; ars: number };
        SHARED: { usd: number; brl: number; ars: number };
    };
};

const format = (amount: number, currency: Currency) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "ARS" ? 0 : 2,
    }).format(amount);

interface KpiCardsProps {
    summary: SummaryData;
}

export function KpiCards({ summary }: KpiCardsProps) {
    return (
        <div className="space-y-6">
            {/* Main Totals */}
            <section className="grid gap-4 md:grid-cols-3">
                <article className="cozy-panel flex flex-col justify-center rounded-2xl p-5 hover:-translate-y-1 transition-transform bg-gradient-to-br from-[#fff4eb10] to-transparent border border-[#ffd4b820] shadow-sm overflow-hidden min-w-0">
                    <p className="text-sm font-medium tracking-wide text-[#f0d9c7] uppercase truncate">Total USD</p>
                    <p className="text-2xl lg:text-3xl font-bold mt-2 text-emerald-400 truncate">{format(summary.total.usd, "USD")}</p>
                </article>
                <article className="cozy-panel flex flex-col justify-center rounded-2xl p-5 hover:-translate-y-1 transition-transform bg-gradient-to-br from-[#fff4eb10] to-transparent border border-[#ffd4b820] shadow-sm overflow-hidden min-w-0">
                    <p className="text-sm font-medium tracking-wide text-[#f0d9c7] uppercase truncate">Total BRL</p>
                    <p className="text-2xl lg:text-3xl font-bold mt-2 text-[#fff0e5] truncate">{format(summary.total.brl, "BRL")}</p>
                </article>
                <article className="cozy-panel flex flex-col justify-center rounded-2xl p-5 hover:-translate-y-1 transition-transform bg-gradient-to-br from-[#fff4eb10] to-transparent border border-[#ffd4b820] shadow-sm overflow-hidden min-w-0">
                    <p className="text-sm font-medium tracking-wide text-[#f0d9c7] uppercase truncate">Total ARS</p>
                    <p className="text-2xl lg:text-3xl font-bold mt-2 text-[#fff0e5] truncate">{format(summary.total.ars, "ARS")}</p>
                </article>
            </section>

            {/* Contributions Breakdown */}
            <section className="grid gap-4 md:grid-cols-3">
                <article className="cozy-panel rounded-2xl p-4 border border-[#ffd4b810] bg-[#1a1512]/40 overflow-hidden min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full min-w-[8px] bg-[#f4a261]"></div>
                        <p className="text-xs text-[#f0d9c7] truncate">Aportado por Tefi (Equiv. USD)</p>
                    </div>
                    <p className="text-xl lg:text-2xl font-semibold text-[#ffe9d7] truncate">{format(summary.contributions.TEFI.usd, "USD")}</p>
                </article>
                <article className="cozy-panel rounded-2xl p-4 border border-[#ffd4b810] bg-[#1a1512]/40 overflow-hidden min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full min-w-[8px] bg-[#2a9d8f]"></div>
                        <p className="text-xs text-[#f0d9c7] truncate">Aportado por Facu (Equiv. USD)</p>
                    </div>
                    <p className="text-xl lg:text-2xl font-semibold text-[#ffe9d7] truncate">{format(summary.contributions.FACU.usd, "USD")}</p>
                </article>
                <article className="cozy-panel rounded-2xl p-4 border border-[#ffd4b810] bg-[#1a1512]/40 overflow-hidden min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full min-w-[8px] bg-[#e76f51]"></div>
                        <p className="text-xs text-[#f0d9c7] truncate">Compartido (Equiv. USD)</p>
                    </div>
                    <p className="text-xl lg:text-2xl font-semibold text-[#ffe9d7] truncate">{format(summary.contributions.SHARED.usd, "USD")}</p>
                </article>
            </section>
        </div>
    );
}
