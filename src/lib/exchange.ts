import { Expense, ExpenseWithConversion, PaidBy } from "@/lib/types";

const BRL_TO_ARS = 280;
const BRL_TO_USD = 0.2;

const round2 = (value: number) => Math.round(value * 100) / 100;

const toBRL = (amount: number, currency: Expense["currency"]) => {
  if (currency === "BRL") return amount;
  if (currency === "USD") return amount * 5;
  return amount / BRL_TO_ARS;
};

export const convertAmount = (amount: number, currency: Expense["currency"]) => {
  const brl = toBRL(amount, currency);
  return {
    brl: round2(brl),
    usd: round2(brl * BRL_TO_USD),
    ars: round2(brl * BRL_TO_ARS),
  };
};

export const withConversion = (expenses: Expense[]): ExpenseWithConversion[] =>
  expenses.map((expense) => ({
    ...expense,
    converted: convertAmount(expense.amount, expense.currency),
  }));

type ContributionSummary = {
  TEFI: { usd: number; brl: number; ars: number };
  FACU: { usd: number; brl: number; ars: number };
  SHARED: { usd: number; brl: number; ars: number };
};

export const summarize = (expenses: ExpenseWithConversion[]) => {
  const totals = { usd: 0, brl: 0, ars: 0 };
  const contributions: ContributionSummary = {
    TEFI: { usd: 0, brl: 0, ars: 0 },
    FACU: { usd: 0, brl: 0, ars: 0 },
    SHARED: { usd: 0, brl: 0, ars: 0 },
  };

  for (const expense of expenses) {
    totals.usd += expense.converted.usd;
    totals.brl += expense.converted.brl;
    totals.ars += expense.converted.ars;

    const bucket = expense.paidBy as PaidBy;
    contributions[bucket].usd += expense.converted.usd;
    contributions[bucket].brl += expense.converted.brl;
    contributions[bucket].ars += expense.converted.ars;
  }

  return {
    totals: {
      usd: round2(totals.usd),
      brl: round2(totals.brl),
      ars: round2(totals.ars),
    },
    contributions: {
      TEFI: {
        usd: round2(contributions.TEFI.usd),
        brl: round2(contributions.TEFI.brl),
        ars: round2(contributions.TEFI.ars),
      },
      FACU: {
        usd: round2(contributions.FACU.usd),
        brl: round2(contributions.FACU.brl),
        ars: round2(contributions.FACU.ars),
      },
      SHARED: {
        usd: round2(contributions.SHARED.usd),
        brl: round2(contributions.SHARED.brl),
        ars: round2(contributions.SHARED.ars),
      },
    },
  };
};
