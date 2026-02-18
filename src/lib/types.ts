export const CURRENCIES = ["USD", "BRL", "ARS"] as const;
export const PEOPLE = ["TEFI", "FACU"] as const;
export const PAID_BY = ["TEFI", "FACU", "SHARED"] as const;

export type Currency = (typeof CURRENCIES)[number];
export type Person = (typeof PEOPLE)[number];
export type PaidBy = (typeof PAID_BY)[number];

export type Expense = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  currency: Currency;
  createdBy: Person;
  paidBy: PaidBy;
  createdAt: string;
  updatedAt: string;
};

export type SessionUser = {
  name: string;
  username: string;
};

export type ConvertedAmount = {
  usd: number;
  brl: number;
  ars: number;
};

export type ExpenseWithConversion = Expense & {
  converted: ConvertedAmount;
};
