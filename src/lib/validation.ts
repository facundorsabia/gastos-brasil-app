import { CURRENCIES, PAID_BY, PEOPLE, Currency, PaidBy, Person } from "@/lib/types";

const isEnumValue = <T extends readonly string[]>(value: unknown, allowed: T): value is T[number] =>
  typeof value === "string" && allowed.includes(value as T[number]);

const isISODate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export type ExpenseInput = {
  title: string;
  category: string;
  date: string;
  amount: number;
  currency: Currency;
  createdBy: Person;
  paidBy: PaidBy;
};

export const validateExpenseInput = (payload: unknown): ExpenseInput | null => {
  if (!payload || typeof payload !== "object") return null;

  const body = payload as Record<string, unknown>;

  if (typeof body.title !== "string" || body.title.trim().length < 2) return null;
  if (typeof body.category !== "string") return null;
  if (typeof body.date !== "string" || !isISODate(body.date)) return null;
  if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) return null;
  if (!isEnumValue(body.currency, CURRENCIES)) return null;
  if (!isEnumValue(body.createdBy, PEOPLE)) return null;
  if (!isEnumValue(body.paidBy, PAID_BY)) return null;

  return {
    title: body.title.trim(),
    category: body.category.trim(),
    date: body.date,
    amount: Math.round(body.amount * 100) / 100,
    currency: body.currency,
    createdBy: body.createdBy,
    paidBy: body.paidBy,
  };
};

export const validateExpensePatch = (payload: unknown) => {
  const valid = validateExpenseInput(payload);
  return valid;
};
