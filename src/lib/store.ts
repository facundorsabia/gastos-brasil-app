import { supabase } from "@/lib/supabase";
import { Expense } from "@/lib/types";

export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);
  return (data ?? []) as Expense[];
};

export const createExpense = async (
  input: Omit<Expense, "id" | "createdAt" | "updatedAt">,
): Promise<Expense> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("expenses")
    .insert({ ...input, createdAt: now, updatedAt: now })
    .select()
    .single();

  if (error) throw new Error(`Failed to create expense: ${error.message}`);
  return data as Expense;
};

export const updateExpense = async (
  id: string,
  patch: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>,
): Promise<Expense | null> => {
  const { data, error } = await supabase
    .from("expenses")
    .update({ ...patch, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`Failed to update expense: ${error.message}`);
  }
  return data as Expense;
};

export const removeExpense = async (id: string): Promise<boolean> => {
  const { error, count } = await supabase
    .from("expenses")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(`Failed to delete expense: ${error.message}`);
  return (count ?? 0) > 0;
};
