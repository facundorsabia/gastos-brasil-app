import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Expense } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "expenses.json");

const ensureDataStore = async () => {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "[]", "utf8");
  }
};

export const getExpenses = async () => {
  await ensureDataStore();
  const raw = await readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as Expense[];
  return parsed.sort((a, b) => b.date.localeCompare(a.date));
};

const saveExpenses = async (expenses: Expense[]) => {
  await ensureDataStore();
  await writeFile(DATA_FILE, JSON.stringify(expenses, null, 2), "utf8");
};

export const createExpense = async (
  input: Omit<Expense, "id" | "createdAt" | "updatedAt">,
) => {
  const now = new Date().toISOString();
  const expense: Expense = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  const expenses = await getExpenses();
  expenses.push(expense);
  await saveExpenses(expenses);
  return expense;
};

export const updateExpense = async (
  id: string,
  patch: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>,
) => {
  const expenses = await getExpenses();
  const index = expenses.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: Expense = {
    ...expenses[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  expenses[index] = updated;
  await saveExpenses(expenses);
  return updated;
};

export const removeExpense = async (id: string) => {
  const expenses = await getExpenses();
  const filtered = expenses.filter((item) => item.id !== id);
  if (filtered.length === expenses.length) return false;
  await saveExpenses(filtered);
  return true;
};
